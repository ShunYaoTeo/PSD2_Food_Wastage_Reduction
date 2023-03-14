import pika, sys, os, requests
from flask import Flask, request
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
            print("!! getWeight received")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return "!! getWeight received"
        else:
            print("!! getWeight failed")
            ch.basic_nack(delivery_tag=method.delivery_tag)
            return "!! getWeight failed"


    channel.basic_consume(
        queue=os.environ.get("FOOD_WASTE_GATEWAY_QUEUE"), 
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
    except KeyboardInterrupt:
        print("Interupted")
        try: 
            sys.exit(0)
        except SystemExit:
            os._exit(0)