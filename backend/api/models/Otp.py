from pydantic import BaseModel, Field
from fastapi import HTTPException
from api.db import otp_collection
from bson.objectid import ObjectId
import time
from typing import Optional

class Otp(BaseModel):
    email: str
    otp: str
    created_at: float = Field(default_factory=time.time)
    expires_at: float = Field(default_factory=lambda: time.time() + 1200)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            float: lambda dt: time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(dt))
        }
    @staticmethod
    def add_otp(email: str, otp: str):
        """ Adds a new OTP to the collection. """
        try:
            otp_collection.insert_one({
                'email': email,
                'otp': otp,
                'created_at': time.time(),
                'expires_at': time.time() + 1200
            })
        except Exception as e:
            raise e

    @staticmethod
    def verify_otp(email: str, otp: str) -> bool:
        """ Verifies if the OTP is correct and not expired. """
        try:
            otp_entry = otp_collection.find_one({'email': email, 'otp': otp})
            if not otp_entry:
                return False
            if time.time() > otp_entry['expires_at']:
                return False

            otp_collection.delete_one({'_id': otp_entry['_id']})

            return True
        except Exception as e:
            raise e