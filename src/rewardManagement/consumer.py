import pika, sys, os, requests
from flask import Flask, request
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


@server.route("/getPoints",methods = ["POST"])
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
            f"http://{os.environ.get('REWARDS_SVC_ADDRESS')}/getPoints",
            json={"body": body.decode(),
                  "properties": properties.correlation_id}
        )
        if response.status_code == 200:
            print("[*Rewards_Service]!! getPoints received")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return "[*Rewards_Service]!! getPoints received"
        else:
            print("[*Rewards_Service]!! getPoints failed")
            ch.basic_nack(delivery_tag=method.delivery_tag)
            return "[*Rewards_Service]!! getPoints failed"



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