from datetime import datetime
from fastapi import APIRouter,HTTPException, status, Request, UploadFile ,File,Depends
from fastapi.params import Form, Query
from pydantic import ValidationError
from fastapi.responses import JSONResponse
from api.models.Furniture import Furniture
from api.models.FileUpload import FileUpload
from pymongo import ASCENDING, DESCENDING
from typing import List, Optional ,Union  
import json
from bson import ObjectId    
router = APIRouter()
import re
from api.models.FileUpload import FileUpload
# https://localhost:10007/api/v1/furniture
# https://localhost:10007/api/v1/furniture/
@router.get("", response_description="Api furniture Home")
@router.get("/", response_description="Api furniture Home")
async def hello_world():
    return {
        "location" : "api/v1/furniture",
        "message" : "API Version V1 - Initial Version",
        "version" : "1.0.0",
        "status" : 200,
        "status_message" : "OK... Working Mail Home",
        "data" : {
            "message" : "Welcome to the Mail Home"
        }
    }
# Request Type : POST
# Path :https://furnspace.onrender.com/api/v1/furniture/add
# Default Port : 10007
@router.post("/add", response_description="Add New Furniture")
async def add(request: Request, files: List[UploadFile] = File(...)):
    form = await request.form()
    data = json.loads(form.get('data'))
    print(form)
    print(data)
    title = data.get('title')
    description = data.get('description')
    category = data.get('category')
    price = data.get('price')
    is_for_rent = data.get('is_for_rent')
    rent_price = data.get('rent_price')
    is_for_sale = data.get('is_for_sale')
    condition = data.get('condition')
    availability_status = data.get('availability_status')
    dimensions = data.get('dimensions')
    location = data.get('location')
    created_by = data.get('created_by')
    brand = data.get('brand')
    try:
       
        # Validate title
        if not re.match(r'^[A-Za-z\s]+$', title):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must contain only letters and spaces."
            )
        # Validate description
        
        # Validate category
        if not re.match(r'^[A-Za-z\s]+$', category):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category must contain only letters and spaces."
            )
        # Validate price
        # if not re.match(r'^\d+(\.\d{1,4})?$', str(price)):
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Price must be a number with up to 4 decimal places."
        #     )
        # Validate is_for_rent
        if not isinstance(is_for_rent, bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The 'is_for_rent' field must be a boolean."
            )
        # Validate rent_price
        if is_for_rent and not re.match(r'^\d+(\.\d{1,4})?$', str(rent_price)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rent price must be a number with up to 4 decimal places."
            )
        # Validate is_for_sale
        if not isinstance(is_for_sale, bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The 'is_for_sale' field must be a boolean."
            )
        # Validate condition
        if not re.match(r'^[A-Za-z\s]+$', condition):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Condition must contain only letters and spaces."
            )
        # Validate availability_status
        if not isinstance(availability_status, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Availability status must be a string."
            )
        # Validate location
        if not re.match(r'^[A-Za-z]+$', location):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location must contain only letters."
            )
        # Validate dimensions
        
        # Validate created_by
        if not created_by or not re.match(r'^[A-Za-z0-9]+$', created_by):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Created by must contain only letters and numbers."
            )

        created_at = datetime.now().isoformat(timespec='seconds') + 'Z' # Get current date and time in ISO format

        furniture_data = {
            "title": title,
            "description": description,
            "category": category,
            "brand": brand,
            "price": price,
            "is_for_rent": is_for_rent,
            "rent_price": rent_price,
            "is_for_sale": is_for_sale,
            "condition": condition,
            "availability_status": availability_status,
            "dimensions": dimensions,
            "location": location,
            "created_by": created_by,
            "created_at": created_at,
            "image" : None,
            "images": []
        }
               
        result = Furniture.add_furniture(furniture_data, files)  # call add_furniture method from Furniture class

        if result:
            return JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content={
                    "status": 201,
                    "status_message": "Created",
                    "data": {
                        "message": "Furniture added successfully",
                        # "furniture": furniture.dict()
                    }
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add furniture."
            )

    except ValidationError as e:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "status": 422,
                "status_message": "Unprocessable Entity",
                "data": {
                    "message": e.errors()
                }
            }
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {
                    "message": str(e)
                }
            }
        )
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/furniture/list/{user_id}
# Default Port : 10007

@router.get("/list/{user_id}")
async def list_furniture(request: Request):

    try:
        body = await request.json()

        query_params = {
            "page": int(body.get("page", 1)),
            "limit": int(body.get("limit", body.get("page_size", 10))), 
            "sort_by": body.get("sort_by", "created_at"),
            "sort_order": body.get("sort_order", body.get("sort_order", "desc")),  
            "search": body.get("search", ""),
            "listing_type": body.get("listing_type", "all")
        }

        result = Furniture.get_furniture(query_params)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "data": result["data"],
                "pagination": result["pagination"]   
            }
        )

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        print("Router Error:", e)

        return JSONResponse(
            status_code=500,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {"message": str(e)}
            }
        )


# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/furniture/update-furniture
# Default Port : 10007
@router.post("/update-furniture", response_description="Update Furniture")
async def update_furniture(request: Request, files: List[UploadFile] = File(None), replace_indexes: Optional[str] = Form(None) ):
    try:
        # Check content type to handle both JSON and form data
        content_type = request.headers.get("content-type", "")
        
        # Log the request type for debugging
        print(f"Received update request with content type: {content_type}")
        
        if "multipart/form-data" in content_type:
            # Handle form data (with or without files)
            form = await request.form()
            data_str = form.get('data')

            if not data_str:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Missing 'data' field in form data"
                )
            data = json.loads(data_str)
            print(f"Parsed form data: {data}")
        else:
            # Handle pure JSON payload
            data = await request.json()
            if 'data' in data and isinstance(data['data'], str):
                data = json.loads(data['data'])
            print(f"Parsed JSON data: {data}")


        # -------------------------
        # PARSE replace_indexes
        # -------------------------
        if replace_indexes:
            try:
                replace_indexes = json.loads(replace_indexes)
            except:
                raise HTTPException(400, "Invalid replace_indexes format")
        else:
            replace_indexes = None

        # Basic validation for required fields
        required_fields = ['furniture_id', 'title', 'category']

        for field in required_fields:
            if field not in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required field: {field}"
                )

        # Extract furniture details from data
        furniture_id = data.get('furniture_id')
        title = data.get('title')
        description = data.get('description', '')
        category = data.get('category')
        price = data.get('price')
        is_for_rent = data.get('is_for_rent', False)
        rent_price = data.get('rent_price')
        is_for_sale = data.get('is_for_sale', False)
        condition = data.get('condition', 'Good')
        availability_status = data.get('availability_status', 'available')
        dimensions = data.get('dimensions', '')
        location = data.get('location', 'Unknown')
              
        # Image data if present
        images = data.get('images')
        image = data.get('image')

        # More flexible validation that allows more characters
        if not title or len(title.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title cannot be empty"
            )

        if not category or len(category.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category cannot be empty"
            )

        if not isinstance(is_for_rent, bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The 'is_for_rent' field must be a boolean"
            )

        if not isinstance(is_for_sale, bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The 'is_for_sale' field must be a boolean"
            )
        
        # ✅ Sale validation
        if is_for_sale:
            if price is None:
                raise HTTPException(
                    status_code=400,
                    detail="Price is required when item is for sale"
                )

        # ✅ Rent validation
        if is_for_rent:
            if rent_price is None:
                raise HTTPException(
                    status_code=400,
                    detail="Rent price is required when item is for rent"
                 )

        # Prepare update data including all fields and image context
        update_data = {
            "title": title,
            "description": description,
            "category": category,
            "is_for_rent": is_for_rent,
            "is_for_sale": is_for_sale,
            "condition": condition,
            "availability_status": availability_status,
            "dimensions": dimensions,
            "location": location,

        }
        
         # Add only if valid
        if is_for_sale:
            update_data["price"] = price

        if is_for_rent:
            update_data["rent_price"] = rent_price

        if images is not None:
            update_data["images"] = images

        if image is not None:
            update_data["image"] = image

        # Call update method
        print(f"Calling update_furniture with data: {update_data}")
        result = Furniture.update_furniture(furniture_id, update_data, files,replace_indexes)

        # Return response
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "data": {
                    "message": "Furniture updated successfully",
                    "furniture": result
                }
            }
        )

    except ValidationError as ve:
        print(f"ValidationError: {ve.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "status": 422,
                "status_message": "Unprocessable Entity",
                "data": {
                    "message": ve.errors()
                }
            }
        )
    except HTTPException as http_exc:
        print(f"HTTPException: {http_exc.detail}")
        raise http_exc
    
    except Exception as e:
        print(f"Exception: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {
                    "message": str(e)
                }
            }
        )
    

# Description : Search Furniture by Category or Title
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/furniture/search-furniture
# Default Port : 10007   
@router.post("/search-furniture", response_description="Search Furniture by Category or Title")
async def search_furniture(request: Request):
    try:
        data = await request.json()
        category = data.get('category')
        title = data.get('title')
        if not category and not title:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Either category or title is required")
        
        result = Furniture.search_furniture_by_category_or_title(category, title)

        if not result:  # Checking if the result is empty or None
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No furniture found for the given category or title"
            )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "data": result
            }
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {
                    "message": str(e)
                }
            }
        )
    

# Description : List all user furniture 
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/furniture/list_all
# Default Port : 10007     

@router.post("/list_all")
async def list_all_furniture(request: Request):

    try:
        body = await request.json()

        query_params = {
            "page": int(body.get("page", 1)),
            "limit": int(body.get("limit", body.get("page_size", 10))), 
            "sort_by": body.get("sort_by", "created_at"),
            "order": body.get("order", body.get("sort_order", "desc")),  
            "search": body.get("search", ""),
            "listing_type": body.get("listing_type", "all")
        }

        result = Furniture.get_all_furniture(query_params)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "data": result["items"],
                "pagination": result["pagination"]   
            }
        )

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        print("Router Error:", e)

        return JSONResponse(
            status_code=500,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {"message": str(e)}
            }
        )
    
# https://furnspace.onrender.com/api/v1/furniture/list_all_furniture
# description : find all furniture
# Request Type : GET

@router.get("/list_all_furniture", response_description="List All Furniture")
async def get_all_furniture():
    """
    Retrieves all furniture items from the database without any filtering.
    """
    try:
        furniture_list = Furniture.list_all_furniture()
        
        return {
            "status": "success",
            "message": "Furniture items retrieved successfully",
            "count": len(furniture_list),
            "data": furniture_list
        }
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        print(f"Unexpected error in get_all_furniture route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while retrieving furniture items: {str(e)}"
        )
    
    

# description : Delete furniture
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/furniture/delete/{furniture_id}
# Default Port : 10007

@router.post("/delete/{furniture_id}", response_description="Delete Furniture")
async def delete_furniture(furniture_id:str , request: Request):
    try:
        result = Furniture.delete_furniture(furniture_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "OK",
                "data": result
            }
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {
                    "message": str(e)
                }
            }
        )


# description : Delete furniture
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/furniture/status/user/{user_id}/furniture/{furniture_id}
# Default Port : 10007

@router.post("/status/user/{user_id}/furniture/{furniture_id}", response_model=dict)
async def update_furniture_status(user_id: str, furniture_id: str, status_data: dict):
    """
    Updates the status of a specific furniture item for a user.
    """
    try:
        result = Furniture.update_furniture_status(user_id, furniture_id, status_data)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

# description : find furniture by id 
# Request Type : GET
# Path : https://furnspace.onrender.com/api/v1/furniture/{furniture_id}
# Default Port : 10007

@router.get("/{furniture_id}", response_model=dict)
async def get_furniture_by_id(furniture_id: str):
    """
    API endpoint to retrieve a specific furniture item by its ID.
    """
    try:
        # Call the static method to fetch the furniture item
        furniture_item = Furniture.get_furniture_by_id(furniture_id)
        return {
            "message": "Furniture item retrieved successfully.",
            "data": furniture_item
        }
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions (e.g., 404 or 500 errors)
        raise http_exc
    except Exception as e:
        # Catch any unexpected errors and return a 500 response
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )




        


