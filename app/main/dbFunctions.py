import psycopg2
from . import connectionString
import string
import random

def rooms_id_generator(size=1, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def check_if_id_not_in_base(id):
    conn = psycopg2.connect(connectionString.connString)
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
    conn2 = psycopg2.connect(connectionString.connString)
    c2 = conn2.cursor()
    c2.execute(
        "SELECT key FROM chat_creds where save_passwd=%s and key=%s;", (password, key))
    if len(c2.fetchall()) == 0:
        print("Wrong_password")
        conn2.close()
        return False
    return True


def save_chat_database(data, new_key):
    conn = psycopg2.connect(connectionString.connString)
    c = conn.cursor()
    key = data["key"]
    password = data["savePasswd"]
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
    conn = psycopg2.connect(connectionString.connString)
    c = conn.cursor()
    if not(check_creditional(key, password)):
        return [False, []]
    else:
        to_return = []
        c.execute('SELECT "user",text FROM chat_mess where key=%s;', (key,))
        print(key)

        for message in c.fetchall():
            print(message)
            to_return.append({"user": message[0], "text": message[1]})

    return [True, to_return]


def del_chat_database(key, password):
    conn = psycopg2.connect(connectionString.connString)
    c = conn.cursor()
    if not(check_creditional(key, password)):
        return False
    c.execute("DELETE FROM chat_table WHERE key=%s;", (key,))
    c.execute(
        "DELETE FROM chat_creds WHERE key=%s and save_passwd=%s;", (key, password))
    conn.commit()
    conn.close()
    return True