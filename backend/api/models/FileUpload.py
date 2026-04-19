import os
from pathlib import Path
import uuid
from fastapi import UploadFile
from werkzeug.utils import secure_filename
from pydantic import BaseModel

upload_dir: str = "static/uploads"

async def save_file(file: UploadFile):

    # Extract the file extension
    file_extension = file.filename.split(".")[-1]

    # Generate a unique filename using uuid4 and preserve the original file extension
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()  # Read the file content asynchronously
        buffer.write(content)         # Write the content to the file

    # save the path of the saved file to the specified folder   
    file_location = f"https://furnspace.onrender.com/static/uploads/{unique_filename}"
    return file_location
