from datetime import datetime
import random
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from api.models.Booking import Booking
from api.models.Furniture import Furniture

router = APIRouter()

# http://localhost:10007/api/v1/booking
# http://localhost:10007/api/v1/booking/
@router.get("", response_description="Api Version 1 Manager route")
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
            "data": {}
        }
    )

#path:  https://furnspace.onrender.com/api/v1/booking/create
#Method: POST
#description: Create a new booking

@router.post("/create", response_description="Create a new booking")
async def create_booking(request: Request):
    try:
        data = await request.json()
        
        # Validate required fields
        required_fields = ["user_id", "furniture_id", "booking_status", "payment_method", 
                          "delivery_address", "payment_id"]
        for field in required_fields:
            if field not in data or data.get(field) is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{field.replace('_', ' ').title()} is required"
                )
        
        # Validate delivery_address is an object with required fields
        if not isinstance(data.get("delivery_address"), dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery address must be an object"
            )
        
        address_fields = ["street", "city", "state", "zipcode", "country"]
        for field in address_fields:
            if field not in data["delivery_address"] or not data["delivery_address"].get(field):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Delivery address {field} is required"
                )
                
        # Validate is_buying is a boolean
        is_buying = data.get("is_buying", False)  # Default to False if not provided
        if not isinstance(is_buying, bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="is_buying must be a boolean value"
            )
            
        # Convert numeric values to appropriate types
        if data.get("duration") is not None:
            data["duration"] = int(data["duration"])
        if data.get("total_price") is not None:
            try:
                data["total_price"] = float(data["total_price"])
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Total price must be a valid number"
                )
            
        # Get current date and time in ISO format
        booking_date = datetime.now().isoformat(timespec='seconds') + 'Z'
        payment_date = datetime.now().isoformat(timespec='seconds') + 'Z'

        # Prepare booking data
        booking_data = {
            "user_id": data.get("user_id"),
            "furniture_id": data.get("furniture_id"),
            "booking_date": booking_date,
            "booking_status": data.get("booking_status"),
            "duration": data.get("duration"),
            "total_price": data.get("total_price"),
            "payment_id": data.get("payment_id"),
            "payment_status": data.get("payment_status", "pending"),  # Default to pending
            "payment_method": data.get("payment_method"),
            "delivery_address": data.get("delivery_address"),
            "payment_date": payment_date,
            "is_buying": is_buying
        }
        
        # Add transaction data if provided
        if data.get("transaction"):
            booking_data["transaction"] = data.get("transaction")
            
        # Add payment history if provided
        if data.get("payment_history"):
            booking_data["payment_history"] = data.get("payment_history")

        # Create booking
        result = Booking.create_booking(booking_data)
        return result
        
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )
    except Exception as e:
        # Log the exception
        print(f"Internal Server Error: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"An internal server error occurred: {str(e)}"}
        )
    
#path: https://furnspace.onrender.com/api/v1/booking/get
#Method: POST
#description: Get a booking by booking_id

@router.post("/get/{booking_id}", response_description="Get a booking by booking_id")
async def get_booking(booking_id:str,request: Request):
    try:
        if not booking_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking ID is required"
            )
        result = Booking.fetch_booking(booking_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
            
        # Process furniture images to ensure consistent format
        if "furniture_details" in result:
            for furniture in result["furniture_details"]:
                # Ensure images field is always present as an array
                if "image" in furniture and "images" not in furniture:
                    furniture["images"] = [furniture["image"]]
                elif "images" not in furniture:
                    furniture["images"] = []
                
                # Ensure single image field is set for backward compatibility
                if "images" in furniture and len(furniture["images"]) > 0 and "image" not in furniture:
                    furniture["image"] = furniture["images"][0]
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Booking found",
                "data": result
            }
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log the exception (you can use logging library here)
        print(f"Internal Server Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred"
        )
    

#path: https://furnspace.onrender.com/api/v1/booking/verify
#Method: POST
#description: verify a booking by booking_id

@router.post("/verify/{booking_id}", response_description="Verify a booking by booking_id")
async def verify_booking(booking_id:str,request: Request):
    try:
       
        print(booking_id)
        if not booking_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking ID is required"
            )
        result = Booking.verify_booking(booking_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Booking verified successfully",
                "data": result
            }
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log the exception (you can use logging library here)
        print(f"Internal Server Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred"
        )

# path: https://furnspace.onrender.com/api/v1/booking/get_with_furniture/{booking_id}
# Method: GET
# Enhanced endpoint to get booking details with furniture information
@router.get("/get_with_furniture/{booking_id}", response_description="Get booking with furniture details")
async def get_booking_with_furniture(booking_id: str):
    try:
        if not booking_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking ID is required"
            )
            
        # Call the enhanced method from the Booking model
        result = Booking.fetch_booking_with_furniture(booking_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Check if result contains error information
        if "error" in result and "traceback" in result:
            print(f"Error details from model: {result}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving booking: {result['error']}"
            )
            
        # Process furniture images to ensure consistent format
        if "furniture_details" in result:
            for furniture in result["furniture_details"]:
                # Ensure images field is always present as an array
                if "image" in furniture and "images" not in furniture:
                    furniture["images"] = [furniture["image"]]
                elif "images" not in furniture:
                    furniture["images"] = []
                
                # Ensure single image field is set for backward compatibility
                if "images" in furniture and len(furniture["images"]) > 0 and "image" not in furniture:
                    furniture["image"] = furniture["images"][0]
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Booking with furniture details found",
                "data": result
            }
        )
    except HTTPException as e:
        # Return proper JSON response for HTTP exceptions
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail, "error": True}
        )
    except Exception as e:
        # Log the exception
        import traceback
        error_trace = traceback.format_exc()
        print(f"Internal Server Error in get_with_furniture: {e}")
        print(f"Traceback: {error_trace}")
        
        # Return a proper JSON response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": f"An internal server error occurred: {str(e)}",
                "error": True
            }
        )

# path: https://furnspace.onrender.com/api/v1/booking/user/{user_id}
# Method: GET
# Add an endpoint to get all bookings for a user
@router.get("/user/{user_id}", response_description="Get all bookings for a user")
async def get_user_bookings(user_id: str):
    try:
        if not user_id or user_id.strip() == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID is required and cannot be empty"
            )
            
        # Call the method from the Booking model
        result = Booking.fetch_user_bookings(user_id)
        
        # Process furniture images to ensure consistent format
        for booking in result:
            if "furniture_details" in booking:
                for furniture in booking["furniture_details"]:
                    # Ensure images field is always present as an array
                    if "image" in furniture and "images" not in furniture:
                        furniture["images"] = [furniture["image"]]
                    elif "images" not in furniture:
                        furniture["images"] = []
                    
                    # Ensure single image field is set for backward compatibility
                    if "images" in furniture and len(furniture["images"]) > 0 and "image" not in furniture:
                        furniture["image"] = furniture["images"][0]
        
        # Convert the result to a safe format that can be JSON serialized
        from api.models.Booking import make_json_serializable
        safe_result = make_json_serializable(result)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "User bookings retrieved successfully",
                "count": len(safe_result),
                "data": safe_result
            }
        )
    except HTTPException as e:
        # Pass through HTTP exceptions with their status codes
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail, "data": []}
        )
    except Exception as e:
        # Log the exception
        print(f"Internal Server Error in get_user_bookings: {e}")
        # Return empty data with error message
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"Error retrieving user bookings: {str(e)}",
                "data": []
            }
        )

#path: https://furnspace.onrender.com/api/v1/booking/get_booking
#Method: get
#description: get all bookings

@router.get("/get_booking", description="Get all bookings")
async def get_all_bookings():
    try:
        bookings = Booking.get_all_bookings()
        return JSONResponse(
            status_code=200,
            content={
                "message": "Bookings retrieved successfully",
                "data": bookings
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# path: https://furnspace.onrender.com/api/v1/booking/revenue_statistics
# Method: GET
# New endpoint to get revenue statistics
@router.get("/revenue_statistics", description="Get booking revenue statistics")
async def get_revenue_statistics(period: str = "month"):
    try:
        # Validate period parameter
        valid_periods = ["day", "week", "month", "year"]
        if period not in valid_periods:
            period = "month"  # Default to month if invalid
            
        stats = Booking.get_revenue_statistics(period)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Revenue statistics retrieved successfully",
                "data": stats
            }
        )
    except Exception as e:
        print(f"Error in revenue_statistics endpoint: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": f"Failed to retrieve revenue statistics: {str(e)}",
                "data": {
                    "total_revenue": 0,
                    "sale_revenue": 0,
                    "rent_revenue": 0,
                    "monthly_data": [],
                    "transactions": []
                }
            }
        )

#path: https://furnspace.onrender.com/api/v1/booking/update_status/{booking_id}
#Method: POST
#description: Update the status of a booking

@router.post("/update_status/{booking_id}", response_description="Update booking status")
async def update_booking_status(booking_id: str, request: Request):
    try:
        # Get request data
        data = await request.json()
        
        # Validate required field
        if "status" not in data or not data.get("status"):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": "New status is required"}
            )
        
        new_status = data.get("status")
        
        # Call the update method from the Booking model
        result = Booking.update_booking_status(booking_id, new_status)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": result["message"],
                "data": result["booking"]
            }
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )
    except Exception as e:
        # Log the exception
        print(f"Internal Server Error in update_booking_status: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"An internal server error occurred: {str(e)}"}
        )

# New endpoint to get seller revenue statistics
# path: https://furnspace.onrender.com/api/v1/booking/seller_revenue/{seller_id}
# Method: GET
@router.get("/seller_revenue/{seller_id}", description="Get booking revenue statistics for a specific seller")
async def get_seller_revenue_statistics(seller_id: str, period: str = "month"):
    try:
        # Validate seller_id
        if not seller_id or seller_id.strip() == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seller ID is required and cannot be empty"
            )
            
        # Validate period parameter
        valid_periods = ["day", "week", "month", "year"]
        if period not in valid_periods:
            period = "month"  # Default to month if invalid
            
        # Call the method from the Booking model
        stats = Booking.get_seller_revenue_statistics(seller_id, period)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Seller revenue statistics retrieved successfully",
                "data": stats
            }
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "message": e.detail,
                "data": {
                    "total_revenue": 0,
                    "sale_revenue": 0,
                    "rent_revenue": 0,
                    "monthly_data": [],
                    "transactions": [],
                    "seller_id": seller_id
                }
            }
        )
    except Exception as e:
        print(f"Error in seller_revenue endpoint: {e}")
        import traceback
        print(traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": f"Failed to retrieve seller revenue statistics: {str(e)}",
                "data": {
                    "total_revenue": 0,
                    "sale_revenue": 0,
                    "rent_revenue": 0,
                    "monthly_data": [],
                    "transactions": [],
                    "seller_id": seller_id
                }
            }
        )