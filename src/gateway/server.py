import os, pika, json, uuid, sys, requests
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

# manager = Manager()        
# correlation_id_dict = manager.dict()

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
        print("[*Gateway Service] validation failed: ", err)
        return err
    
    access = json.loads(access)
    userEmail = access['username']
    correlation_id = str(uuid.uuid4())
    print(f"[*Gateway Service] Correlation_id generated: {correlation_id}")
    # with lock:
    #     correlation_id_dict.update({correlation_id:None})
    #     print(correlation_id_dict.keys())
    response = requests.post(
            f"http://{os.environ.get('AUTH_SVC_ADDRESS')}/store_correlation",
            json={"properties": correlation_id}
        )
    
    if response.status_code == 200:
        err = util.upload(channel, request, userEmail, "gateway_foodwaste", correlation_id)
        
        if err:
            print("[*Gateway Service] upload failed: ", err)
    else:
        return "[*Gateway Service] Store Correlation Failed", 401

    return "success!", 200

@server.route("/claim-reward", methods=["POST"])
def claim_reward():
    #Checking Validation of User's JWT
    access, err = validate.token(request)
    print("access: ", access, ", err: ", err)

    if err:
        print("[*Gateway Service] validation failed: ", err)
        return err
    
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400
    
    rewardId = request.args.get('rewardId')

    response = requests.post(
        f"http://{os.environ.get('REWARDS_SVC_ADDRESS')}/claim-reward",
        headers={"userEmail": userEmail},
        params={'rewardId': rewardId}
    )

    if response.status_code == 200:
        return "success!", 200
    else:
        return "[*Gateway Service] Claim Reward Failed", 401

   
@server.route("/food-waste-by-category", methods = ["GET"])
def getFoodWasteByCategory():
    #Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    response = requests.get(
        f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/food-waste-by-category",
        headers={"userEmail": userEmail},
    )
    return response.content

@server.route("/food-waste-trends", methods = ["GET"])
def getFoodWasteTrends():
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    response = requests.get(
        f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/food-waste-trends",
        headers={"userEmail": userEmail},
        params={'start_date': start_date, 'end_date': end_date}
    )
    return response.content

@server.route("/compare-food-waste", methods = ["GET"])
def compareFoodWaste():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    response = requests.get(
        f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/compare-food-waste",
        headers={"userEmail": userEmail},
        params={"start_date": start_date, "end_date": end_date}
    )
    return response.content

@server.route("/top-food-waste-contributors", methods = ["GET"])
def topFoodWasteContributors():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    response = requests.get(
        f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/top-food-waste-contributors",
        headers={"userEmail": userEmail},
    )
    return response.content

@server.route("/waste-reduction-progress", methods = ["GET"])
def getWasteReductionProgress():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    old_start_date = request.args.get('old_start_date')
    old_end_date = request.args.get('old_end_date')
    new_start_date = request.args.get('new_start_date')
    new_end_date = request.args.get('new_end_date')

    response = requests.get(
        f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/waste-reduction-progress",
        headers={"userEmail": userEmail},
        params={"old_start_date": old_start_date, "old_end_date": old_end_date, "new_start_date": new_start_date, "new_end_date": new_end_date }
    )
    return response.content

@server.route("/food-waste-history", methods = ["GET"])
def getFoodWasteHistory():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    response = requests.get(
        f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/food-waste-history",
        headers={"userEmail": userEmail},
    )
    return response.content

@server.route("/Individual-FoodType-Waste", methods = ["GET"])
def getIndividualFoodTypeWaste():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    response = requests.get(
        f"http://{os.environ.get('FOODWASTE_SVC_ADDRESS')}/Individual-FoodType-Waste",
        headers={"userEmail": userEmail}
    )
    return response.content

@server.route("/points-earned-over-time", methods = ["GET"])
def getPointsEarnedOverTime():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    aggregation = request.args.get("aggregation")

    response = requests.get(
        f"http://{os.environ.get('REWARDS_SVC_ADDRESS')}/points-earned-over-time",
        headers={"userEmail": userEmail},
        params={"start_date": start_date, "end_date": end_date, "aggregation": aggregation}
    )
    return response.content

@server.route("/rewards-status", methods = ["GET"])
def getRewardsStatus():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    response = requests.get(
        f"http://{os.environ.get('REWARDS_SVC_ADDRESS')}/rewards-status",
        headers={"userEmail": userEmail}
    )
    return response.content

@server.route("/user-reward-history", methods = ["GET"])
def getUserRewardsHistory():
    # Checking Validation of User's JWT
    access, err = validate.token(request)
    if err:
        print("[*Gateway Service] valid.token.(request) failed: ", err)
        return err
    access = json.loads(access)
    userEmail = access['username']
    if not userEmail:
        return "[*Gateway Service] User Email not provided", 400

    response = requests.get(
        f"http://{os.environ.get('REWARDS_SVC_ADDRESS')}/user-reward-history",
        headers={"userEmail": userEmail}
    )
    return response.content


@server.route("/rewards", methods=["POST"])
def rewards():
    access, err = validate.token(request)
    print("access: ", access, ", err: ", err)

    if err:
        print("[*Gateway Service] validation failed: ", err)
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



if __name__ == "__main__":
    try:
        server.run(host='0.0.0.0', port=8080)
    except KeyboardInterrupt:
        print("Interupted")
        try: 
            sys.exit(0)
        except SystemExit:
            os._exit(0)