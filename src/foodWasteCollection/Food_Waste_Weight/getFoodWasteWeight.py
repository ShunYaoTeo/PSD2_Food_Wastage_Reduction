import pika, json, os, random

def getWeight(message, mysql, channel, properties):

    cursor = mysql.connection.cursor()
    message = json.loads(message)
    
    userEmail = message["username"]
    foodType = message["food_type"]
    reason = message["reason"]
    donated = message["donated"]
    if (str(donated) == "false"):
        donated = 0
    else:
        donated = 1
        

    # userEmail = "haidilao@owner.com"
    # foodType = "test"
    # reason = "test"
    # donated = False


    ####### Code to get Weight Data from Raspberry################

    # As for now, gets a random weight between 1kg and 50kg
    tempData = random.randint(1, 50)
    formattedData= float(tempData)

    ##############################################################

    # Get Restaurant id of User
    res = cursor.execute(
        "SELECT r.id as restaurant_id FROM auth.user u JOIN foodwaste.restaurants r ON u.id = r.owner_id WHERE u.email = %s", (userEmail,)
    )

    if res > 0:
        user_restaurant = cursor.fetchone()
        restaurant_id = user_restaurant[0]
    else:
        return "[*Food_Waste_Service] No Restaurant Found For this User"
    

    #Insert gathered data into food_waste table in foodwaste database
    res = cursor.execute(
        "INSERT INTO food_waste(weight, restaurant_id, food_type, reason, donated) VALUES(%s, %s, %s, %s, %s)",(formattedData, restaurant_id, foodType, reason, donated)
    )
    mysql.connection.commit()

    reply_message = {
        "username": userEmail,
        "food_type": foodType,
        "reason" : reason,
        "donated" : donated,
        "foodWeight": formattedData
    }

    try:
        channel.basic_publish(
            exchange="",
            routing_key="foodwaste_foodwaste",
            body=json.dumps(reply_message),
            properties = pika.BasicProperties(
            delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE,
            correlation_id=properties
            )
        )
        print("[*Food_Waste_Service] Reply Correlation ID: %s", properties)
        print("[*Food_Waste_Service] Reply message sent!")
    except Exception as err:
        return "[*Food_Waste_Service] Failed to Publish Reply Message"