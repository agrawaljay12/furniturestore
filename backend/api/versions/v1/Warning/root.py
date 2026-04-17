from fastapi import APIRouter,HTTPException, status
router = APIRouter()
from datetime import datetime
from fastapi.responses import JSONResponse
from api.models.warning import Warning
from typing import List
from fastapi import APIRouter,HTTPException, status, Request,File, UploadFile ,Form 
from pydantic import ValidationError
import logging
import re

# http://localhost:10007/api/v1
# http://localhost:10007/api/v1/

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
# Path : https://furnspace.onrender.com/api/v1/warning/add
# Default Port : 10007

@router.post("/add", response_description="Give warning to user")
async def give_warning(request: Request):
    try:
        data = await request.json()
        user_id = data.get('user_id')
        email = data.get('email')
        message = data.get('message')
        created_at = data.get('created_at')
        status_value = data.get('status', 'active')  # Default value for status if not provided

        logger.info(f"Received data: {data}")

        if not user_id:
            return JSONResponse(status_code=400, content={"message": "user_id is required"})

        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return JSONResponse(status_code=400, content={"message": "Invalid email format"})

        created_at = datetime.now().isoformat(timespec='seconds') + 'Z'

        warning_data = {
            "user_id": user_id,
            "email": email,
            "message": message,
            "created_at": created_at,
            "status": status_value
        }

        logger.info(f"Warning data to be added: {warning_data}")

        result = Warning.add_warning(warning_data)
        if result:
            return JSONResponse(status_code=200, content={"message": "Warning added successfully"})
        else:
            logger.error("Failed to add warning")
            return JSONResponse(status_code=500, content={"message": "Failed to add warning"})
    except HTTPException as http_exc:
        logger.error(f"HTTPException: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Exception: {str(e)}")
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

# list  warning to user
# Description : list warning to user
# Request Type : GET
# Path : https://furnspace.onrender.com/api/v1/warning/list
# Default Port : 10007

@router.get("/list", response_description="List warning to user")
async def list_warnings():
    try:
        user_warning = Warning.get_warnings()
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "Success",
                "data": user_warning
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
    




