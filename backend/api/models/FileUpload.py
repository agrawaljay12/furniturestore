import os
from pathlib import Path
import uuid
from fastapi import UploadFile
from werkzeug.utils import secure_filename
from pydantic import BaseModel

class FileUpload:
    def __init__(self):
        BASE_DIR = Path(__file__).resolve().parent.parent
        self.upload_folder = BASE_DIR / "static" / "uploads"

        # Ensure folder exists
        self.upload_folder.mkdir(parents=True, exist_ok=True)

    def save_file(self, file):
        if not file or not file.filename:
            raise ValueError("No file provided")

        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"

        file_path = self.upload_folder / unique_filename

        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        # ✅ RETURN ONLY PATH (NOT FULL URL)
        return f"/static/uploads/{unique_filename}"