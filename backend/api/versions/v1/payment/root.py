from fastapi import APIRouter
router = APIRouter()

# https://localhost:10007/api/v1/payment
# https://localhost:10007/api/v1/payment/
@router.get("", response_description="Api payment Home")
@router.get("/", response_description="Api payment Home")
async def hello_world():
    return {
        "location" : "api/v1/payment",
        "message" : "API Version V1 - Initial Version",
        "version" : "1.0.0",
        "status" : 200,
        "status_message" : "OK... Working Mail Home",
        "data" : {
            "message" : "Welcome to the Mail Home"
        }
    }
    