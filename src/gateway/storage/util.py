import pika, json


def upload(channel, access, routingKey):
        
    message = {
        "username": access["username"],
        }

    try:
        channel.basic_publish(
                exchange="",
                routing_key="routingKey",
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
                ),#Persistent mode as such so that when pods fail, messages are still persisted
            )
    except Exception as err:
        print(err)
        return "internal server error", 500
