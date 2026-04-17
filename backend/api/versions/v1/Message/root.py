import datetime
from typing import List
from fastapi import APIRouter,HTTPException, status, Request
from pydantic import ValidationError
from fastapi.responses import JSONResponse
from api.models.Message import Message

router = APIRouter()

#http://localhost:10007/api/v1/message/
#http://localhost:10007/api/v1/message

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

# description : send message to admin and moderator
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/message/send_message
# Default Port : 10007

@router.post("/send_message", response_description="send message to admin and moderator")
async def send_message(request: Request):
    try:
        data = await request.json()
        moderator_id = data.get('moderator_id')
        admin_id = data.get('admin_id')
        email = data.get('email')
        message = data.get('message')
        timestamp = data.get('timestamp')
        sender_role = data.get('sender_role')

        # if  not admin_id or not message:
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All fields are required")        
        timestamp = datetime.datetime.now().isoformat(timespec='seconds') + 'Z'

        message_data = {
            "moderator_id": moderator_id,
            "admin_id": admin_id,
            "email": email,
            "message": message,
            "timestamp": timestamp,
            "sender_role": sender_role
        }

        if Message.send_message(message_data):
            return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Message sent Successfully","data":message_data})
        else:
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": "Failed to send message"})
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"message": e.detail})
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": str(e)})
    

# description : get message from admin and moderator
# Request Type : GET
# Path : https://furnspace.onrender.com/api/v1/message/get
# Default Port : 10007

@router.get("/get", response_description="get message from admin and moderator")
async def get_message():
    try:
        message= Message.get_messages()
        return JSONResponse(status_code=status.HTTP_200_OK, content={"data": message})
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

# description : delete message by ID
# Request Type : DELETE
# Path : https://furnspace.onrender.com/api/v1/message/delete/{message_id}
# Default Port : 10007

@router.post("/delete/{message_id}", response_description="Delete message by ID")
async def delete_message(message_id: str):
    try:
        # Validate message_id format
        if not message_id or not isinstance(message_id, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Valid message ID is required"
            )
            
        # Use the static delete_message method from Message model
        if Message.delete_message(message_id):
            return JSONResponse(
                status_code=status.HTTP_200_OK, 
                content={"message": "Message deleted successfully","data":message_id}
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND, 
                content={"message": "Message not found or could not be deleted"}
            )
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"message": e.detail})
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            content={"message": f"An error occurred: {str(e)}"}
        )