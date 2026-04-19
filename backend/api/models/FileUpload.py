import os
from pathlib import Path
import uuid
from fastapi import UploadFile
from werkzeug.utils import secure_filename
from pydantic import BaseModel

# Pydantic model for file metadata
class Image(BaseModel):
    id: str
    filename: str
    filepath: str
    
class FileUpload:
    def __init__(self):
        # ✅ Always point to static/uploads (NO subfolders)
        BASE_DIR = Path(__file__).resolve().parent.parent
        self.upload_folder = BASE_DIR / "static" / "uploads"

        # ✅ Ensure directory exists
        self.upload_folder.mkdir(parents=True, exist_ok=True)

    def save_file(self, file):
        try:
            if not file or not file.filename:
                raise ValueError("No file provided")

            # ✅ Secure + unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"

            file_path = self.upload_folder / unique_filename

            # ✅ Save file
            with open(file_path, "wb") as buffer:
                buffer.write(file.file.read())

            return f"https://furnspace.onrender.com/static/uploads/{unique_filename}"

        except Exception as e:
            raise ValueError(f"Error saving file: {str(e)}")