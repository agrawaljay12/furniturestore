from fastapi import HTTPException, status,UploadFile,File
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from api.db import users_collection
from bson.objectid import ObjectId
from typing import List, Optional
import re
from api.models.FileUpload import save_file


class User(BaseModel):
    first_name: str 
    last_name: str 
    email: str
    password: str
    phone: str 
    phone2: Optional[str] 
    address: str
    pin_code: str 
    state: str
    city: str
    country: str
    type: str = "user"
    profile_picture: Optional[str] = "http://localhost:10007/files/default.png" # default profile picture url 
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

# class Address(BaseModel):
#     user_id : str
#     address: str
#     pin_code: str
#     state: str
#     city: str
#     country: str

    @staticmethod
    async def add_user(user_data: dict,file: Optional[UploadFile] = None )-> bool:
        """ Adds a new user to the collection. """
        try:
            if file:
                file_path = await save_file(file)
                # file_url = f" https://furnspace.onrender.com/files/{unique_filename}"
                user_data['profile_picture'] = file_path
                return file_path
                
            if users_collection.find_one({'email': user_data['email']}):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            result = users_collection.insert_one(user_data)
            return True if result.inserted_id else False

        except Exception as e:
           
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    @staticmethod
    def login(email: str, password: str) -> dict:
        """ Authenticates a user by their email and password. """
        user = users_collection.find_one({'email': email})
        if not user or user['password'] != password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
            "status": 200,
            "status_message": "OK",
            "data": {
                "message": "Login successful",
                "user_id": str(user['_id']),
                "user_type": user['type'],
                "email": user['email']
            }
            }
        )

    @staticmethod
    def forgot_password(email: str, password: str,confirm_password:str) -> dict:
        """ Handles forgot password functionality. """
        user = users_collection.find_one({'email': email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not registered"
            )
        if password != confirm_password:    
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )        
        # Update the password in the database
        users_collection.update_one({'email': email}, {'$set': {'password': password}})
        #return {"message": "Password has been successfully updated. Please log in with your new password."}
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
            "status": 200,
            "status_message": "OK",
            "data": {
                "message": "Password has been successfully updated. Please log in with your new password."
            }
         }
        )

    @staticmethod
    def get_users(user_id: str) -> dict:
        """ Returns a user from the collection by user_id. """
        try:
            print(user_id)
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if user:
                user['id'] = str(user['_id'])  # Convert ObjectId to string and store as 'id'
                # user.pop("_id")  # Remove the original '_id' field
                del user['_id'] # Remove the original '_id' field
                print(user)
            return user
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
  
    @staticmethod
    def update_user(user_id: str, user_data: dict, file: Optional[UploadFile] = None) -> dict:
        """ Updates the details and/or profile picture of a user. """
        update_data = {}

        if user_data:
            # Allowed fields for update
            allowed_fields = {
                "first_name", "last_name", "email", "phone", "phone2", "password",
                "address", "pin_code", "state", "city", "country", "profile_picture"
            }

            # Validate that no new fields are being added
            for field in list(user_data.keys()):
                if field in allowed_fields:
                    update_data[field] = user_data[field]

            if not update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )

            if file:
                # Instantiate the FileUpload
                file_upload = FileUpload()

                # Save the file and get the unique filename
                unique_filename = file_upload.save_file(file)
                file_url = f"https://furnspace.onrender.com/files/{unique_filename}"
                update_data['profile_picture'] = file_url
                print("Profile New : ", update_data['profile_picture'])

            x = users_collection.find_one({'_id': ObjectId(user_id)})

            print("==============================================")
            print(x)
            print("==============================================")
            print(update_data)
            print("==============================================")

            try:
                result = users_collection.update_one(
                    {'_id': ObjectId(user_id)},
                    {'$set': update_data}
                )
            except Exception as e:
                print(e)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )

            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User details not updated. Either the user does not exist or the provided data is the same as the existing data."
                )

            response = {
                "message": "User details updated successfully",
                "data": update_data
            }

            return response
        
    @staticmethod
    def get_all_users() -> List[dict]:
        """ Returns all users from the collection. """
        try:
            users = []
            for user in users_collection.find():
                user['id'] = str(user['_id'])  # Convert ObjectId to string and store as 'id'
                del user['_id']  # Remove the original '_id' field
                # print(user)
                users.append(user)
                # print(users)
            return users
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
        
    @staticmethod
    def delete_user(user_id: str) -> dict:
        """ Deletes a user from the collection by user_id. """
        try:
            result = users_collection.delete_one({'_id': ObjectId(user_id)})
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
        
    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str, confirm_password: str) -> dict:
        """ Changes the password of a user. """
        try:
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="user id not found"
                )
            if user['password'] != old_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid password"
                )
            # print(user)
            # print(old_password)
            if new_password != confirm_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Passwords do not match"
                )
            # Update the password in the database
            result = users_collection.update_one(
                {'_id': ObjectId(user_id), 'password': old_password},
                {'$set': {'password': new_password}}
            )
            if result.modified_count == 1:
                return {"message": "Password updated successfully", "user_id": user_id}
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password update failed"
                )
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
        
    # @staticmethod
    # def add_address (user_data:dict)-> bool:
    #     try:
    #         result = addresses_collection.insert_one(user_data)
    #         return True if result.inserted_id else False
    #     except Exception as e:
    #         raise HTTPException(
    #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=str(e)
    #         )