from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from api.db import user_activity_collection
from bson.objectid import ObjectId
from typing import List, Optional
import re

class UserActivity(BaseModel):
    user_id: str
    username: str
    activity: str
    timestamp : str

    @staticmethod
    def log_user_activity(user_activity: dict) -> bool:
        try:
            result = user_activity_id = user_activity_collection.insert_one(user_activity)
            return True if result.inserted_id else False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    @staticmethod
    def get_user_activities() -> List[dict]:
        try:
            users_activity = []
            for user_activity in user_activity_collection.find():
                user_activity["id"] = str(user_activity["_id"])
                del user_activity["_id"]
                users_activity.append(user_activity)
            return users_activity
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            ) 
        
    @staticmethod
    def delete_user_activity(user_id: str) -> dict:
        """ Deletes a user from the collection by user_id. """
        try:
            result = user_activity_collection.delete_one({'user_id': user_id})
            if result.deleted_count == 1:
                return {"message": "User deleted successfully", "user_id": user_id}
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with id {user_id} not found"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )