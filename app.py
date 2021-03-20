from flask import Flask, render_template, request, session, redirect, url_for, jsonify, make_response
from cryptography.fernet import Fernet
import psycopg2
import string
import random
import logging
app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
app.debug = True
# logging section

# only errors devs option
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)
# ------------

# none logs
# --------------
# app.logger.disabled = True
# log = logging.getLogger('werkzeug')
# log.disabled = True
# ------------

message = 'John Doe'
file = open("key.key", "rb")
key = file.read()
file.close()


def encrypt(message, key: bytes) -> bytes:
    message = message.encode()
    return Fernet(key).encrypt(message)

def decrypt(token, key: bytes) -> bytes:
    return Fernet(key).decrypt(token).decode()

def rooms_id_generator(size=1, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))
def send_mess(user_number, chat, key, mess_counter_current):
    conn = psycopg2.connect("dbname=chatson user=chatson password=qaz123")
    c = conn.cursor()
    mess_counter_current = str(int(mess_counter_current)+1)
    to_execute = (user_number, chat, key, mess_counter_current)
    c.execute(
        "INSERT INTO chat_table ( user_number,   chat,  key,  mess_counter    )  VALUES (%s, %s, %s,%s    );", to_execute)
    conn.commit()
    conn.close()
    return mess_counter_current


def get_mess(user_number, key, mess_counter_current):
    conn = psycopg2.connect("dbname=chatson user=chatson password=qaz123")
    c = conn.cursor()
    key = (key,)
    c.execute(
        "SELECT user_number,chat,key,mess_counter FROM chat_table  where  key=%s;", key)
    rows = c.fetchall()
    tab = []
    for row in rows:
        tab.append(row)
    conn.commit()
    conn.close()
    return tab

def prepare_mess(messeges):
    for i in messeges:
        dic_to_add = {"user": list(i)[:-2][0], "mess": list(i)[:-2][1]}
        session["messgeges"].append(dic_to_add)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == "POST" and request.form.get("key_id") != "" and request.form.get("user") != None:
        
        session["key"] = request.form.get("key_id")
        session["user"] = request.form.get("user")
        session["mess_counter_current"] = 1
        session["messgeges"] = []
        if(int(request.form.get("wid")) < 767):
            return redirect("/chat-mobile", code=302)
        else:
            return redirect("/chat", code=302)
    return render_template("index.html")

@app.route('/chat', methods=["GET", 'POST'])
def sessions():
    try:
        if request.method == "POST":
            chat_mess = request.form.get('chat_mess')
            if chat_mess == "":
                response =  make_response(render_template('chat.html', error="You can't send blank mess!"))
                response.headers['Content-Security-Policy'] = "script-src 'self' http://51.195.101.71/"  
                response.headers['X-Content-Type-Options'] = 'nosniff'
                response.headers['X-Frame-Options'] = 'SAMEORIGIN'
                response.headers['X-XSS-Protection'] = '1; mode=block'
                return response
            else:
                # send mess
                send_mess(session["user"], chat_mess, session["key"], str(
                    session["mess_counter_current"]))
                session["mess_counter_current"] += 1
        response =  make_response(render_template('chat.html', uid = session["user"], roomID = session["key"]))
            'chat.html', uid=session["user"], roomID=session["key"]))
        # response.headers['Content-Security-Policy'] = "script-src 'self' http://51.195.101.71/" 'http://127.0.0.1:5000/'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response
    except:
        return redirect("/", code=302)

# start new
# prepare and loading function


def check_if_id_not_in_base(id):
    conn = psycopg2.connect("dbname=chatson user=chatson password=qaz123")
    c = conn.cursor()
    c.execute(
        "SELECT key FROM chat_creds  where  key=%s;", (id,))
    rows = c.fetchall()
    tab = []
    for row in rows:
        tab.append(row)
    conn.close
    if tab:
        return False
    else:
        return True


def pre_gen(number_of_characters):
    propos = rooms_id_generator(number_of_characters)
    if check_if_id_not_in_base(propos):
        return propos
# database function


def check_creditional(key, password):
    conn2 = psycopg2.connect("dbname=chatson user=chatson password=qaz123")
    c2 = conn2.cursor()
    c2.execute(
        "SELECT key FROM chat_creds where save_passwd=%s and key=%s", (password, key))
    if len(c2.fetchall()) == 0:
        print("Wrong_password")
        conn2.close()
        return False
    return True


def save_chat_database(data, new_key):
    conn = psycopg2.connect("dbname=chatson user=chatson password=qaz123")
    c = conn.cursor()
    key = data["key"]
    password = data["save_passwd"]
    if new_key:
        to_execute = (key, password)
        c.execute(
            "INSERT INTO chat_creds(key, save_passwd)  VALUES (%s, %s );", to_execute)
        conn.commit()
    elif not(check_creditional(key, password)):
        return False
    for message in data["messages"]:
        to_execute = (message["user"],   message["text"],  key)
        c.execute(
            'INSERT INTO chat_mess("user", text, key)  VALUES (%s, %s, %s    );', to_execute)
        conn.commit()
    conn.close()
    return True


def load_chat_database(key, password):
    conn = psycopg2.connect("dbname=chatson user=chatson password=qaz123")
    c = conn.cursor()
    if not(check_creditional(key, password)):
        return [False, []]
    else:
        to_return = []
        c.execute("SELECT user,text FROM chat_mess where key=%s", (key,))

        for message in c.fetchall():
            to_return.append({"user": message[0], "text": message[1]})

    return [True, to_return]

# routes


@ app.route('/save_chat', methods=['POST'])
def save_chat():
    data = request.get_json()
    new_key = False
    key_return = None
    if data["key"] == None:
        data["key"] = pre_gen(12)
        new_key = True
    success = save_chat_database(data, new_key)
    print("success")
    if success:
        key_return = data["key"]
    return jsonify({"success": success, "key": key_return})


@ app.route('/load_chat', methods=['POST'])
def load_chat():
    data = request.get_json()
    key = data["key"]
    result = load_chat_database(key, data["save_passwd"])
    return jsonify({"success": result[0], "messages": result[1]})
# TODO: DELfrom database
# end new


@ app.route('/chat-mobile', methods=["GET", 'POST'])
def chatMobile():
    try:
        if request.method == "POST":
            chat_mess = request.form.get('chat_mess')
            if chat_mess == "":
                return render_template('chatMobile.html', error="You can't send blank mess!")
            else:
                # send mess
                send_mess(session["user"], chat_mess, session["key"], str(
                    session["mess_counter_current"]))
                session["mess_counter_current"] += 1
        return render_template('chatMobile.html', uid=session["user"], roomID=session["key"])
    except:
        return redirect("/index", code=302)


@ app.route('/chat_check', methods=['GET', 'POST'])
def check_chat():
    messeges = get_mess(session["user"], session["key"], str(
        session["mess_counter_current"]))
    prepare_mess(messeges)
    return jsonify(session["messgeges"])


@ app.route('/chat_new', methods=['GET', 'POST'])
def chat_new():

    return render_template('chat.html')
