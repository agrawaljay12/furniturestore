from api.db import offers_collection, furniture_collection
from fastapi import HTTPException, status
from typing import Optional, List, Dict
from bson import ObjectId
from pydantic import BaseModel, ValidationError
import traceback
import datetime

# Helper function to convert datetime objects to strings
def convert_datetime_to_iso(item):
    if isinstance(item, dict):
        for key, value in list(item.items()):
            if isinstance(value, datetime.datetime):
                item[key] = value.isoformat()
            elif isinstance(value, dict):
                convert_datetime_to_iso(value)
            elif isinstance(value, list):
                for idx, list_item in enumerate(value):
                    if isinstance(list_item, dict):
                        convert_datetime_to_iso(list_item)
                    elif isinstance(list_item, datetime.datetime):
                        value[idx] = list_item.isoformat()
    return item

class Offer(BaseModel):
    furniture_id: str
    discount : int
    start_date: str
    end_date: str

    @staticmethod
    def add_offer(offer_data:dict)-> bool:
        try:
            result = offers_collection.insert_one(offer_data)
            if result.inserted_id:
                offer_data["_id"] = str(result.inserted_id)  # Convert ObjectId to string
                return True
            return False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )


    @staticmethod
    def get_all_offers() -> List[dict]:
        """ Returns all users from the collection. """
        try:
            offers = []
            for offer in offers_collection.find():
               offer['id'] = str(offer['_id'])  # Convert ObjectId to string and store as 'id'
               del offer['_id']  # Remove the original '_id' field
                # print(user)
               offers.append(offer)
                # print(users)
            return offers
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    @staticmethod
    def get_all_offers_with_furniture_details() -> List[dict]:
        """ Returns all offers with complete furniture details. """
        try:
            offers_with_details = []
            
            # Check if offers collection is empty
            if offers_collection.count_documents({}) == 0:
                print("No offers found in the database")
                return []
                
            for offer in offers_collection.find():
                try:
                    # Convert ObjectId to string
                    offer['id'] = str(offer['_id'])
                    del offer['_id']
                    
                    # Convert datetime objects to ISO strings
                    offer = convert_datetime_to_iso(offer)
                    
                    # Validate the furniture_id exists and is valid
                    if 'furniture_id' not in offer:
                        print(f"Skipping offer {offer['id']} - missing furniture_id")
                        continue
                        
                    furniture_id = offer['furniture_id']
                    
                    # Validate ObjectId format
                    if not ObjectId.is_valid(furniture_id):
                        print(f"Invalid ObjectId format for furniture_id: {furniture_id}")
                        continue
                        
                    # Get the furniture details
                    furniture = furniture_collection.find_one({"_id": ObjectId(furniture_id)})
                    if not furniture:
                        print(f"Furniture not found for id: {furniture_id}")
                        continue
                        
                    # Convert furniture _id to string
                    furniture['_id'] = str(furniture['_id'])
                    
                    # Convert datetime objects in furniture to ISO strings
                    furniture = convert_datetime_to_iso(furniture)
                    
                    # Merge furniture details with offer
                    combined_data = {**furniture, **offer}
                    
                    # Safely calculate discounted price
                    if 'price' in furniture and 'discount' in offer:
                        try:
                            original_price = float(furniture['price'])
                            discount_percentage = float(offer['discount'])
                            discounted_price = original_price * (1 - discount_percentage / 100)
                            combined_data['discountedPrice'] = f"{discounted_price:.2f}"
                        except (ValueError, TypeError) as e:
                            print(f"Error calculating discount for furniture {furniture_id}: {str(e)}")
                            # Still add the item but without discounted price
                            combined_data['discountedPrice'] = furniture.get('price', '0.00')
                    else:
                        # If price or discount is missing, set discounted price to regular price
                        combined_data['discountedPrice'] = furniture.get('price', '0.00')
                    
                    offers_with_details.append(combined_data)
                except Exception as item_error:
                    # Print detailed error for this specific item but continue processing others
                    print(f"Error processing offer {offer.get('id', 'unknown')}: {str(item_error)}")
                    print(traceback.format_exc())
                    continue
                    
            return offers_with_details
        except Exception as e:
            print(f"Fatal error in get_all_offers_with_furniture_details: {str(e)}")
            print(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve offers: {str(e)}"
            )
