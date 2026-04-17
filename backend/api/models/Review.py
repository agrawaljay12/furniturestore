from api.db import reviews_collection
from fastapi import HTTPException, status
from bson import ObjectId
from typing import List, Dict, Any, Optional
# Need to import furniture_collection for seller query
from api.db import furniture_collection

class Review:
    userid: str
    productid: str
    rating: int
    review: str
    created_at: str

    @staticmethod
    def add_review(review_data: dict) -> bool:
        """
        Add a new review to the database
        
        Args:
            review_data (dict): Review data including userid, productid, rating, review, created_at
            
        Returns:
            bool: True if successful, False otherwise
            
        Raises:
            HTTPException: If there's an error during insertion
        """
        try:
            # Input validation
            required_fields = ['userid', 'productid', 'rating', 'review']
            for field in required_fields:
                if field not in review_data or not review_data[field]:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure rating is an integer between 1 and 5
            if not isinstance(review_data['rating'], int) or not (1 <= review_data['rating'] <= 5):
                review_data['rating'] = int(review_data['rating'])
                if not (1 <= review_data['rating'] <= 5):
                    raise ValueError("Rating must be between 1 and 5")
            
            # Insert the review
            result = reviews_collection.insert_one(review_data)
            return True if result.inserted_id else False
            
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @staticmethod
    def get_reviews_by_product(product_id: str) -> List[Dict[str, Any]]:
        """
        Get all reviews for a specific product
        
        Args:
            product_id (str): The ID of the product
            
        Returns:
            List[Dict[str, Any]]: List of reviews
            
        Raises:
            HTTPException: If there's an error during retrieval
        """
        try:
            reviews = list(reviews_collection.find({"productid": product_id}))
            
            # Convert ObjectId to string
            for review in reviews:
                if "_id" in review:
                    review["_id"] = str(review["_id"])
            
            return {
                "status": 200,
                "status_message": "OK",
                "data": reviews
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @staticmethod
    def get_all_reviews() -> List[Dict[str, Any]]:
        """
        Get all reviews in the database
        
        Returns:
            List[Dict[str, Any]]: List of all reviews
            
        Raises:
            HTTPException: If there's an error during retrieval
        """
        try:
            reviews = list(reviews_collection.find())
            
            # Convert ObjectId to string
            for review in reviews:
                if "_id" in review:
                    review["_id"] = str(review["_id"])
            
            return reviews
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @staticmethod
    def update_review(review_id: str, update_data: dict) -> bool:
        """
        Update an existing review
        
        Args:
            review_id (str): The ID of the review to update
            update_data (dict): The fields to update
            
        Returns:
            bool: True if successful, False otherwise
            
        Raises:
            HTTPException: If there's an error during update
        """
        try:
            # Convert string ID to ObjectId
            review_oid = ObjectId(review_id)
            
            # Input validation for rating if present
            if 'rating' in update_data:
                if not isinstance(update_data['rating'], int) or not (1 <= update_data['rating'] <= 5):
                    update_data['rating'] = int(update_data['rating'])
                    if not (1 <= update_data['rating'] <= 5):
                        raise ValueError("Rating must be between 1 and 5")
            
            # Update the review
            result = reviews_collection.update_one(
                {"_id": review_oid},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise ValueError(f"Review with ID {review_id} not found")
            
            return True
            
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @staticmethod
    def get_review_by_id(review_id: str) -> Dict[str, Any]:
        """
        Get a review by its ID
        
        Args:
            review_id (str): The ID of the review
            
        Returns:
            Dict[str, Any]: The review data
            
        Raises:
            HTTPException: If the review is not found or there's an error
        """
        try:
            # Convert string ID to ObjectId
            review_oid = ObjectId(review_id)
            
            # Find the review
            review = reviews_collection.find_one({"_id": review_oid})
            
            if not review:
                raise ValueError(f"Review with ID {review_id} not found")
            
            # Convert ObjectId to string for JSON serialization
            review["_id"] = str(review["_id"])
            
            return review
            
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(ve)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @staticmethod
    def get_reviews_by_seller(seller_id: str) -> Dict[str, Any]:
        """
        Get all reviews for furniture items created by a specific seller
        
        Args:
            seller_id (str): The ID of the seller/creator
            
        Returns:
            Dict[str, Any]: Object containing status and list of reviews
            
        Raises:
            HTTPException: If there's an error during retrieval
        """
        try:
            # First, find all furniture items created by this seller
            furniture_items = list(furniture_collection.find({"created_by": seller_id}))
            
            if not furniture_items:
                return {
                    "status": 200,
                    "status_message": "OK",
                    "data": []
                }
            
            # Extract the product IDs from these furniture items
            product_ids = [str(item["_id"]) for item in furniture_items]
            
            # Find all reviews for these product IDs
            reviews = list(reviews_collection.find({"productid": {"$in": product_ids}}))
            
            # Convert ObjectId to string
            for review in reviews:
                if "_id" in review:
                    review["_id"] = str(review["_id"])
                
                # Add furniture details to each review
                for item in furniture_items:
                    if str(item["_id"]) == review["productid"]:
                        review["furniture_title"] = item.get("title", "Unknown")
                        review["furniture_category"] = item.get("category", "Unknown")
                        break
            
            return {
                "status": 200,
                "status_message": "OK",
                "data": reviews
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

