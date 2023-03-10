import os, pika, json
from flask import Flask, request
from auth_svc import access
from auth_validate import validate
from storage import util

server = Flask(__name__)

connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
channel = connection.channel()

@server.route("/login", methods=["POST"])
def login():
    token, err = access.login(request)

    if not err:
        return token
    else:
        return err

@server.route("/foodwaste", methods=["POST"])
def food_waste():
    access, err = validate.token(request)
    print("access: ", access, ", err: ", err)

    if err:
        print("valid.token.(request) failed: ", err)
        return err
    
    access = json.loads(access)

    if access["admin"]:
        
        err = util.upload(channel, access, "foodwaste")
        if err:
            print("upload failed: ", err)

        return "success!", 200
    else:
        return "not authorized", 401 


@server.route("/rewards", methods=["POST"])
def rewards():
    access, err = validate.token(request)
    print("access: ", access, ", err: ", err)

    if err:
        print("valid.token.(request) failed: ", err)
        return err
    
    access = json.loads(access)

    if access["admin"]:
        err = util.upload(channel, access, "rewards")
        if err:
            print("upload failed: ", err)
            
        return "success!", 200
    else:
        return "not authorized", 401


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=8080)
