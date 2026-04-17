from typing import List
from fastapi import APIRouter,HTTPException, status, Request,File, UploadFile ,Form 
from pydantic import ValidationError
from api.models.Room import Room
from fastapi.responses import JSONResponse
from api.models.Address import Address
import re
import json
router = APIRouter()

# https://localhost:10007/api/v1/address
# https://localhost:10007/api/v1/address/
@router.get("/", response_description="Api Version 1 Manager route")
async def hello_world():
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "location": "api/v1/auth",
            "message": "API Version V1 - Initial Version",
            "version": "1.0.0",
            "status": 200,
            "status_message": "OK... Working Version 1",
            "data": {
                "message": "You are in Auth API Base"
            }
        }
    )

# Add Address information
# Description: Add address information 
# Request Type: POST
# Path: https://furnspace.onrender.com/api/v1/address/add
# Default Port: 10007

@router.post("/add", response_description="Add Address")
async def add_address( request: Request):
    try:
        data = await request.json()
        user_id = data.get('user_id')
        address = data.get('address')
        pin_code = data.get('pin_code')
        state = data.get('state')
        city = data.get('city')
        country = data.get('country')
        data ={
            "user_id": user_id,
            "address": address,
            "pin_code": pin_code,
            "state": state,
            "city": city,
            "country": country
        }
        result = Address.add_address(data)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": 201,
                "status_message": "Created",
                "data": result
            }
        )
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

# Add Address information
# Description: get address information 
# Request Type: get
# Path: https://furnspace.onrender.com/api/v1/address/get_address/{user_id}
# Default Port: 10007
    
@router.get("/get_address/{user_id}", response_description="fetch_user_detail")
async def fetch_user_detail(user_id:str, request: Request):
    try:

        print(user_id)
        if not user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID is required")
            
        # call the update_user method from the User model
        user = Address.get_address(user_id)
        print(user)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with that ID"
            )
        
        # if user is found then and return the response
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                     "data": user,             
                    "message": "user address fetch successfully"
            } 
        )
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
  
    
        

    

