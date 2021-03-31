from flask import session, redirect, url_for, render_template, request
import jsonify
from . import main
from . import dbFunctions


@main.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        session['name'] = request.form.get("name")
        session['room'] = request.form.get("room")
        session['res'] = request.form.get("wid")
        return redirect(url_for('.chat'))
    return render_template('index.html')


@main.route('/chat')
def chat():
    name = session.get('name', '')
    room = session.get('room', '')
    if name == '' or room == '':
        return redirect(url_for('.index'))
    print(session['res'])
    if int(session["res"])>=800:
        return render_template('chat.html', name=name, room=room)
    else:
        return render_template('chatMobile.html', name=name, room=room)
    
@main.route('/save_chat', methods=['POST'])
def save_chat():
    data = request.get_json()
    new_key = False
    key_return = None
    if data["key"] == "null":
        data["key"] = dbFunctions.pre_gen(12)
        new_key = True
    success = dbFunctions.save_chat_database(data, new_key)
    print("success")
    if success:
        key_return = data["key"]
    return jsonify({"success": success, "key": key_return})


@main.route('/load_chat', methods=['POST'])
def load_chat():
    data = request.get_json()
    key = data["key"]
    result = dbFunctions.load_chat_database(key, data["save_passwd"])
    return jsonify({"success": result[0], "messages": result[1]})
# TODO: DELfrom database


@main.route('/del_chat', methods=['POST'])
def del_chat():
    data = request.get_json()
    result = dbFunctions.del_chat_database(data["key"], data["save_passwd"])
    return jsonify({"success": result})
# end new
