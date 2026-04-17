from fastapi import APIRouter,HTTPException, status
router = APIRouter()
from fastapi.responses import JSONResponse
from api.models.Banned import Banned 
from api.models.User import User
from typing import List
from fastapi import APIRouter,HTTPException, status, Request
from pydantic import ValidationError
from datetime import datetime, timedelta
from fastapi.encoders import jsonable_encoder
# http://localhost:10007/api/v1
# http://localhost:10007/api/v1/

@router.get("", response_description="Api Version 1 Manager route")
@router.get("/", response_description="Api Version 1 Manager route")
async def hello_world():
    return {
        "location" : "api/v1",
        "message" : "API Version V1 - Initial Version",
        "version" : "1.0.0",
        "status" : 200,
        "status_message" : "OK... Working Version 1",
        "data" : {
            "message" : "Welcome to the API"
        }
    }

# give warning to user
# Description : give warning to user
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/banned/ban/temporary
# Default Port : 10007

@router.post("/ban/temporary", response_description="Temporarily ban a user")
async def temporary_ban(request: Request):
    try:
        data = await request.json()
        user_id = data.get('user_id')
        email = data.get('email')
        reason = data.get('reason', 'Violation of terms')
        duration = data.get('duration', 7)  # Default duration is 7 days
        banned_at = datetime.now().isoformat()
        expires_at = (datetime.now() + timedelta(days=duration)).isoformat()

        banned_data = {
            "user_id": user_id,
            "email": email,
            "reason": reason,
            "ban_type": "temporary",
            "duration": duration,
            "banned_at": banned_at,
            "expires_at": expires_at,
            "warnings": data.get('warnings', 0)
        }

        if Banned.add_ban(banned_data):
            return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "User temporarily banned"})
        else:
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": "Failed to ban user"})
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"message": e.detail})
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": str(e)})
    
# peramnent ban user
# Description : peramnent ban user
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/banned/ban/permanent
# Default Port : 10007

@router.post("/ban/permanent", response_description="Temporarily ban a user")
async def temporary_ban(request: Request):
    try:
        data = await request.json()
        user_id = data.get('user_id')
        email = data.get('email')
        reason = data.get('reason', 'violation of terms')
        banned_at = datetime.now().isoformat()
        banned_data = {
            "user_id": user_id,
            "email": email,
            "reason": reason,
            "ban_type": "permanent",
            "banned_at": banned_at,
        }

        if Banned.add_ban(banned_data):
            return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "User permanent banned"})
        else:
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": "Failed to ban user"})
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"message": e.detail})
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": str(e)})
       
# deny access to user
# Description : deny acces to user
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/banned/login
# Default Port : 10007

@router.post("/login", response_description="User login")
async def login(request: Request):
    try:
        data = await request.json()
        email = data.get('email')
        password = data.get('password')

        # Check if the user is banned
        result = Banned.is_user_banned(email)
        if result: 
            return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "User is banned for week", "data": result})

        # Perform the login logic (e.g., check password, generate token, etc.)
        user = User.login(email,password)
        if user:
            return JSONResponse(status_code=status.HTTP_200_OK,  content=jsonable_encoder({"message": "User verified", "data": user}))
        else:
            return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"message": "Invalid credentials"})
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"message": e.detail})
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": str(e)})
    
# get all banned users
# Description : get all banned users
# Request Type : GET    
# Path : https://furnspace.onrender.com/api/v1/banned/list
# Default Port : 10007

@router.get("/list", response_description="Get all user banned users")
async def get_banned_user():
    try:
        banned_user = Banned.get_banned_user()
        return JSONResponse(status_code=status.HTTP_200_OK, content={"data": banned_user})
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {
                    "message": str(e)
                }
            }
        )
