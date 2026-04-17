from fastapi import APIRouter, File, HTTPException, UploadFile, Request,status
from fastapi.responses import JSONResponse
from api.models.FileUpload import FileUpload
from typing import List
import uuid

router = APIRouter()
# Description : Upload a file to the server 
# Request Type : GET
# Path : https://localhost:10007/api/v1/fileupload/
# Default Port : 10007 
@router.get("", response_description="Api Version 1 Manager route")
@router.get("/", response_description="Api Version 1 Manager route")
async def file_upload_home():
    return {
        "location" : "api/v1/test",
        "message" : "API Version V1 - Initial Version",
        "version" : "1.0.0",
        "status" : 200,
        "status_message" : "OK... Working Version 1",
        "data" : {
            "message" : "Welcome to the API"
        }
    }
# Upload File Api
# Description : Upload a file to the server 
# Request Type : POST
# Path : http://127.0.0.1:10007/api/v1/fileupload/upload
# Default Port : 10007
@router.post("/upload", response_description="Upload Files")
async def upload_files(file: UploadFile = File(None), files: List[UploadFile] = File(None)):  # Correct type annotation for multiple files
    try:
        file_upload = FileUpload() #create instance of FileUpload class 
        file_ids = []
        file_names = []
        # Validate file extension
        def validate_extension(file:UploadFile):
            allowed_extensions = ['jpg', 'jpeg', 'png']
            file_extension = file.filename.rsplit(".")[-1].lower() # extract the file extension and convert to lowercase
            print(file.filename,file_extension)
            if file_extension not in allowed_extensions:
            #    raise HTTPException(status_code=400, detail="Invalid file type. Only jpeg, jpg, and png are allowed.")
                raise HTTPException(
                    status_code=400,
                    detail={
                        "status": 400,
                        "message": "Invalid file type. Only jpeg, jpg, and png are allowed.",
                        "allowed_extensions": ["jpg", "jpeg", "png"]
                    }
            )
        # Handle single file upload
        if file:
            # if file.content_type not in ["image/jpeg", "image/png"]:
            #     raise HTTPException(status_code=400, detail="File type not supported.")
            validate_extension(file)
            unique_filename = file_upload.save_file(file)
            file_id = str(uuid.uuid4())
            file_upload.store_metadata(unique_filename, file_id)
            file_ids.append(file_id)
            file_names.append(unique_filename)
            # User.user_collection.update_one({"_id": user_id}, {"$set": {"pro": file_id}})
        # Handle multiple file uploads
        if files:
            for single_file in files:
                # if single_file.content_type not in ["image/jpeg", "image/png"]:
                #     raise HTTPException(status_code=400, detail="File type not supported.")
                validate_extension(single_file)
                unique_filename = file_upload.save_file(single_file)
                file_id = str(uuid.uuid4())
                print(unique_filename)
                print(file_id)
                file_upload.store_metadata(unique_filename, file_id)
                file_ids.append(file_id)
                file_names.append(unique_filename)
        
        # Response includes all successfully uploaded files
        return JSONResponse(
            content={
                "message": "Files uploaded successfully",
                "file_names": file_names,
                "file_ids": file_ids,
            }
        )

    except HTTPException as http_exc:
        raise http_exc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return JSONResponse(
            content={
                "status": 500,
                "status_message": "Internal Server Error",
                "data": {"message": str(e)},
            },
            status_code=500,
        )