from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from api.models.Room import Room

from api.models.FileUpload import FileUpload

router = APIRouter()

@router.get("", response_description="Api Version 1 Manager route")
@router.get("/", response_description="Api Version 1 Manager route")
async def test_home():
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
# Path : http://localhost:port/api/v1/test/upload
# Default Port : 10007
@router.post("/upload", response_description="Upload Files")
async def upload_files(file: UploadFile = File(None), files: list[UploadFile] = File(None)):
    try:
        file_upload = FileUpload()
        file_names = []

        if file:
            file_name = file_upload.save_file(file)
            file_names.append(file_name)

        if files:
            for single_file in files:
                file_name = file_upload.save_file(single_file)
                file_names.append(file_name)

        return JSONResponse(
            content={
                "message": "Files uploaded successfully" if len(file_names) > 1 else "File uploaded successfully",
                "file_names": file_names
            }
        )
    except HTTPException as http_exc:
        raise http_exc  # Re-raise HTTPExceptions to allow FastAPI to handle them properly
    except ValueError as e:
        detail = {
            "status": 400,
            "status_message": "Bad Request",
            "data": {
                "message": str(e)
            }
        }
        raise HTTPException(status_code=400, detail=detail)
    except Exception as e:
        return {
            "status": 500,
            "status_message": "Internal Server Error",
            "data": {
                "message": str(e)
            }
        }
        