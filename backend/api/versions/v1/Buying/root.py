from fastapi import APIRouter,HTTPException, status
router = APIRouter()

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

