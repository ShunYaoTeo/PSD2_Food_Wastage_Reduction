import jwt, datetime, os
from flask import Flask, request
from flask_mysqldb import MySQL

server = Flask(__name__)
mysql = MySQL(server)

# config
server.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
server.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
server.config["MYSQL_PASSWORD"] = os.environ.get("MYSQL_PASSWORD")
server.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")
server.config["MYSQL_PORT"] = int(os.environ.get("MYSQL_PORT"))



@server.route("/login", methods=["POST"])
def login():
    auth = request.authorization
    if not auth:
        return "missing credentials", 401

    # check db for username and password
    if not mysql.connection:
        raise ValueError("MySQL connection not established")
    cur = mysql.connection.cursor()
    res = cur.execute(
            "SELECT email, password, admin FROM user WHERE email=%s", (auth.username,)
        )
    
    if res > 0:
        user_row = cur.fetchone()
        email = user_row[0]
        password = user_row[1]
        admin = user_row[2]

        if auth.username != email or auth.password != password:
            return "invaid credentials", 401
        else:
            return createJWT(auth.username, os.environ.get("JWT_SECRET"), admin)
    else:
        return "invalid credentials", 401


@server.route("/validate", methods=["POST"])
def validate():
    encoded_jwt = request.headers["Authorization"]

    if not encoded_jwt:
        return "missing credentials", 401
    

    #Authorization: Bearer [Token]
    encoded_jwt = encoded_jwt.split(" ")[1]
    print(encoded_jwt)
    try:
        decoded = jwt.decode(
            encoded_jwt, os.environ.get("JWT_SECRET"), algorithms=["HS256"]
            )
    except Exception as err:
        print(err)
        return "not authorized", 403

    return decoded, 200

@server.route("/correlation_Response", methods=["POST"])
def corr_Response():
    if not mysql.connection:
        raise ValueError("MySQL connection not established")

    coorelation_id = request.json["properties"]
    
    cursor = mysql.connection.cursor()
    res = cursor.execute(
        "SELECT * FROM correlation_ids WHERE correlation_id=%s", (coorelation_id,)
    )
    if res > 0:
        cursor.execute(
            "DELETE FROM correlation_ids WHERE correlation_id=%s", (coorelation_id,)
        )
        mysql.connection.commit()
        return "correlation_id exists!", 200
    else:
        return "correlation_id not found", 401
    
@server.route("/store_correlation", methods=["POST"])
def store_correlation():
    if not mysql.connection:
        raise ValueError("MySQL connection not established")

    coorelation_id = request.json["properties"]
    cursor = mysql.connection.cursor()
    cursor.execute(
        f"INSERT INTO correlation_ids (correlation_id, request_type) VALUES ('{coorelation_id}', 'foodwaste')"
    )
    mysql.connection.commit()

    return "[*AUTH_SERVICE] Stored Correlation_id to DB", 200

# authz = whether user has admin permissions (True/False)
def createJWT(username, secret, authz):
    return jwt.encode(
            {
                "username": username,
                "exp": datetime.datetime.now(tz=datetime.timezone.utc)
                + datetime.timedelta(days=1),
                # issued_at
                "iat": datetime.datetime.utcnow(),
                "admin": authz,
            },
            secret,
            algorithm="HS256",
        )


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=5000)
