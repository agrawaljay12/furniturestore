from pydantic import BaseModel, Field
from fastapi import HTTPException
from api.db import rooms_collection
from bson.objectid import ObjectId
from typing import List, Optional


class Room(BaseModel):
    name: str
    password: str
    id: Optional[str] = Field(None, alias='_id')

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

    @staticmethod
    def add_room(name: str, password: str):
        """ Adds a new room to the collection. """
        try:
            if rooms_collection.find_one({'name': name}):
                raise HTTPException(status_code=409, detail={
                    "message": "Room already Exists"
                })
            result = rooms_collection.insert_one({'name': name, 'password': password})
            return {"message": "Room added", "room_id": str(result.inserted_id)}
        except Exception as e:
            raise e

    @staticmethod
    def get_rooms() -> List[dict]:
        """ Retrieves all rooms with their ids and names. """
        rooms = rooms_collection.find({}, {'name': 1})
        return [{'id': str(room['_id']), 'name': room['name']} for room in rooms]

    @staticmethod
    def get_room_by_name(name: str) -> Optional[dict]:
        """ Retrieves a room by its name. """
        room = rooms_collection.find_one({'name': name})
        return room

    @staticmethod
    def get_room_by_id(room_id: str) -> Optional[dict]:
        """ Retrieves a room by its id. """
        if not ObjectId.is_valid(room_id):
            raise Exception('Invalid room ID')

        room = rooms_collection.find_one({'_id': ObjectId(room_id)})
        return room

    @staticmethod
    def delete_room(room_id: str) -> dict:
        """ Deletes a room by its ID. """
        if not ObjectId.is_valid(room_id):
            raise Exception('Invalid room ID')

        result = rooms_collection.delete_one({'_id': ObjectId(room_id)})
        if result.deleted_count == 0:
            raise Exception('Room not found or already deleted')
        return {"message": "Room deleted", "deleted_count": result.deleted_count}

    @staticmethod
    def update_room(room_id: str, name: str, password: str) -> dict:
        """ Updates a room by its ID. """
        if not ObjectId.is_valid(room_id):
            raise Exception('Invalid room ID')

        result = rooms_collection.update_one({'_id': ObjectId(room_id)}, {'$set': {'name': name, 'password': password}})
        if result.matched_count == 0:
            raise Exception('Room not found')
        return {"message": "Room updated", "matched_count": result.matched_count}