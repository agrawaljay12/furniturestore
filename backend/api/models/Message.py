from fastapi import HTTPException, status # type: ignore
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from api.db import message_collection
from bson.objectid import ObjectId
from typing import List, Optional,Dict
import smtplib
import ssl 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError
import os 

load_dotenv () 

class Message(BaseModel):
    moderator_id: str
    admin_id: str
    email : str
    message: str  # Corrected
    timestamp: str
    sender_role: str
    @staticmethod
    def send_message(message_data: Dict):
        try:
            result = message_collection.insert_one(message_data)
            if result.inserted_id:
                # Convert ObjectId to string
                message_data["_id"] = str(result.inserted_id)
                # Send email
                Message.send_email(message_data)
                Message.send_email_by_admin(message_data)
                return True
            return False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @staticmethod
    def send_email(message_data: Dict):
        try:
            # email = message_data["email"]
            message = message_data["message"]
            timestamp = message_data["timestamp"]

            sender_email = os.getenv("MAIL_USERNAME1")
            sender_password = os.getenv("MAIL_PASSWORD1")
            reciever_email = os.getenv("MAIL_USERNAME2")
            smtp_server = os.getenv("MAIL_SERVER")
            smtp_port = os.getenv("MAIL_PORT")

            subject = "message from moderator"
            body = f" You have message from moderator: {message}\n\nTimestamp: {timestamp}"

            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = reciever_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, reciever_email, msg.as_string())

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email: {str(e)}"
            )
    
    @staticmethod
    def send_email_by_admin(message_data: Dict):
        try:
            # email = message_data['email']
            message = message_data["message"]
            timestamp = message_data["timestamp"]

            sender_email = os.getenv("MAIL_USERNAME2")
            sender_password = os.getenv("MAIL_PASSWORD2")
            reciever_email = os.getenv("MAIL_USERNAME1")
            smtp_server = os.getenv("MAIL_SERVER")
            smtp_port = os.getenv("MAIL_PORT")

            subject = "New Message Sent to User"
            body = f"A new message has been come from admin : {message}\n\nTimestamp: {timestamp}"

            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = reciever_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            context = ssl.create_default_context()
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls(context=context)
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, reciever_email, msg.as_string())

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email to admin: {str(e)}"
            )
    @staticmethod
    def get_messages() -> List[Dict]:
        try:
            messages = []
            for message in message_collection.find():
                message["_id"] = str(message["_id"])
                messages.append(message)
            return messages
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
            
    @staticmethod
    def delete_message(message_id: str) -> bool:
        try:
            result = message_collection.delete_one({"_id": ObjectId(message_id)})
            return True if result.deleted_count > 0 else False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

