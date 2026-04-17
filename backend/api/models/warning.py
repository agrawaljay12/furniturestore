from api.db import warning_collection
from fastapi import HTTPException, status
from typing import Optional, List, Dict
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

  # Load environment variables from .env file
load_dotenv()

class Warning(BaseModel):
    user_id: str
    email: str
    message: str
    created_at: str
    status: str = "active"

    @staticmethod
    def add_warning(warning_data: Dict):
        try:
            result = warning_collection.insert_one(warning_data)
            if result.inserted_id:
                Warning.send_email(warning_data['email'], warning_data['message'])
                return True
            return False
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    @staticmethod
    def send_email(to_email: str, message: str):
        from_email = os.getenv('MAIL_USERNAME')
        from_password = os.getenv('MAIL_PASSWORD')
        smtp_server = os.getenv('MAIL_SERVER')
        smtp_port = os.getenv('MAIL_PORT')
        use_tls = os.getenv('MAIL_USE_TLS') == 'True'
        use_ssl = os.getenv('MAIL_USE_SSL') == 'True'
        subject = "Warning Notification"

        print(f"From Email: {from_email}")
        print(f"SMTP Server: {smtp_server}")
        print(f"SMTP Port: {smtp_port}")

        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(message, 'plain'))

        try:
            if use_ssl:
                server = smtplib.SMTP_SSL(smtp_server, smtp_port)
            else:
                server = smtplib.SMTP(smtp_server, smtp_port)
                if use_tls:
                    server.starttls()
            server.login(from_email, from_password)
            text = msg.as_string()
            server.sendmail(from_email, to_email, text)
            server.quit()
            print("Email sent successfully!")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email: {str(e)}"
            )

    @staticmethod
    def get_warnings()-> List[Dict]:
        try:
                warnings = []
                for warning in warning_collection.find():
                    warning['id'] = str(warning['_id'])
                    del warning['_id'] # Remove _id field
                    warnings.append(warning)
                    # del warning['_id']
                return warnings
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    