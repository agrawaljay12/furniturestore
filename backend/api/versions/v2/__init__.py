from fastapi import APIRouter

router = APIRouter()

@router.get("/", response_description="Api Version 2 Manager route")
async def hello_world():
    return {
        "location" : "api/v2",
        "message" : "API Version V1 - Initial Version",
        "version" : "2.0.0",
        "status" : 200,
        "status_message" : "OK... Working Version 2",
        "data" : {
            "message" : "Welcome to the API"
        }
    }