import pika, sys, os, requests
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from Food_Waste_Weight import getFoodWasteWeight
from multiprocessing import Process

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



def getRestaurantID(userEmail):
    cursor = mysql.connection.cursor()
    res = cursor.execute(
        "SELECT r.id as restaurant_id FROM auth.user u JOIN foodwaste.restaurants r ON u.id = r.owner_id WHERE u.email = %s", (userEmail,)
    )

    if res > 0:
        user_restaurant = cursor.fetchone()
        return user_restaurant[0]
    else:
        return None
    
def getRestaurantIDAndCategory(userEmail):
    cursor = mysql.connection.cursor()
    res = cursor.execute("SELECT r.id as restaurant_id, r.category as category FROM auth.user u JOIN foodwaste.restaurants r ON u.id = r.owner_id WHERE u.email = %s", (userEmail,))

    if res > 0:
        user_restaurant = cursor.fetchone()
        return user_restaurant[0], user_restaurant[1]
    else:
        return None, None

# Execute Query to get Food Waste By Category in Json Format
def getFoodWasteByCategoryJson(restaurant_id):
    cursor = mysql.connection.cursor()
    res = cursor.execute(f'''SELECT food_type, SUM(weight) as total_waste
                          FROM food_waste
                          WHERE restaurant_id = {restaurant_id}
                          GROUP BY food_type;''')
    if res > 0:
        rows = cursor.fetchall()
        data = [{'food_type': row[0], 'total_waste': row[1]} for row in rows]
        return data
    else:
        return []

# Execute Query to get Food Waste Trends in Json Format
def getFoodWasteTrendsJson(restaurant_id, start_date, end_date):
    cursor = mysql.connection.cursor()
    res = cursor.execute(f'''SELECT DATE(created_at) as date, SUM(weight) as total_waste
                             FROM food_waste
                             WHERE restaurant_id = {restaurant_id} AND created_at >= '{start_date}' AND created_at < DATE_ADD('{end_date}', INTERVAL 1 DAY)
                             GROUP BY DATE(created_at)
                             ORDER BY date'''
                        )
    if res > 0:
        rows = cursor.fetchall()
        data = [{'date': row[0].strftime('%Y-%m-%d'), 'total_waste': row[1]} for row in rows]
        return data
    else:
        return []
    
# Execute Query to get comparisons of similar restaurants in Json Fomat    
def compareFoodWasteJson(restaurant_id, category, start_date, end_date):
    cursor = mysql.connection.cursor()
    # Hard Coded to compare 10 restaurant for now
    num_results = 10
    res = cursor.execute(f'''SELECT r.name, r.id, SUM(fw.weight) as total_waste
                             FROM restaurants r
                             JOIN food_waste fw ON r.id = fw.restaurant_id
                             WHERE r.category = '{category}' AND r.id != {restaurant_id} AND fw.created_at BETWEEN '{start_date}' AND DATE_ADD('{end_date}', INTERVAL 1 DAY)
                             GROUP BY r.id
                             ORDER BY total_waste ASC
                             LIMIT {num_results}'''
                         )

    if res > 0:
        rows = cursor.fetchall()
        data = [{'restaurant_id': row[1], 'restaurant_name': row[0], 'total_waste': row[2]} for row in rows]
        return data
    else:
        return []

# Query to get the top category of food that was wasted
def getTopFoodWasteContributorsJson(restaurant_id, num_contributors):
    if not mysql.connection:
        raise ValueError("MySQL connection not established")
    
    cursor = mysql.connection.cursor()
    
    res = cursor.execute(f'''
                            SELECT food_type, SUM(weight) as total_waste
                            FROM food_waste
                            WHERE restaurant_id = {restaurant_id}
                            GROUP BY food_type
                            ORDER BY total_waste DESC
                            LIMIT {num_contributors}
                            '''
                        )   
    
    if res > 0:
        rows = cursor.fetchall()
        data = [{'food_type': row[0], 'total_waste': row[1]} for row in rows]
        return data
    else:
        return []
    
def getTotalWaste(restaurant_id, start_date, end_date):
    if not mysql.connection:
        raise ValueError("MySQL connection not established")
    
    cursor = mysql.connection.cursor()
    
    res = cursor.execute(f'''
            SELECT SUM(weight) as total_waste
            FROM food_waste
            WHERE restaurant_id = {restaurant_id} AND created_at >= '{start_date}' 
            AND created_at < DATE_ADD('{end_date}', INTERVAL 1 DAY)
            ''')
 
    if res > 0:
        row = cursor.fetchone()
        return row[0] if row[0] is not None else 0
    else:
        return 0
    
def getWasteReductionProgressJson(restaurant_id, old_start_date, old_end_date, new_start_date, new_end_date):
    old_total_waste = getTotalWaste(restaurant_id, old_start_date, old_end_date)
    new_total_waste = getTotalWaste(restaurant_id, new_start_date, new_end_date)
    waste_reduction = old_total_waste - new_total_waste

    return {
        'old_total_waste': old_total_waste,
        'new_total_waste': new_total_waste,
        'waste_reduction': waste_reduction
    }




@server.route("/food-waste-by-category", methods = ["GET"])
def getFoodWasteByCategory():
    if not mysql.connection:
        raise ValueError("MySQL connection not established")
    
    userEmail = request.headers.get("userEmail")
    restaurant_id = getRestaurantID(userEmail)
    
    if restaurant_id is None:
        return "[*Food_Waste_Service] No Restaurant Found For this User"

    data = getFoodWasteByCategoryJson(restaurant_id)
    return jsonify(data), 200



@server.route("/food-waste-trends", methods = ["GET"])
def getFoodWasteTrends():
    if not mysql.connection:
        raise ValueError("MySQL connection not established")

    userEmail = request.headers.get("userEmail")
    restaurant_id = getRestaurantID(userEmail)

    if restaurant_id is None:
        return "[*Food_Waste_Service] No Restaurant Found For this User"

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    data = getFoodWasteTrendsJson(restaurant_id, start_date, end_date)
    return jsonify(data), 200


@server.route("/compare-food-waste", methods = ["GET"])
def compareFoodWaste():
    if not mysql.connection:
        raise ValueError("MySQL connection not established")
    
    userEmail = request.headers.get("userEmail")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    restaurant_id, category = getRestaurantIDAndCategory(userEmail)
    if restaurant_id is None:
        return "[*Food_Waste_Service] No Restaurant Found For this User", 400

    data = compareFoodWasteJson(restaurant_id, category, start_date, end_date)
    return jsonify(data), 200

@server.route("/top-food-waste-contributors", methods = ["GET"])
def getTopFoodWasteContributors():
    userEmail = request.headers.get("userEmail")
    restaurant_id = getRestaurantID(userEmail)
    
    if restaurant_id is None:
        return "[*Food_Waste_Service] No Restaurant Found For this User"
    # Hard Coded to compare 10 restaurant for now
    num_contributors = 10
    data = getTopFoodWasteContributorsJson(restaurant_id, num_contributors)
    return jsonify(data), 200


@server.route("/waste-reduction-progress", methods = ["GET"])
def getWasteReductionProgress():
    userEmail = request.headers.get("userEmail")
    restaurant_id = getRestaurantID(userEmail)
    
    if restaurant_id is None:
        return "[*Food_Waste_Service] No Restaurant Found For this User"

    old_start_date = request.args.get('old_start_date')
    old_end_date = request.args.get('old_end_date')
    new_start_date = request.args.get('new_start_date')
    new_end_date = request.args.get('new_end_date')
    
    data = getWasteReductionProgressJson(restaurant_id, old_start_date, old_end_date, new_start_date, new_end_date)
    return jsonify(data), 200




@server.route("/getWeight", methods = ["POST"])
def getWeight():   
    if not mysql.connection:
        raise ValueError("MySQL connection not established")


    body = request.json["body"]
    properties = request.json["properties"]
    
    err = getFoodWasteWeight.getWeight(body, mysql, channel, properties)
    
    if err:
        return err
    else:
        return "success!", 200

def main():

    def food_waste_callback(ch, method, properties,body):
        print("[*Food_Waste_Service] Request Recieved!")
        response = requests.post(
            f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/getWeight",
            json={"body": body.decode(),
                  "properties": properties.correlation_id}
        )
        if response.status_code == 200:
            print("[*Food_Waste_Service]!! getWeight received")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return "[*Food_Waste_Service]!! getWeight received"
        else:
            print("[*Food_Waste_Service]!! getWeight failed")
            ch.basic_nack(delivery_tag=method.delivery_tag)
            return "[*Food_Waste_Service]!! getWeight failed"


    channel.basic_consume(
        queue=os.environ.get("GATEWAY_FOODWASTE_QUEUE"), 
        on_message_callback=food_waste_callback
    )

    print("Waiting for messages. To exit press CTR + C")

    channel.start_consuming()

if __name__ == "__main__":
    try:
        server_process = Process(target=server.run, kwargs={'host': '0.0.0.0', 'port': 8000})
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