from typing import List
from fastapi import APIRouter,HTTPException, status, Request,File, UploadFile ,Form 
from pydantic import ValidationError
from api.models.Room import Room
from fastapi.responses import JSONResponse
from api.models.User import User
import re
import json
router = APIRouter()

#http://localhost:10007/api/v1/auth
#http://localhost:10007/api/v1/auth/
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
    
# Create Room Api 
# Description : Create a new room for Socket Server
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/auth/user/create
# Default Port : 10007
@router.post("/user/create", response_description="Add New User")
async def create_user(
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: str = Form(...),
    phone2: str = Form(None),
    address: str = Form(...),
    pin_code: str = Form(...),
    state: str = Form(...),
    city: str = Form(...),
    country: str = Form(...),
    type: str = Form('user'),
    file: UploadFile = File(None)
):
    
    try:
        pattern=r'^[a-zA-Z]+$'
        # return data
        if not re.match(pattern,firstname):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="First name must contain only letters."
        )
        if not re.match(pattern,lastname):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Last name must contain only letters ."
        )
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',email):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )
        password_pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Z][A-Za-z\d\W_]{7,15}$'
        if not re.match(password_pattern,password ):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character and must be 8-16 characters long."
        )
        if not re.match(r'^\d{10}$',phone):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number must be exactly 10 digits."
        )
        # if not re.match(r'^\d{10}$',phone2):
        #     raise HTTPException(
        #     status_code=status.HTTP_400_BAD_REQUEST,
        #     detail="Optional phone number must be exactly 10 digits."
        # )
        
        if not re.match(r'^\d{6}$',pin_code):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pin code must be exactly 6 digits."
        )   
        if not re.match(pattern,city):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City must contain only letters and spaces."
        )
        user_data = {
            "first_name": firstname,
            "last_name": lastname,
            "email": email,
            "password": password,
            "phone": phone,
            "phone2": phone2,
            "address": address,
            "pin_code": pin_code,
            "state": state,
            "city": city,
            "country": country,
            "type": type
        }
        # user = User(first_name=firstname, last_name=lastname, email=email, password=password, phone=phone, phone2=phone2, address=address, pin_code=pin_code, state=state, city=city, country=country)
        User.add_user(user_data, file)
        print(file)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": 201,
                "status_message": "Created",
                "data": {
                    "message": "User Created Successfully"
                }
            }
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

# Changes the password 
# Description : Change new
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/auth/user/change-password
# Default Port : 10007
@router.post("/user/change-password", response_description="Change Password")
async def change_password(request: Request):
    try:
        data = await request.json()
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')           
        result = User.forgot_password(email, password, confirm_password)
        return result
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get All Rooms Api
# Description : Get All Rooms from the Database
# Request Type : GET
# Path : https://furnspace.onrender.com/api/v1/auth/user/login
# Default Port : 10007
@router.post("/user/login", response_description="Get All Rooms")
async def user_login(request:Request):
    try:
        data =  await request.json()
        email = data.get('email')
        password = data.get('password')

        return User.login(email,password)
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as e:  # Assuming Room.add_room raises ValueError when the room exists
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,  # 409 Conflict for resource already existing
            content={
                "status": 409,
                "status_message": "Conflict",
                "data": {
                    "message": str(e)  # Example: "Room already exists"
                }
            }
        )
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
    
# get user detail  
# Description : fetch user detail
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/auth/user/fetch/{id}
# Default Port : 10007
@router.get("/user/fetch/{id}", response_description="fetch_user_detail")
async def fetch_user_detail(id:str, request: Request):
    try:
        # data = await request.json()
        # user_id = data.get('_id')
        print(id)
        if not id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID is required")
            
        # call the update_user method from the User model
        user = User.get_users(id)
        print(user)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with that ID"
            )
        
        # if user is found then and return the response
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                     "data": user,             
                    "message": "user fetch successfully"
            } 
        )
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


#path: https://furnspace.onrender.com/api/v1/auth/user/{user_id}/update
#method = "PUT"
@router.put("/user/{user_id}/update", response_description="Update User Details")
async def update_user_details(user_id: str, file: UploadFile = File(None), document: str = Form(...)):
    try:
        print(user_id)

        # Parse the user data JSON
        user_data_dict = json.loads(document)

        # Validate file type if file is provided
        if file and file.content_type not in ["image/png", "image/jpeg"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Only PNG and JPEG are allowed."
            )

        # Call the model method to update the user
        result = User.update_user(user_id, user_data=user_data_dict, file=file)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result 
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {"message": str(e)}
            }
        )
    
    # get  users 
    # Description : fetch users
    # Request Type : POST
    # Path : https://furnspace.onrender.com/api/v1/auth/get_users
    # Default Port : 10007

@router.post("/get_users", response_model=List[dict])
async def get_users():
    try:
        users = User.get_all_users()
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "Success",
                "data": users
            }
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "status": e.status_code,
                "status_message": "Error",
                "data": {"message": e.detail}
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {"message": str(e)}
            }
        )
    
    # Delete user
    # Description: Delete a user by user_id
    # Request Type: DELETE
    # Path: https://furnspace.onrender.com/api/v1/auth/delete_user/{user_id}
    # Default Port: 10007

@router.post("/delete_user/{user_id}", response_description="Delete User")
async def delete_user(user_id: str):
    try:
        result = User.delete_user(user_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "Success",
                "data": result
            }
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "status": e.status_code,
                "status_message": "Error",
                "data": {"message": e.detail}
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {"message": str(e)}
            }
        )
    


    # change password
    # Description: change password
    # Request Type: post
    # Path: https://furnspace.onrender.com/api/v1/auth/change_password/{user_id}
    # Default Port: 10007

@router.post("/change_password/{user_id}", response_description="Change Password")
async def change_password(user_id: str, request: Request):
    try:
        data = await request.json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        result = User.change_password(user_id, old_password, new_password, confirm_password)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": 200,
                "status_message": "Success",
                "data": result
            }
        )
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    # Add Address information
    # Description: Add address information 
    # Request Type: POST
    # Path: https://furnspace.onrender.com/api/v1/auth/add_address
    # Default Port: 10007

# @router.post("/add_address", response_description="Add Address")
# async def add_address( request: Request):
#     try:
#         data = await request.json()
#         user_id = data.get('user_id')
#         address = data.get('address')
#         pin_code = data.get('pin_code')
#         state = data.get('state')
#         city = data.get('city')
#         country = data.get('country')
#         data ={
#             "user_id": user_id,
#             "address": address,
#             "pin_code": pin_code,
#             "state": state,
#             "city": city,
#             "country": country
#         }
#         result = Address.add_address(data)
#         return JSONResponse(
#             status_code=status.HTTP_201_CREATED,
#             content={
#                 "status": 201,
#                 "status_message": "Created",
#                 "data": result
#             }
#         )
#     except HTTPException as http_exc:
#         raise http_exc
#     except ValueError as e:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
  
    
        

    
