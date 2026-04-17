from datetime import datetime
import random
from bson import ObjectId
from bson.errors import InvalidId  # Add this import
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from api.db import booking_collection, furniture_collection

# Helper function to make objects JSON serializable
def make_json_serializable(obj):
    """Convert non-serializable objects to serializable format."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    else:
        return obj

class Booking(BaseModel):
    user_id: str 
    furniture_id: List[str]
    booking_date: str
    booking_status: str = "pending"
    duration: Optional[int] = None  # Duration in days
    total_price: Optional[float] = None
    payment_id: str
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    delivery_address: Optional[str] = None
    payment_date: Optional[str] = None
    is_buying: Optional[bool] = False
    transaction: Optional[dict] = None
    payment_history : Optional[List[dict]] = []
    
    @staticmethod
    def create_booking(booking_data: Dict):
        try:
            # Validate user_id
            if not booking_data.get("user_id"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User ID is required"
                )
            
            # Get furniture_id from booking data
            furniture_id = booking_data.get("furniture_id")
            
            # Handle both single string and list formats
            if isinstance(furniture_id, str):
                # Single furniture ID as string
                try:
                    # Try to convert to ObjectId to validate format
                    object_id = ObjectId(furniture_id)
                    furniture = furniture_collection.find_one({"_id": object_id})
                    if not furniture:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Furniture with ID {furniture_id} not found"
                        )
                    # Convert to list format for model compatibility
                    booking_data["furniture_id"] = [str(furniture["_id"])]
                except InvalidId:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid furniture ID format: {furniture_id}"
                    )
                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Error processing furniture ID: {str(e)}"
                    )
                
            elif isinstance(furniture_id, list):
                # List of furniture IDs
                if len(furniture_id) == 0:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="At least one furniture ID is required"
                    )
                    
                validated_ids = []
                for fid in furniture_id:
                    try:
                        object_id = ObjectId(fid)
                        furniture = furniture_collection.find_one({"_id": object_id})
                        if not furniture:
                            raise HTTPException(
                                status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Furniture with ID {fid} not found"
                            )
                        validated_ids.append(str(furniture["_id"]))
                    except InvalidId:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid furniture ID format: {fid}"
                        )
                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Error processing furniture ID {fid}: {str(e)}"
                        )
                booking_data["furniture_id"] = validated_ids
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"furniture_id must be a string or list, got {type(furniture_id).__name__}"
                )
            
            # Handle is_buying and duration logic
            is_buying = booking_data.get("is_buying", False)
            if is_buying:
                # If buying, don't store duration
                if "duration" in booking_data:
                    del booking_data["duration"]
            
            # Create booking document
            try:
                # You might need to convert the booking data to match your model
                result = booking_collection.insert_one(booking_data)
                
                # Update furniture status to "booked"
                for fid in booking_data["furniture_id"]:
                    try:
                        furniture_collection.update_one(
                            {"_id": ObjectId(fid)},
                            {"$set": {"availability_status": "booked"}}
                        )
                    except Exception as e:
                        print(f"Failed to update furniture status for {fid}: {str(e)}")
                
                return JSONResponse(
                    status_code=status.HTTP_201_CREATED,
                    content={
                        "message": "Booking created successfully",
                        "data": {
                            "booking_id": str(result.inserted_id),
                            "user_id": booking_data["user_id"],
                            "furniture_id": booking_data["furniture_id"]
                        }
                    }
                )
            except Exception as e:
                print(f"Database error: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create booking: {str(e)}"
                )
            
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"message": e.detail}
            )
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"message": f"An unexpected error occurred: {str(e)}"}
            )

    @staticmethod
    def fetch_booking(booking_id: str):
        try:
            # Convert string ID to ObjectId
            booking_obj_id = ObjectId(booking_id)
            
            # Find the booking
            booking = booking_collection.find_one({"_id": booking_obj_id})
            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found"
                )
                
            # Convert booking _id to string
            booking["id"] = str(booking["_id"])
            del booking["_id"]
            
            # Get furniture details for each furniture_id in the booking
            furniture_details = []
            for furniture_id in booking.get("furniture_id", []):
                try:
                    furniture_obj_id = ObjectId(furniture_id)
                    furniture = furniture_collection.find_one({"_id": furniture_obj_id})
                    if furniture:
                        # Convert furniture _id to string
                        furniture["_id"] = str(furniture["_id"])
                        furniture_details.append(furniture)
                except Exception as e:
                    print(f"Error fetching furniture {furniture_id}: {e}")
                    # Continue with other furniture items even if one fails
            
            # Add furniture details to the booking
            booking["furniture_details"] = furniture_details
            
            return booking
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while fetching the booking: {str(e)}"
            )
        
    @staticmethod
    def verify_booking(booking_id: str):
        try:
            booking = booking_collection.find_one({"_id": ObjectId(booking_id)})
            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found"
                )
            booking["id"] = str(booking["_id"])  # Convert ObjectId to str
            del booking["_id"]  # Remove _id key from the dictionary
            # print(booking_id)
            return booking_id # Return the booking_id
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while verifying the booking: {str(e)}"
            )

    @staticmethod
    def fetch_booking_with_furniture(booking_id: str):
        try:
            # Check if booking_id is a valid string
            if not booking_id or not isinstance(booking_id, str):
                print(f"Invalid booking_id format: {booking_id}")
                return None
                
            # Convert string ID to ObjectId with proper error handling
            try:
                booking_obj_id = ObjectId(booking_id)
            except InvalidId:
                print(f"Invalid ObjectId format for booking_id: {booking_id}")
                return None
            
            # Find the booking
            booking = booking_collection.find_one({"_id": booking_obj_id})
            if not booking:
                print(f"No booking found with ID: {booking_id}")
                return None
            
            # Convert booking _id to string
            booking["_id"] = str(booking["_id"])
            
            # Ensure furniture_id exists and is a list
            if "furniture_id" not in booking:
                print(f"Booking {booking_id} has no furniture_id field")
                booking["furniture_id"] = []
            elif isinstance(booking["furniture_id"], str):
                # Handle case where furniture_id might be a string instead of list
                booking["furniture_id"] = [booking["furniture_id"]]
            
            # Get furniture details for each furniture_id in the booking
            furniture_details = []
            for furniture_id in booking.get("furniture_id", []):
                try:
                    furniture_obj_id = ObjectId(furniture_id)
                    furniture = furniture_collection.find_one({"_id": furniture_obj_id})
                    if furniture:
                        # Convert furniture _id to string
                        furniture["_id"] = str(furniture["_id"])
                        furniture_details.append(furniture)
                    else:
                        print(f"Furniture not found for ID: {furniture_id} in booking {booking_id}")
                except InvalidId:
                    print(f"Invalid furniture ObjectId format: {furniture_id} in booking {booking_id}")
                    continue
                except Exception as furniture_error:
                    print(f"Error fetching furniture {furniture_id}: {furniture_error}")
                    # Continue with other furniture items even if one fails
                    continue
            
            # Add furniture details to the booking
            booking["furniture_details"] = furniture_details
            
            # Make booking data safe for JSON serialization
            booking = make_json_serializable(booking)
            
            return booking
        except Exception as e:
            print(f"Error in fetch_booking_with_furniture for ID {booking_id}: {e}")
            # Instead of raising the exception, return detailed error information
            import traceback
            error_details = {
                "_id": booking_id if booking_id else "unknown",
                "error": str(e),
                "traceback": traceback.format_exc()
            }
            print(f"Detailed error traceback: {error_details['traceback']}")
            return error_details

    @staticmethod
    def fetch_user_bookings(user_id: str):
        try:
            # Validate user_id
            if not user_id or not isinstance(user_id, str) or user_id.strip() == "":
                print("Error: Invalid or empty user_id provided")
                return []
                
            # Find all bookings for the user with case-insensitive matching
            # This helps if user_id is stored inconsistently (uppercase/lowercase)
            import re
            user_id_pattern = re.compile(f"^{re.escape(user_id)}$", re.IGNORECASE)
            bookings_cursor = booking_collection.find({"user_id": {"$regex": user_id_pattern}})
            
            # Convert to list and process each booking
            bookings = []
            for booking in bookings_cursor:
                try:
                    # Convert booking _id to string
                    booking["_id"] = str(booking["_id"])
                    
                    # Get furniture details for each furniture_id in the booking
                    furniture_details = []
                    if "furniture_id" in booking and booking["furniture_id"]:
                        # Handle both string and list formats for furniture_id
                        furniture_ids = booking["furniture_id"]
                        if isinstance(furniture_ids, str):
                            furniture_ids = [furniture_ids]
                            
                        for furniture_id in furniture_ids:
                            try:
                                furniture_obj_id = ObjectId(furniture_id)
                                furniture = furniture_collection.find_one({"_id": furniture_obj_id})
                                if furniture:
                                    # Convert furniture _id to string
                                    furniture["_id"] = str(furniture["_id"])
                                    furniture_details.append(furniture)
                            except Exception as e:
                                print(f"Error fetching furniture {furniture_id}: {e}")
                                # Continue with other furniture items even if one fails
                    
                    # Add furniture details to the booking
                    booking["furniture_details"] = furniture_details
                    
                    # Ensure all values are JSON serializable by converting datetime objects
                    booking = make_json_serializable(booking)
                    
                    bookings.append(booking)
                except Exception as inner_e:
                    print(f"Error processing booking: {inner_e}")
                    # Continue with the next booking
            
            print(f"Retrieved {len(bookings)} bookings for user {user_id}")
            return bookings
        except Exception as e:
            print(f"Error in fetch_user_bookings: {e}")
            # Return empty list instead of raising exception
            return []

    @staticmethod
    def get_all_bookings():
        try:
            # Fetch all bookings
            bookings_cursor = booking_collection.find({})
            bookings = []
            for booking in bookings_cursor:
                # Convert booking _id to string
                booking["_id"] = str(booking["_id"])
                bookings.append(booking)
            return bookings
        except Exception as e:
            print(f"Error in get_all_bookings: {e}")
            return []
            
    @staticmethod
    def get_revenue_statistics(period="month"):
        """
        Fetch booking statistics for revenue calculations including:
        - Total revenue
        - Revenue from sales
        - Revenue from rentals
        - Time-based breakdown (day, week, month, year)
        
        Args:
            period (str): The time period to group by - 'day', 'week', 'month', or 'year'
        """
        try:
            # Fetch all bookings
            bookings_cursor = booking_collection.find({})
            
            # Initialize statistics
            stats = {
                "total_revenue": 0,
                "sale_revenue": 0,
                "rent_revenue": 0,
                "period_data": {},
                "transactions": []
            }
            
            # Process each booking
            for booking in bookings_cursor:
                try:
                    # Extract booking information
                    booking_id = str(booking["_id"])
                    booking_date = booking.get("booking_date") or booking.get("created_at") or datetime.now().isoformat()
                    
                    # Convert string date to datetime if needed
                    if isinstance(booking_date, str):
                        try:
                            booking_date = datetime.fromisoformat(booking_date.replace('Z', '+00:00'))
                        except ValueError:
                            # Fallback if date format is unexpected
                            booking_date = datetime.now()
                    
                    # Generate period label based on selected period
                    if period == "day":
                        period_label = booking_date.strftime("%Y-%m-%d")
                    elif period == "week":
                        # Get the week number and year
                        year = booking_date.strftime("%Y")
                        week = booking_date.strftime("%U")
                        period_label = f"{year}-W{week}"
                    elif period == "year":
                        period_label = booking_date.strftime("%Y")
                    else:  # default to month
                        period_label = booking_date.strftime("%b %Y")
                    
                    # Get display label for frontend
                    if period == "day":
                        display_label = booking_date.strftime("%d %b")
                    elif period == "week":
                        display_label = f"Week {booking_date.strftime('%U')}"
                    elif period == "year":
                        display_label = booking_date.strftime("%Y")
                    else:  # default to month
                        display_label = booking_date.strftime("%b")
                    
                    # Amount calculation
                    amount = float(booking.get("total_price") or 0)
                    
                    # Skip if amount is zero or negative
                    if amount <= 0:
                        continue
                    
                    # Determine if it's a rent or sale
                    is_buying = booking.get("is_buying", False)
                    
                    # Initialize period data if not exists
                    if period_label not in stats["period_data"]:
                        stats["period_data"][period_label] = {
                            "label": display_label,
                            "rentRevenue": 0,
                            "saleRevenue": 0,
                            "totalRevenue": 0
                        }
                    
                    # Update statistics based on transaction type
                    if is_buying:
                        stats["sale_revenue"] += amount
                        stats["period_data"][period_label]["saleRevenue"] += amount
                    else:
                        stats["rent_revenue"] += amount
                        stats["period_data"][period_label]["rentRevenue"] += amount
                    
                    # Update total revenue
                    stats["total_revenue"] += amount
                    stats["period_data"][period_label]["totalRevenue"] += amount
                    
                    # Get furniture details if available
                    furniture_name = "Unknown Item"
                    furniture_id = ""
                    furniture_image = ""
                    
                    if "furniture_id" in booking:
                        furniture_ids = booking["furniture_id"]
                        if isinstance(furniture_ids, str):
                            furniture_ids = [furniture_ids]
                        
                        # Take the first furniture item for transaction display
                        if furniture_ids and len(furniture_ids) > 0:
                            try:
                                furniture = furniture_collection.find_one({"_id": ObjectId(furniture_ids[0])})
                                if furniture:
                                        furniture_id = str(furniture["_id"])
                                        furniture_name = furniture.get("name", "Unknown Item")
                                        furniture_image = furniture.get("image", "")
                                        if not furniture_image and "images" in furniture and len(furniture["images"]) > 0:
                                            furniture_image = furniture["images"][0]
                            except Exception as f_err:
                                    print(f"Error fetching furniture details: {f_err}")
                    
                    # Format the user name better
                    user_id = booking.get("user_id", "")
                    user_name = "Unknown User"
                    
                    # Try to fetch user details from a user collection if you have one
                    try:
                        from api.db import user_collection
                        if user_id:
                            user = user_collection.find_one({"_id": ObjectId(user_id)})
                            if user:
                                # Try to get the full name
                                name_parts = []
                                if user.get("name"):
                                    name_parts.append(user.get("name"))
                                elif user.get("first_name") or user.get("last_name"):
                                    if user.get("first_name"):
                                        name_parts.append(user.get("first_name"))
                                    if user.get("last_name"):
                                        name_parts.append(user.get("last_name"))
                                
                                if name_parts:
                                    user_name = " ".join(name_parts)
                                else:
                                    # Fallback to username or email
                                    user_name = user.get("username", user.get("email", "Unknown User"))
                    except (ImportError, Exception) as u_err:
                        # If user collection isn't available, use a placeholder
                        print(f"Couldn't fetch user details: {u_err}")
                        user_name = f"User #{user_id[-6:]}" if user_id else "Unknown User"
                    
                    # Add transaction details
                    transaction = {
                        "id": booking_id,
                        "userId": user_id,
                        "userName": user_name,
                        "furnitureId": furniture_id,
                        "furnitureName": furniture_name,
                        "furnitureImage": furniture_image,
                        "amount": amount,
                        "date": booking_date,
                        "type": "Sale" if is_buying else "Rent",
                        "status": booking.get("booking_status", "Completed")
                    }
                    
                    stats["transactions"].append(transaction)
                    
                except Exception as booking_err:
                    print(f"Error processing booking {booking.get('_id')}: {booking_err}")
                    continue
            
            # Convert period data to array format for frontend charts
            period_data_array = []
            for period_key, data in stats["period_data"].items():
                period_data_array.append({
                    "period": period_key,
                    "label": data["label"],
                    "rentRevenue": round(data["rentRevenue"], 2),
                    "saleRevenue": round(data["saleRevenue"], 2),
                    "totalRevenue": round(data["totalRevenue"], 2)
                })
            
            # Sort period data
            if period == "day":
                period_data_array = sorted(period_data_array, key=lambda x: x["period"])
            elif period == "week":
                period_data_array = sorted(period_data_array, key=lambda x: x["period"])
            elif period == "year":
                period_data_array = sorted(period_data_array, key=lambda x: x["period"])
            elif period == "month":
                # For months, sort by the month order
                month_order = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, 
                              "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}
                
                def month_year_key(item):
                    parts = item["label"].split()
                    if len(parts) == 1:
                        # Just month name
                        return (datetime.now().year, month_order.get(parts[0], 13))
                    else:
                        # Month and year
                        try:
                            return (int(parts[1]), month_order.get(parts[0], 13))
                        except:
                            return (9999, 13)  # Default high value for invalid format
                    
                period_data_array = sorted(period_data_array, key=month_year_key)
            
            # Sort transactions by date (newest first)
            stats["transactions"] = sorted(
                stats["transactions"], 
                key=lambda x: x["date"] if isinstance(x["date"], datetime) else datetime.now(),
                reverse=True
            )
            
            # Convert datetime objects to strings for JSON serialization
            stats["transactions"] = make_json_serializable(stats["transactions"])
            
            # Replace period_data dictionary with sorted array
            stats["period_data"] = period_data_array
            
            # For backward compatibility, provide monthly_data as well
            stats["monthly_data"] = stats["period_data"]
            
            # Round totals to 2 decimal places
            stats["total_revenue"] = round(stats["total_revenue"], 2)
            stats["sale_revenue"] = round(stats["sale_revenue"], 2)
            stats["rent_revenue"] = round(stats["rent_revenue"], 2)
            
            # Add period info
            stats["period"] = period
            
            return stats
            
        except Exception as e:
            print(f"Error calculating revenue statistics: {e}")
            return {
                "total_revenue": 0,
                "sale_revenue": 0,
                "rent_revenue": 0,
                "period_data": [],
                "monthly_data": [],
                "transactions": [],
                "period": period
            }

    @staticmethod
    def update_booking_status(booking_id: str, new_status: str):
        """
        Update the status of a booking
        
        Args:
            booking_id (str): The ID of the booking to update
            new_status (str): The new status to set for the booking
            
        Returns:
            dict: The updated booking information
        """
        try:
            # Validate booking_id
            if not booking_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Booking ID is required"
                )
                
            # Validate new_status
            valid_statuses = ["pending", "processing","shipped","deliverd"]
            if not new_status or new_status not in valid_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status. Status must be one of: {', '.join(valid_statuses)}"
                )
                
            # Convert string ID to ObjectId
            try:
                booking_obj_id = ObjectId(booking_id)
            except InvalidId:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid booking ID format"
                )
                
            # Find the booking
            booking = booking_collection.find_one({"_id": booking_obj_id})
            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found"
                )
                
            # Update the booking status
            result = booking_collection.update_one(
                {"_id": booking_obj_id},
                {"$set": {"booking_status": new_status}}
            )
            
            if result.modified_count == 0:
                # No changes were made
                if result.matched_count > 0:
                    # Booking was found but status was already set to new_status
                    pass
                else:
                    # Booking wasn't found (shouldn't happen since we checked above)
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Booking not found during update"
                    )
                    
            # Get the updated booking
            updated_booking = booking_collection.find_one({"_id": booking_obj_id})
            if not updated_booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Failed to retrieve updated booking"
                )
                
            # Convert booking _id to string
            updated_booking["_id"] = str(updated_booking["_id"])
            
            return {
                "message": "Booking status updated successfully",
                "booking": updated_booking
            }
            
        except HTTPException as e:
            # Re-raise HTTP exceptions for proper handling in the route
            raise e
        except Exception as e:
            print(f"Error in update_booking_status: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while updating the booking status: {str(e)}"
            )

    @staticmethod
    def get_seller_revenue_statistics(seller_id: str, period="month"):
        """
        Fetch booking statistics for revenue calculations for a specific seller including:
        - Total revenue
        - Revenue from sales
        - Revenue from rentals
        - Time-based breakdown (day, week, month, year)
        - Recent purchase information
        
        Args:
            seller_id (str): The ID of the seller
            period (str): The time period to group by - 'day', 'week', 'month', or 'year'
        """
        try:
            # First, fetch all furniture created by this seller
            seller_furniture = list(furniture_collection.find({"created_by": seller_id}))
            
            if not seller_furniture:
                # No furniture found for this seller
                return {
                    "total_revenue": 0,
                    "sale_revenue": 0,
                    "rent_revenue": 0,
                    "period_data": [],
                    "monthly_data": [],
                    "transactions": [],
                    "period": period,
                    "seller_id": seller_id,
                    "furniture_count": 0
                }
            
            # Extract furniture IDs
            seller_furniture_ids = [str(furniture["_id"]) for furniture in seller_furniture]
            
            # Initialize statistics
            stats = {
                "total_revenue": 0,
                "sale_revenue": 0,
                "rent_revenue": 0,
                "period_data": {},
                "transactions": [],
                "period": period,
                "seller_id": seller_id,
                "furniture_count": len(seller_furniture_ids)
            }
            
            # Fetch all bookings
            bookings_cursor = booking_collection.find({})
            
            # Process each booking
            for booking in bookings_cursor:
                try:
                    booking_furniture_ids = booking.get("furniture_id", [])
                    
                    # Skip if booking has no furniture
                    if not booking_furniture_ids:
                        continue
                    
                    # Convert to list if it's a string
                    if isinstance(booking_furniture_ids, str):
                        booking_furniture_ids = [booking_furniture_ids]
                    
                    # Check if any of the seller's furniture is in this booking
                    seller_items_in_booking = []
                    for furniture_id in booking_furniture_ids:
                        if furniture_id in seller_furniture_ids:
                            seller_items_in_booking.append(furniture_id)
                    
                    # Skip if none of the seller's furniture is in this booking
                    if not seller_items_in_booking:
                        continue
                    
                    # Extract booking information
                    booking_id = str(booking["_id"])
                    booking_date = booking.get("booking_date") or booking.get("created_at") or datetime.now().isoformat()
                    
                    # Convert string date to datetime if needed
                    if isinstance(booking_date, str):
                        try:
                            booking_date = datetime.fromisoformat(booking_date.replace('Z', '+00:00'))
                        except ValueError:
                            # Fallback if date format is unexpected
                            booking_date = datetime.now()
                    
                    # Generate period label based on selected period
                    if period == "day":
                        period_label = booking_date.strftime("%Y-%m-%d")
                        display_label = booking_date.strftime("%d %b")
                    elif period == "week":
                        # Get the week number and year
                        year = booking_date.strftime("%Y")
                        week = booking_date.strftime("%U")
                        period_label = f"{year}-W{week}"
                        display_label = f"Week {booking_date.strftime('%U')}"
                    elif period == "year":
                        period_label = booking_date.strftime("%Y")
                        display_label = booking_date.strftime("%Y")
                    else:  # default to month
                        period_label = booking_date.strftime("%b %Y")
                        display_label = booking_date.strftime("%b")
                    
                    # Calculate revenue only for this seller's furniture in the booking
                    total_booking_amount = float(booking.get("total_price") or 0)
                    
                    # If there are multiple furniture items in the booking and not all belong to this seller,
                    # we need to calculate the proportional amount
                    if len(booking_furniture_ids) > len(seller_items_in_booking):
                        # If we can determine individual item prices, use that information
                        # For now, we'll use a simple proportion
                        seller_proportion = len(seller_items_in_booking) / len(booking_furniture_ids)
                        amount = total_booking_amount * seller_proportion
                    else:
                        # All items in the booking belong to this seller
                        amount = total_booking_amount
                    
                    # Skip if amount is zero or negative
                    if amount <= 0:
                        continue
                    
                    # Initialize period data if not exists
                    if period_label not in stats["period_data"]:
                        stats["period_data"][period_label] = {
                            "label": display_label,
                            "rentRevenue": 0,
                            "saleRevenue": 0,
                            "totalRevenue": 0
                        }
                    
                    # Determine if it's a rent or sale
                    is_buying = booking.get("is_buying", False)
                    
                    # Update statistics based on transaction type
                    if is_buying:
                        stats["sale_revenue"] += amount
                        stats["period_data"][period_label]["saleRevenue"] += amount
                    else:
                        stats["rent_revenue"] += amount
                        stats["period_data"][period_label]["rentRevenue"] += amount
                    
                    # Update total revenue
                    stats["total_revenue"] += amount
                    stats["period_data"][period_label]["totalRevenue"] += amount
                    
                    # Add detailed transaction information for each of seller's items in this booking
                    for furniture_id in seller_items_in_booking:
                        # Get furniture details
                        furniture = None
                        for f in seller_furniture:
                            if str(f["_id"]) == furniture_id:
                                furniture = f
                                break
                        
                        if not furniture:
                            continue
                            
                        furniture_name = furniture.get("title", "Unknown Item")
                        furniture_image = furniture.get("image", "")
                        if not furniture_image and "images" in furniture and len(furniture["images"]) > 0:
                            furniture_image = furniture["images"][0]
                            
                        # Calculate per-item amount (approximate)
                        item_amount = amount / len(seller_items_in_booking)
                            
                        # Get customer information
                        user_id = booking.get("user_id", "")
                        user_name = "Unknown User"
                        
                        # Try to fetch user details
                        try:
                            from api.db import users_collection
                            if user_id:
                                user = users_collection.find_one({"_id": ObjectId(user_id)})
                                if user:
                                    if user.get("first_name") or user.get("last_name"):
                                        name_parts = []
                                        if user.get("first_name"):
                                            name_parts.append(user.get("first_name"))
                                        if user.get("last_name"):
                                            name_parts.append(user.get("last_name"))
                                        user_name = " ".join(name_parts)
                                    else:
                                        user_name = user.get("email", "Unknown User")
                        except Exception as u_err:
                            print(f"Error fetching user details: {u_err}")
                        
                        # Add transaction details
                        transaction = {
                            "id": booking_id,
                            "furnitureId": furniture_id,
                            "furnitureName": furniture_name,
                            "furnitureImage": furniture_image,
                            "userId": user_id,
                            "userName": user_name,
                            "amount": round(item_amount, 2),
                            "date": booking_date,
                            "type": "Sale" if is_buying else "Rent",
                            "status": booking.get("booking_status", "Completed")
                        }
                        
                        stats["transactions"].append(transaction)
                        
                except Exception as booking_err:
                    print(f"Error processing booking {booking.get('_id')}: {booking_err}")
                    continue
            
            # Convert period data to array format for frontend charts
            period_data_array = []
            for period_key, data in stats["period_data"].items():
                period_data_array.append({
                    "period": period_key,
                    "label": data["label"],
                    "rentRevenue": round(data["rentRevenue"], 2),
                    "saleRevenue": round(data["saleRevenue"], 2),
                    "totalRevenue": round(data["totalRevenue"], 2)
                })
            
            # Sort period data
            if period == "day":
                period_data_array = sorted(period_data_array, key=lambda x: x["period"])
            elif period == "week":
                period_data_array = sorted(period_data_array, key=lambda x: x["period"])
            elif period == "year":
                period_data_array = sorted(period_data_array, key=lambda x: x["period"])
            elif period == "month":
                # For months, sort by the month order
                month_order = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, 
                              "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}
                
                def month_year_key(item):
                    parts = item["label"].split()
                    if len(parts) == 1:
                        # Just month name
                        return (datetime.now().year, month_order.get(parts[0], 13))
                    else:
                        # Month and year
                        try:
                            return (int(parts[1]), month_order.get(parts[0], 13))
                        except:
                            return (9999, 13)  # Default high value for invalid format
                    
                period_data_array = sorted(period_data_array, key=month_year_key)
            
            # Sort transactions by date (newest first)
            stats["transactions"] = sorted(
                stats["transactions"], 
                key=lambda x: x["date"] if isinstance(x["date"], datetime) else datetime.now(),
                reverse=True
            )
            
            # Convert datetime objects to strings for JSON serialization
            stats["transactions"] = make_json_serializable(stats["transactions"])
            
            # Replace period_data dictionary with sorted array
            stats["period_data"] = period_data_array
            
            # For backward compatibility, provide monthly_data as well
            stats["monthly_data"] = stats["period_data"]
            
            # Round totals to 2 decimal places
            stats["total_revenue"] = round(stats["total_revenue"], 2)
            stats["sale_revenue"] = round(stats["sale_revenue"], 2)
            stats["rent_revenue"] = round(stats["rent_revenue"], 2)
            
            return stats
            
        except Exception as e:
            print(f"Error calculating seller revenue statistics: {e}")
            import traceback
            print(traceback.format_exc())
            return {
                "total_revenue": 0,
                "sale_revenue": 0,
                "rent_revenue": 0,
                "period_data": [],
                "monthly_data": [],
                "transactions": [],
                "period": period,
                "seller_id": seller_id,
                "furniture_count": 0,
                "error": str(e)
            }
