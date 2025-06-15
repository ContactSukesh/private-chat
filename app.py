from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from collections import defaultdict
from flask_socketio import SocketIO, join_room, leave_room, emit
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'
socketio = SocketIO(app)

# Stores messages for each room
chat_rooms = defaultdict(list)
print(chat_rooms)
@socketio.on('join-room')
def on_join(room):
    join_room(room)

@socketio.on('send_message')
def handle_send_message(data):
    room = data.get('room')
    message = f"{data.get('user')}: {data.get('message')}"
    chat_rooms[room].append(message)
    emit('receive_message', {'message': message}, room=room)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        username = request.form["username"]
        room_id = request.form["room_id"]
        session["username"] = username
        session["room_id"] = room_id
        return redirect(url_for("chat"))
    return render_template("index.html")

@app.route("/chat")
def chat():
    username = session.get("username")
    room_id = session.get("room_id")
    if not username or not room_id:
        return redirect(url_for("index"))
    return render_template("chat.html", username=username, room_id=room_id)

@app.route("/messages")
def get_messages():
    room_id = session.get("room_id")
    return jsonify(messages=chat_rooms[room_id])

@app.route("/send", methods=["POST"])
def send_message():
    data = request.get_json()
    room_id = session.get("room_id")
    message = f"{data['user']}: {data['message']}"
    chat_rooms[room_id].append(message)
    return "", 204

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app,allow_unsafe_werkzeug=True, host='0.0.0.0', port=port)
