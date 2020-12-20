from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from cryptography.fernet import Fernet
import sqlite3
app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
message = 'John Doe'
file = open("key.key", "rb")
key = file.read()
file.close()


def encrypt(message, key: bytes) -> bytes:
    message = message.encode()
    return Fernet(key).encrypt(message)


def decrypt(token, key: bytes) -> bytes:
    return Fernet(key).decrypt(token).decode()


def send_mess(user_number, chat, key, mess_counter_current):
    conn = sqlite3.connect('sqlite.db')
    c = conn.cursor()
    mess_counter_current = str(int(mess_counter_current)+1)
    to_execute = (user_number, chat, key, mess_counter_current)
    c.execute(
        "INSERT INTO chat_table ( user_number,   chat,  [key],  mess_counter    )  VALUES (?, ?, ?,?    );", to_execute)
    conn.commit()
    conn.close()
    return mess_counter_current


def get_mess(user_number, key, mess_counter_current):
    conn = sqlite3.connect('sqlite.db')
    c = conn.cursor()
    key = (key,)
    c.execute(
        "SELECT user_number,chat,key,mess_counter FROM chat_table  where  key=?;", key)
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
        return redirect("/chat", code=302)
    return render_template("index.html")


@app.route('/enter', methods=['GET', 'POST'])
def init():
    if request.method == "POST" and request.form.get("key_id") != "" and request.form.get("user") != None:
        session["key"] = request.form.get("key_id")
        session["user"] = request.form.get("user")
        session["mess_counter_current"] = 1
        session["messgeges"] = []
        return redirect("/chat", code=302)
    return render_template("enter.html")


@app.route('/chat', methods=["GET", 'POST'])
def sessions():
    try:
        print(session["key"], session["user"])
        # if session["key"] != None and session["user"] != None:

        if request.method == "POST":
            print("Post")
            chat_mess = request.form.get('chat_mess')
            if chat_mess == "":
                return render_template('chat_new.html', error="You can't send blank mess!")
            else:
                # send mess
                send_mess(session["user"], chat_mess, session["key"], str(
                    session["mess_counter_current"]))
                # messeges=get_mess(session["user"],session["key"],str(session["mess_counter_current"]))
                session["mess_counter_current"] += 1
                # prepare_mess(messeges)

        return render_template('chat_new.html', uid = session["user"], roomID = session["key"])
        # else:
        #     return render_template('enter.html')
    except:
        return redirect("/index", code=302)


@app.route('/chat_check', methods=['GET', 'POST'])
def check_chat():
    messeges = get_mess(session["user"], session["key"], str(
        session["mess_counter_current"]))
    prepare_mess(messeges)
    return jsonify(session["messgeges"])


@app.route('/chat_new', methods=['GET', 'POST'])
def chat_new():

    return render_template('chat_new.html')
