import os, pika, json, uuid, sys
from flask import Flask, request
from flask_cors import CORS
from auth_svc import access
from auth_validate import validate
from storage import util
from multiprocessing import Process, Manager
import threading

lock = threading.Lock()
server = Flask(__name__)
CORS(server)
connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
channel = connection.channel()

manager = Manager()        
correlation_id_dict = manager.dict()

@server.route("/login", methods=["POST"])
def login():
    token, err = access.login(request)

    if not err:
        return token
    else:
        return err

@server.route("/foodwaste", methods=["POST"])
def food_waste():
    #Checking Validation of User's JWT
    access, err = validate.token(request)
    print("access: ", access, ", err: ", err)

    if err:
        print("valid.token.(request) failed: ", err)
        return err
    
    correlation_id = str(uuid.uuid4())
    print("[*Gateway Service] Correlation_id generated: %s", correlation_id)
    with lock:
        correlation_id_dict.update({correlation_id:None})
        print(correlation_id_dict.keys())
    err = util.upload(channel, request, "foodwaste_gateway", correlation_id)
    if err:
        print("upload failed: ", err)

    return "success!", 200
   


@server.route("/rewards", methods=["POST"])
def rewards():
    access, err = validate.token(request)
    print("access: ", access, ", err: ", err)

    if err:
        print("valid.token.(request) failed: ", err)
        return err
    
    access = json.loads(access)

    #no need this for normal operation alr
    if access["admin"]:
        err = util.upload(channel, access, "rewards")
        if err:
            print("upload failed: ", err)
            
        return "success!", 200
    else:
        return "not authorized", 401

@server.route("/test")
def test():
    return{"testing": ["TEST1", "TEST2", "TEST3"]}

@server.route("/validate", methods=["POST"])
def validateCheck():
    access, err = validate.token(request)
    print("access: ", access, ", err: ", err)

    if err:
        return "Fail"
    
    return "Pass"

##########
# For admin functions:
#
# 1) Chech if user has admin properties:
# if access["admin"]:
#     //then carry on with function
# else:
#         return "not authorized", 401
#########


# RABBITMQ message recieve callback functions:
def consume():
   
    def on_response(ch, method, props, body):
        correlation_id = props.correlation_id
        print("[*GATEWAY_SERVICE] Correlation id : %s \n Keys: ", (correlation_id))
        with lock:
            print(correlation_id_dict.keys())
            # Check if the correlation ID matches any of the stored correlation IDs
            if correlation_id in correlation_id_dict:
                
                del correlation_id_dict[correlation_id]
                message = json.loads(body)
                print("[*GATEWAY_SERVICE] Correlation id matched! Retreving message body...")
                print(message)
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return message
            
            else:
                print("[*GATEWAY_SERVICE] Correlation id not match!")
                ch.basic_nack(delivery_tag=method.delivery_tag)
                return 0


    channel.basic_consume(
        queue = os.environ.get("FOOD_WASTE_FOODWASTE_QUEUE"),
        on_message_callback=on_response
    )

    print("Waiting for messages. To exit press CTR + C")

    channel.start_consuming()

if __name__ == "__main__":
    try:
        server_process = Process(target=server.run, kwargs={'host': '0.0.0.0', 'port': 8080})
        consumer_process = Process(target=consume)
        
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