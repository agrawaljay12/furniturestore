from fastapi import APIRouter,HTTPException, status, Request
from fastapi.responses import JSONResponse
from api.models.UserActivity import UserActivity
from bson.objectid import ObjectId
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# https://localhost:10007/api/v1/useractivity
# https://localhost:10007/api/v1/useractivity/

@router.get("", response_description="Api useractivity Home")
@router.get("/", response_description="Api useractivity Home")
async def hello_world():
    return {
        "location" : "api/v1/furniture",
        "message" : "API Version V1 - Initial Version",
        "version" : "1.0.0",
        "status" : 200,
        "status_message" : "OK... Working Mail Home",
        "data" : {
            "message" : "Welcome to the Mail Home"
        }
    }

# description = "Get all user activities"
# method = "POST"
# https://furnspace.onrender.com/api/v1/useractivity/activities

@router.post("/activities", response_description="Get all user activities")
async def get_activities(request: Request):
    try:
        data  = await request.json()
        user_id = data.get('user_id')
        username = data.get('username')
        activity = data.get('activity')
        timestamp = data.get('timestamp')

        timestamp= datetime.now().isoformat(timespec='seconds') + 'Z'
        user_activity = {
            "user_id": user_id,
            "username": username,
            "activity": activity,
            "timestamp": timestamp
        }

        result = UserActivity.log_user_activity(user_activity)
        if result:
            return JSONResponse(status_code=status.HTTP_201_CREATED, content={"message": "User activity logged successfully"})
        else:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "User activity not logged"})
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

# description = "Get all user activities"
# method = "POST"
# https://furnspace.onrender.com/api/v1/useractivity/list

@router.post("/list", response_description="Get all user activities")
async def get_activities():
    try:
        users_activity = UserActivity.get_user_activities()
        return JSONResponse(status_code=status.HTTP_200_OK, content={"data": users_activity})
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
    
# description = "delete user activity"
# method = "POST"
# https://furnspace.onrender.com/api/v1/useractivity/delete/{user_id}"

@router.post("/delete/{user_id}", response_description="Delete User")
async def delete_user(user_id: str):
    try:
        result = UserActivity.delete_user_activity(user_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "Success",
                "data": result
            }
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "status": e.status_code,
                "status_message": "Error",
                "data": {"message": e.detail}
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {"message": str(e)}
            }
        )
    


