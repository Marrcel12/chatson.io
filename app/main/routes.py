from flask import session, redirect, url_for, render_template, request
from . import main


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
