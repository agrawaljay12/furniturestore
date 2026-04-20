import cloudinary.uploader
from pydantic import BaseModel

# Pydantic model for file metadata
class Image(BaseModel):
    id: str
    filename: str
    filepath: str

def upload_image(file):
    try:
        result = cloudinary.uploader.upload(file.file)
        return result["secure_url"]  # ✅ important
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")
    
# class FileUpload:

#     upload_dir ="static/uploads"

#     @staticmethod
#     def save_file(file: UploadFile) -> str:
#         try:
#             if not file or not file.filename:
#                 raise ValueError("No file provided")
            
#             # Ensure directory exists
#             os.makedirs(FileUpload.upload_dir, exist_ok=True)

#             file_extension = file.filename.split(".")[-1]

#             unique_filename = f"{uuid.uuid4().hex}.{file_extension}"

#             file_path = os.path.join(FileUpload.upload_dir, unique_filename)
            
#             # Save file
#             with open(file_path, "wb") as buffer:
#                 buffer.write(file.file.read())

#             return  f"https://furnspace.onrender.com/static/uploads/{unique_filename}"

#         except Exception as e:
#             raise ValueError(f"Error saving file: {str(e)}")