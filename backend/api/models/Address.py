from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from api.db import addresses_collection
from bson.objectid import ObjectId
from typing import List, Optional
import re

class Address(BaseModel):
    user_id : str
    address: str
    pin_code: str
    state: str
    city: str
    country: str

    @staticmethod
    def add_address (user_data:dict)-> bool:
        try:
            result = addresses_collection.insert_one(user_data)
            return True if result.inserted_id else False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    
    @staticmethod
    def get_address(user_id: str) -> dict:
        """ Returns a user from the collection by user_id. """
        try:
            print(user_id)
            address = addresses_collection.find_one({'user_id': user_id})
            if address:
                address['id'] = str(address['_id'])  # Convert ObjectId to string and store as 'id'
                # user.pop("_id")  # Remove the original '_id' field
                del address['_id'] # Remove the original '_id' field
                print(address)
            return address
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
  