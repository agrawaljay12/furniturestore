from typing import List
from fastapi import APIRouter, HTTPException, status, Request, File, UploadFile, Form 
from pydantic import ValidationError
from fastapi.responses import JSONResponse
from api.models.Review import Review
import re
import json
router = APIRouter()

# https://localhost:10007/api/v1/review
# https://localhost:10007/api/v1/review/

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

# Add Review information
# Description: Add review information
# Request Type: POST
# path :  https://furnspace.onrender.com/api/v1/review/add
# Default Port: 10007

@router.post("/add", response_description="Add Review")
async def add_review(request: Request):
    try:
        data = await request.json()
        userid = data.get('userid')
        productid = data.get('productid')
        rating = data.get('rating')
        review = data.get('review')
        created_at = data.get('created_at')
        data = {
            "userid": userid,
            "productid": productid,
            "rating": rating,
            "review": review,
            "created_at": created_at
        }
        result = Review.add_review(data)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": 201,
                "status_message": "Created",
                "data": result
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Get reviews for a specific product
# Description: Get all reviews for a specific product
# Request Type: GET
# path :  https://furnspace.onrender.com/api/v1/review/get/{product_id}
# Default Port: 10007

@router.get("/get/{product_id}", response_description="Get Product Reviews")
async def get_product_reviews(product_id: str):
    try:
        # The Review.get_reviews_by_product already returns a complete response object
        # with status code, message, and data
        response = Review.get_reviews_by_product(product_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
# path :  https://furnspace.onrender.com/api/v1/review/list
# Description: Get a list of all reviews
# Request Type: GET
# Default Port: 10007
 
@router.get("/list", response_description="List All Reviews")
async def list_reviews():
    try:
        reviews = Review.get_all_reviews()
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "data": reviews
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Update a review
# Description: Update an existing review
# Request Type: PUT
# path :  https://furnspace.onrender.com/api/v1/review/update/{review_id}
# Default Port: 10007

@router.put("/update/{review_id}", response_description="Update Review")
async def update_review(review_id: str, request: Request):
    try:
        data = await request.json()
        # Only allow updating rating, review content, or created_at
        update_data = {}
        if 'rating' in data:
            update_data['rating'] = data['rating']
        if 'review' in data:
            update_data['review'] = data['review']
        if 'created_at' in data:
            update_data['created_at'] = data['created_at']
        
        if not update_data:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "status": 400,
                    "status_message": "Bad Request",
                    "error": "No valid fields to update"
                }
            )
        
        result = Review.update_review(review_id, update_data)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "message": "Review updated successfully",
                "data": result
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Get a single review by ID
# Description: Get a specific review by its ID
# Request Type: GET
# path :  https://furnspace.onrender.com/api/v1/review/{review_id}
# Default Port: 10007

@router.get("/{review_id}", response_description="Get Review by ID")
async def get_review(review_id: str):
    try:
        review = Review.get_review_by_id(review_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "data": review
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Get reviews for a specific seller
# Description: Get all reviews for furniture items created by a specific seller
# Request Type: GET
# path :  https://furnspace.onrender.com/api/v1/review/seller/{seller_id}
# Default Port: 10007

@router.get("/seller/{seller_id}", response_description="Get Seller Reviews")
async def get_seller_reviews(seller_id: str):
    try:
        # The Review.get_reviews_by_seller already returns a complete response object
        # with status code, message, and data
        response = Review.get_reviews_by_seller(seller_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
