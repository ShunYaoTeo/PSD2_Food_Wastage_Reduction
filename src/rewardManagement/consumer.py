import pika, sys, os, requests
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from multiprocessing import Process
from addPoints import addPoints
server = Flask(__name__)
mysql = MySQL(server)

# config
server.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
server.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
server.config["MYSQL_PASSWORD"] = os.environ.get("MYSQL_PASSWORD")
server.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")
server.config["MYSQL_PORT"] = int(os.environ.get("MYSQL_PORT"))

 #rabbitmq connection
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host="rabbitmq")
)
channel = connection.channel()

def getUserID(userEmail):
    cursor = mysql.connection.cursor()
    res = cursor.execute(
        f"SELECT id FROM auth.user WHERE email = '{userEmail}'"
    )
    if res > 0:
        userID = cursor.fetchone()
        return userID[0]
    else:
        return None

def getPointsOverTimeJson(userID, start_date, end_date, aggregation):
    if aggregation == "daily":
        group_by = "DATE(created_at)"
    elif aggregation == "weekly":
        group_by = "YEARWEEK(created_at)"
    elif aggregation == "monthly":
        group_by = "EXTRACT(YEAR_MONTH FROM created_at)"
    else:
        raise ValueError("Invalid aggregation type")
    
    cursor = mysql.connection.cursor()
    res = cursor.execute(f'''SELECT {group_by} as period, SUM(points) as total_points
                             FROM user_points
                             WHERE user_id = {userID} AND created_at >= '{start_date}' 
                             AND created_at < DATE_ADD('{end_date}', INTERVAL 1 DAY)
                             GROUP BY {group_by}
                             ORDER BY period'''
                        )
    if res > 0:
        rows = cursor.fetchall()
        data = [{'period': row[0], 'points': row[1]} for row in rows]
        return data
    else:
        return []
    
def getRewardsStatusJson(user_id):
    cursor = mysql.connection.cursor()

    # Get the user's rewards points
    res = cursor.execute("SELECT points FROM rewards.user_points WHERE user_id = %s", (user_id,))
    if res > 0:
        user_points = cursor.fetchone()[0]
    else:
        user_points = 0

    # Get the list of available rewards
    res = cursor.execute("SELECT id, name, point_value, description FROM rewards.rewards")
    if res > 0:
        rows = cursor.fetchall()
        available_rewards = [{"id": row[0], "name": row[1], "point_value": row[2], "description": row[3]} for row in rows]
    else:
        available_rewards = []

    return {
        "user_points": user_points,
        "available_rewards": available_rewards
    }
    
    
@server.route("/points-earned-over-time", methods = ["GET"])
def getPointsOverTime():
    if not mysql.connection:
        raise ValueError("MySQL connection not established")

    userEmail = request.headers.get("userEmail")
    userID = getUserID(userEmail)
    if userID is None:
        return "[*Rewards_Service] No User Found", 400

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    aggregation = request.args.get("aggregation", "daily")

    data = getPointsOverTimeJson(userID, start_date, end_date, aggregation)
    return jsonify(data), 200


@server.route("/rewards-status", methods=["GET"])
def getRewardsStatus():
    userEmail = request.headers.get("userEmail")
    user_id = getUserID(userEmail)

    if user_id is None:
        return "[*Rewards_Service] No User Found", 400

    rewards_data = getRewardsStatusJson(user_id)
    return jsonify(rewards_data), 200



@server.route("/addPoints",methods = ["POST"])
def getPoints():
    if not mysql.connection:
        raise ValueError("MySQL connection not established")
    
    body = request.json["body"]
    properties = request.json["properties"]
    
    err = addPoints.getPoints(body, mysql, channel, properties)
    
    if err:
        return err
    else:
        return "success!", 200
    



def main():

    def reward_callback(ch, method, properties, body):
        print("[*Rewards_Service] Request Recieved!")
        response = requests.post(
            f"http://{os.environ.get('REWARDS_SVC_ADDRESS')}/addPoints",
            json={"body": body.decode(),
                  "properties": properties.correlation_id}
        )
        if response.status_code == 200:
            print("[*Rewards_Service]!! addPoints received")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return "[*Rewards_Service]!! addPoints received"
        else:
            print("[*Rewards_Service]!! addPoints failed")
            ch.basic_nack(delivery_tag=method.delivery_tag)
            return "[*Rewards_Service]!! addPoints failed"



    channel.basic_consume(
        queue=os.environ.get("FOODWASTE_REWARD_QUEUE"),
        on_message_callback=reward_callback
    )
    
    print("Waiting for messages. To exit press CTR + C")

    channel.start_consuming()

if __name__ == "__main__":
    try:
        server_process = Process(target=server.run, kwargs={'host': '0.0.0.0', 'port': 9000})
        consumer_process = Process(target=main)
        
        server_process.start()
        consumer_process.start()

        server_process.join()
        consumer_process.join()
    except KeyboardInterrupt:
        print("Interupted")
        try: 
            sys.exit(0)
        except SystemExit:
            os._exit(0)