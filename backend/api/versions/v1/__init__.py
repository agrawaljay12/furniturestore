from fastapi import APIRouter
from api.versions.v1.room.root import router as room_router
from api.versions.v1.Mail.root import router as mail_router
from api.versions.v1.Auth.root import router as auth_router
from api.versions.v1.payment.root import router as payment_router
from api.versions.v1.furniture.root import router as furniture_router
from api.versions.v1.Test.root import router as test_router
from api.versions.v1.FileUpload.root import router as file_upload_router
from api.versions.v1.Booking.root import router as booking_router
from api.versions.v1.Buying.root import router as buying_router
from api.versions.v1.Banned.root import router as banned_router
from api.versions.v1.Warning.root import router as warning_router
from api.versions.v1.UserActivity.root import router as user_activity_router
from api.versions.v1.Message.root import router as message_router
from api.versions.v1.Address.root import router as address_router
from api.versions.v1.Review.root import router as review_router
from api.versions.v1.Offer.root import router as offer_router
router = APIRouter()

# https://localhost:10007/api/v1
# https://localhost:10007/api/v1/

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

# https://furnspace.onrender.com/api/v1/room
router.include_router(room_router, prefix="/room", tags=["API Version 1"])

# https://furnspace.onrender.com/api/v1/mail
router.include_router(mail_router, prefix="/mail", tags=["mail Routes"])

# https://furnspace.onrender.com/api/v1/auth
router.include_router(auth_router, prefix="/auth", tags=["Auth Routes"])

# https://furnspace.onrender.com/api/v1/payment
router.include_router(payment_router, prefix="/payment", tags=["Payment Routes"])

# https://furnspace.onrender.com/api/v1/furniture
router.include_router(furniture_router, prefix="/furniture", tags=["Furniture Routes"])

# https://furnspace.onrender.com/api/v1/test
router.include_router(test_router, prefix="/test", tags=["Test Routes"])

# https://furnspace.onrender.com/api/v1/fileupload
router.include_router(file_upload_router, prefix="/fileupload", tags=["File Upload Routes"])

# https://furnspace.onrender.com/api/v1/booking
router.include_router(booking_router, prefix="/booking", tags=["Booking Routes"])

# https://furnspace.onrender.com/api/v1/buying
router.include_router(buying_router, prefix="/buying", tags=["Buying Routes"])

# https://furnspace.onrender.com/api/v1/banned
router.include_router(banned_router, prefix="/banned", tags=["Banned Routes"])

# https://furnspace.onrender.com/api/v1/warning
router.include_router(warning_router, prefix="/warning", tags=["Warning Routes"])

# https://furnspace.onrender.com/api/v1/useractivity

router.include_router(user_activity_router, prefix="/useractivity", tags=["User Activity Routes"])

# https://furnspace.onrender.com/api/v1/message
router.include_router(message_router, prefix="/message", tags=["Message Routes"])

# https://furnspace.onrender.com/api/v1/address

router.include_router(address_router, prefix="/address", tags=["Address Routes"])

# https://furnspace.onrender.com/api/v1/review

router.include_router(review_router, prefix="/review", tags=["Review Routes"])

# https://furnspace.onrender.com/api/v1/offer

router.include_router(offer_router, prefix="/offer", tags=["Offer Routes"])

