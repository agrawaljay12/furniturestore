from api.db import banned_collection
from fastapi import HTTPException, status
from typing import Optional, List, Dict
from bson import ObjectId
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError
import os 

load_dotenv () 

class Banned(BaseModel):
    user_id: str
    email: str
    reason: str
    ban_type: Optional[str]=None  # 'temporary' or 'permanent'
    duration: Optional[int] = None  # Duration in days, only applicable for temporary bans
    banned_at: str
    expires_at: str
    warnings: int = 0  # Number of warnings


    @staticmethod
    def add_ban(banned_data: Dict):
        try:
            result = banned_collection.insert_one(banned_data)
            if result.inserted_id:
                Banned.send_ban_email(banned_data)
                return True
            return False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    @staticmethod
    def is_user_banned(email: str)-> bool:
        try:
            ban_record = banned_collection.find_one({"email": email})
            if ban_record:
                if ban_record["ban_type"] == "permanent":
                    return True
                elif ban_record["ban_type"] == "temporary":
                    expires_at = datetime.fromisoformat(ban_record["expires_at"])
                    if datetime.now() < expires_at:
                        return True
            return False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    @staticmethod
    def get_banned_user() -> List[dict]:
        try:
            banned_users = []
            for banned_user in banned_collection.find():
                banned_user["id"] = str(banned_user["_id"])
                del banned_user["_id"]
                banned_users.append(banned_user)
            return banned_users
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            ) 
    @staticmethod
    def send_ban_email(banned_data: Dict):
        try:
            email = banned_data["email"]
            ban_type = banned_data["ban_type"]
            reason = banned_data["reason"]
            duration = banned_data.get("duration", None)

            sender_email = os.getenv("MAIL_USERNAME")
            sender_password = os.getenv("MAIL_PASSWORD")
            smtp_server = os.getenv("MAIL_SERVER")
            smtp_port = os.getenv("MAIL_PORT")

            subject = "Account Ban Notification"
            if ban_type == "temporary":
                body = f"Dear User,\n\nYour account has been temporarily banned for {duration} days due to the following reason: {reason}.\n\nRegards,\nAdmin Team"
            else:
                body = f"Dear User,\n\nYour account has been permanently banned due to the following reason: {reason}.\n\nRegards,\nAdmin Team"

            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, email, msg.as_string())

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email: {str(e)}"
            )