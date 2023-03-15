import pika, json, os

def getPoints(message, mysql, channel, properties):
    
    cursor = mysql.connection.cursor()
    message = json.loads(message)
    
    userEmail = message["username"]
    foodType = message["food_type"]
    reason = message["reason"]
    foodWight = message["foodWeight"]
    donated = message["donated"]
    if (str(donated) == "false"):
        donated = 0
    else:
        donated = 1
    
    rules = {
    "Fruits and Vegetables": 1,
    "Meat and Poultry": 2,
    "Seafood": 3,
    "Grains and Bread": 1,
    "Dairy Products": 1,
    "Condiments and Sauces": 0.5,
    "Beverages": 0.5
    }

    #if User does not exist in user_points table, create one:

    cursor.execute(
        f"INSERT INTO user_points (user_id, points) SELECT id, 0 FROM auth.user WHERE email = '{userEmail}' AND id NOT IN (SELECT user_id FROM user_points)"
    )
    mysql.connection.commit()

    # Calculating amount of points to add to the user
    categoryPoints = rules[foodType]
    totalPointsGained = categoryPoints * foodWight

    print(f"{userEmail} has inserted {foodWight} kg of {foodType} \n")
    print(f"Total points gained = {totalPointsGained}\n")

    # Updating database with points gained
    cursor.execute(
        f"UPDATE user_points SET points = points + {totalPointsGained} WHERE user_id = (SELECT id FROM auth.user WHERE email = '{userEmail}')"
    )
    mysql.connection.commit()
    res = cursor.execute(
        f"SELECT points from user_points where user_id = (SELECT id FROM auth.user WHERE email = '{userEmail}')"
    )

    if res > 0:
        updated_Points = cursor.fetchone()
        updatedPoints = updated_Points[0]
    else:
        return "[*Rewards_Service] ERROR could not find user"
    

    # Sends Updated data back to gateway

    update_message = {
        "username": userEmail,
        "food_type": foodType,
        "reason" : reason,
        "donated" : donated,
        "foodWeight": foodWight,
        "updatedPoints": updatedPoints
    }

     #Publish message back to gateway service
    try:
        channel.basic_publish(
            exchange="",
            routing_key=os.environ.get("REWARD_GATEWAY_QUEUE"),
            body=json.dumps(update_message),
            properties = pika.BasicProperties(
            delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE,
            correlation_id=properties
            )
        )
        print("[*Rewards_Service] Reply back to GATEWAY with Correlation ID: ", properties)
        print("[*Rewards_Service] Reply message sent!")
    except Exception as err:
        return "[*Rewards_Service] Failed to Publish Reply Message to Gateway Service"
