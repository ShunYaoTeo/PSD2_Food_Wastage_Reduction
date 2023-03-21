import pika, json, os

def getPoints(message, mysql,  properties):
    
    cursor = mysql.connection.cursor()
    message = json.loads(message)
    
    userEmail = message["username"]
    foodType = message["food_type"]
    reason = message["reason"]
    foodWeight = message["foodWeight"]
    donated = message["donated"]
    if (str(donated) == "false" or str(donated) == '0'):
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
    totalPointsGained = categoryPoints * foodWeight

    print(f"{userEmail} has inserted {foodWeight} kg of {foodType} \n")
    print(f"Total points gained = {totalPointsGained}\n")

    # Updating database with points gained
    cursor.execute(
        f"UPDATE user_points SET points = points + {totalPointsGained} WHERE user_id = (SELECT id FROM auth.user WHERE email = '{userEmail}')"
    )
    mysql.connection.commit()
    print("[*Rewards_Service] User Points Updated")


    description = f"Food Waste: {foodType} ({foodWeight}kg) - Reason: {reason} - Donated: {donated}"

    # Updating user_points_history table
    cursor.execute(f'''
            INSERT INTO user_reward_history (user_id, points, action, description) 
            VALUES ((SELECT id FROM auth.user WHERE email = '{userEmail}'),{totalPointsGained}, 'earned', '{description}')'''
    )
    mysql.connection.commit()
    print("[*Rewards_Service] User Point History Updated")


    res = cursor.execute(
        f"SELECT points from user_points where user_id = (SELECT id FROM auth.user WHERE email = '{userEmail}')"
    )

    if res > 0:
        updated_Points = cursor.fetchone()
        updatedPoints = updated_Points[0]
    else:
        return "[*Rewards_Service] ERROR could not find user"
    

