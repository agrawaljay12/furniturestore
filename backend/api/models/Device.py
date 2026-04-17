from api.db import devices_collection
from bson.objectid import ObjectId

class Device:
    def __init__(self, device_id, room_id):
        self.device_id = device_id
        self.room_id = room_id

    @staticmethod
    def add_device(room_id, device_id):
        """ Adds a new device to the collection associated with a room. """
        try:
            if not ObjectId.is_valid(room_id):
                raise Exception('Invalid room ID')

            # Check if the device already exists
            if devices_collection.find_one({'room_id': ObjectId(room_id), 'device_id': device_id}):
                raise Exception('Device already exists in this room')
                
            devices_collection.insert_one({'room_id': ObjectId(room_id), 'device_id': device_id})
        except Exception as e:
            raise e

    @staticmethod
    def get_devices_by_room(room_id):
        """ Retrieves all devices associated with a room. """
        if not ObjectId.is_valid(room_id):
            raise Exception('Invalid room ID')

        devices = devices_collection.find({'room_id': ObjectId(room_id)}, {'device_id': 1})
        return [device['device_id'] for device in devices]
