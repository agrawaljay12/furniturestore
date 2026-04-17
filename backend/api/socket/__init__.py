import socketio 
from api.models.Room import Room
from api.models.Device import Device  # Import the Device model

sio_server = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[]
)

@sio_server.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio_server.emit('message', {'data': 'Welcome!'}, to=sid)

@sio_server.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio_server.event
async def join_room(sid, data):
    room_name = data.get('room')
    password = data.get('password')

    # Fetch the room from the database
    room = Room.get_room_by_name(room_name)

    if room and room['password'] == password:
        room_id = str(room['_id'])
        Device.add_device(room_id, sid)  # Use Device model to add the device
        await sio_server.save_session(sid, {'room': room_name})
        sio_server.enter_room(sid, room_name)
        await sio_server.emit('message', {'data': f"{sid} has joined the room."}, room=room_name)
    else:
        await sio_server.emit('error', {'data': 'Invalid room or password'}, to=sid)

@sio_server.event
async def leave_room(sid, data):
    room_name = data.get('room')
    sio_server.leave_room(sid, room_name)
    await sio_server.emit('message', {'data': f"{sid} has left the room."}, room=room_name)

@sio_server.event
async def my_event(sid, data):
    session = await sio_server.get_session(sid)
    room_name = session.get('room')
    if room_name:
        await sio_server.emit('response', {'data': f"Received your message: {data}"}, room=room_name)
