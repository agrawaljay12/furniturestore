import os
import uuid
from werkzeug.utils import secure_filename
from api.db import file_upload_collection
from pydantic import BaseModel

# Pydantic model for file metadata
class Image(BaseModel):
    id: str
    filename: str
    filepath: str
    
class FileUpload:
    def __init__(self):
        # Initialize upload folder and ensure directory exists
        self.upload_folder = os.getenv('UPLOAD_FOLDER', os.path.join('static', 'uploads'))
        # os.makedirs(self.upload_folder, exist_ok=True)

    def save_file(self, file):
        try:
            # Validate file
            if not file:
                raise ValueError("No file provided for saving")

            # Generate secure and unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            file_path = os.path.join(self.upload_folder, unique_filename)

            # Save file to the upload folder
            with open(file_path, "wb") as buffer:
                buffer.write(file.file.read())

            return unique_filename
        except Exception as e:
            raise ValueError(f"Error saving file: {str(e)}")
    # handle multiple file uploads and single file upload separately
    @staticmethod
    def store_metadata(unique_filename: str, file_path: str) -> str:
        try:
            # Save file metadata to the database
            file_metadata = {
                "filename": unique_filename,
                "filepath": file_path,
            }
            # print(unique_filename)
            # print(file_path)
            result = file_upload_collection.insert_one(file_metadata)
            return str(result.inserted_id)
        except Exception as e:
            raise ValueError(f"Database error while storing metadata: {str(e)}")
   