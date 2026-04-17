from typing import List
from fastapi import APIRouter, HTTPException, status, Request, File, UploadFile, Form
from pydantic import ValidationError
from api.models.Room import Room
from fastapi.responses import JSONResponse
from api.models.Offer import Offer
import datetime
import re
import json
import traceback
import sys

# Custom JSON encoder to handle datetime objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        if isinstance(obj, datetime.date):
            return obj.isoformat()
        return super().default(obj)

# Helper function to ensure JSON serialization works
def json_serialize(data):
    return json.loads(json.dumps(data, cls=CustomJSONEncoder))

router = APIRouter()

#https://localhost:10007/api/v1/offer
#http://localhost:10007/api/v1/offer/

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
# https://furnspace.onrender.com/api/v1/offer/add
#description : add  all offers
# method : POST

@router.post("/add", response_description="send message to admin and moderator")
async def add_offer(request: Request):
    try:
        data = await request.json()
        furniture_id = data.get('furniture_id')
        discount = data.get('discount')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        duration_days = 7 
        end_date = (datetime.datetime.now() + datetime.timedelta(days=duration_days)).isoformat(timespec='seconds') + 'Z'
        start_date = datetime.datetime.now().isoformat(timespec='seconds') + 'Z'

        offer_data = {
            "furniture_id": furniture_id,
            "discount": discount,
            "start_date": start_date,
            "end_date": end_date
            }

        if Offer.add_offer(offer_data):
            return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "offer added","data":offer_data})
        else:
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": "Failed to send message"})
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"message": e.detail})
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": str(e)})



# https://furnspace.onrender.com/api/v1/offer/list
#description : get all offers
# method : GET

@router.get("/list", response_description="get all offers")
async def get_all_offers():
    try:
        # Print debugging information
        print("Starting to fetch offers with furniture details")
        
        # Use a try-except block specifically for the function call
        try:
            offers = Offer.get_all_offers_with_furniture_details()
            # Ensure all data is JSON serializable
            serialized_offers = json_serialize(offers)
            print(f"Successfully fetched {len(serialized_offers)} offers")
            return JSONResponse(
                status_code=status.HTTP_200_OK, 
                content={"message": "offers fetched", "data": serialized_offers}
            )
        except Exception as func_error:
            # Log the specific error from the function
            error_details = str(func_error)
            stack_trace = traceback.format_exc()
            print(f"Error in get_all_offers_with_furniture_details: {error_details}")
            print(f"Stack trace: {stack_trace}")
            
            # Return a fallback response with empty data to prevent frontend errors
            return JSONResponse(
                status_code=status.HTTP_200_OK, 
                content={
                    "message": "Error fetching offers, returning empty list", 
                    "data": offers, 
                    "error": error_details
                }
            )
    except HTTPException as e:
        print(f"HTTP Exception: {e.detail}")
        return JSONResponse(status_code=e.status_code, content={"message": e.detail, "data": []})
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        print(f"Unexpected error in get_all_offers route at line {exc_tb.tb_lineno}: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_200_OK, 
            content={
                "message": "An unexpected error occurred", 
                "data": [], 
                "error": str(e)
            }
        )