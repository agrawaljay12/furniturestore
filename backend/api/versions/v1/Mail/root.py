from fastapi import APIRouter, HTTPException, Request ,status
from api.extensions.mail import MAIL
from api.models.Otp import Otp
import random
from  api.db import users_collection
from api.extensions.mail.otpHtmlVariable import getHtml
import re
import base64
from fastapi.responses import JSONResponse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# https://localhost:10007/api/v1/mail
# https://localhost:10007/api/v1/mail/
@router.get("", response_description="Api Mail Home")
@router.get("/", response_description="Api Mail Home")
async def hello_world():
    return {
        "location" : "api/v1/mail",
        "message" : "API Version V1 - Initial Version",
        "version" : "1.0.0",
        "status" : 200,
        "status_message" : "OK... Working Mail Home",
        "data" : {
            "message" : "Welcome to the Mail Home"
        }
    }
    
    
# Send Mail Api
# Description : Send Mail to the User
# Request Type : POST
# Path : http://localhost:port/api/v1/mail/send-otp
# Path :  https://furnspace.onrender.com/api/v1/mail/send-otp
# Default Port : 10007

@router.post("/send-otp", response_description="Send OTP to the User")
async def send_otp(request: Request):
    try:
        body = await request.json()
        email = body.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format."
            )
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        otp = random.randint(100000, 999999)
        # Add otp in DB for Verification
        try:
            MAIL.sendHtmlMail(email, "Furniture Management System", "OTP for the Verification", f"Your OTP is {otp}", getHtml(otp))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
        Otp.add_otp(email, str(otp))
        return {
            "status": 200,
            "status_message": "OK",
            "data": {
                "message": "OTP Sent Successfully to " + email
            }
        }
    except HTTPException as http_exc:
        raise http_exc
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
        raise HTTPException(status_code=500, detail=str(e))


# Create Room Api 
# Description : Create a new room for Socket Server
# Request Type : POST
# Path : https://furnspace.onrender.com/api/v1/mail/verify-otp
# Default Port : 10007
@router.post("/verify-otp", response_description="Add New Room")
async def verify_otp(request: Request):
    try:
        body = await request.json()
        email = body.get("email")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        otp = body.get("otp")
        
        if not otp:
            raise HTTPException(status_code=400, detail="OTP is required")
        
        if not Otp.verify_otp(email, otp):
            raise HTTPException(status_code=400, detail="Invalid OTP")

        return {
            "status" : 200,
            "status_message" : "OK",
            "data" : {
                "message" : "Otp Verified Successfully"
            }
        }
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
        raise HTTPException(status_code=500, detail=str(e))


# Send Booking Receipt Email
# Description: Send booking receipt to the user
# Request Type: POST
# Path: https://furnspace.onrender.com/api/v1/mail/send-receipt
# Default Port: 10007
@router.post("/send-receipt", response_description="Send Booking Receipt to User")
async def send_receipt(request: Request):
    try:
        body = await request.json()
        email = body.get("email")
        pdf_data = body.get("pdf_data")
        booking_id = body.get("booking_id")
        
        logger.info(f"Received request to send receipt for booking: {booking_id} to: {email}")
        
        # Basic validation checks
        if not email:
            logger.error("Email is required but was not provided")
            raise HTTPException(status_code=400, detail="Email is required")
        
        if not pdf_data:
            logger.error("PDF data is required but was not provided")
            raise HTTPException(status_code=400, detail="PDF data is required")
            
        if not booking_id:
            logger.warning("Booking ID not provided, using 'Unknown'")
            booking_id = "Unknown"
            
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
            logger.error(f"Invalid email format: {email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format."
            )
            
        # Generate receipt filename
        pdf_name = f"Booking_Receipt_{booking_id}.pdf"
        logger.info(f"Generated PDF filename: {pdf_name}")
        
        # Create HTML template for the email
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                <h1 style="color: #2c3e50; margin-bottom: 5px;">Booking Confirmation</h1>
                <p style="color: #7f8c8d; margin-top: 0;">Thank you for your booking!</p>
            </div>
            
            <div style="padding: 20px 0;">
                <p>Dear Customer,</p>
                <p>Your booking (ID: <strong>{booking_id}</strong>) has been confirmed. Please find your receipt attached to this email.</p>
                <p>If you have any questions about your booking, please contact our customer support.</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px;">Note: This is an automated email. Please do not reply to this message.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; color: #95a5a6; font-size: 12px;">
                <p>&copy; 2023 Furniture Renting System. All rights reserved.</p>
            </div>
        </div>
        """
        
        # Send email with receipt
        try:
            logger.info(f"Attempting to send email to: {email}")
            
            # Improved PDF data format detection and handling
            pdf_data_processed = None
            
            # Check data type and format
            if isinstance(pdf_data, str):
                # Case 1: Data URI format (starts with data:application/pdf;base64,)
                if pdf_data.startswith('data:application/pdf;base64,'):
                    logger.info("Processing PDF data in data URI format")
                    pdf_data_processed = pdf_data
                # Case 2: Raw base64 string (most likely from jsPDF's output('base64'))
                else:
                    try:
                        # Try to decode it to verify it's valid base64
                        base64.b64decode(pdf_data)
                        logger.info("Processing PDF data as raw base64 string")
                        # Convert to the format MAIL.sendReceiptEmail expects
                        pdf_data_processed = f"data:application/pdf;base64,{pdf_data}"
                    except Exception as e:
                        logger.error(f"Invalid base64 data: {str(e)}")
                        raise HTTPException(status_code=400, detail="Invalid PDF data format. Not a valid base64 string.")
            else:
                logger.error(f"PDF data has unexpected type: {type(pdf_data)}")
                raise HTTPException(status_code=400, detail=f"Unexpected PDF data type: {type(pdf_data)}")
            
            # Ensure we have processed data
            if not pdf_data_processed:
                raise HTTPException(status_code=400, detail="Failed to process PDF data")
                
            # Send email with the processed PDF data
            MAIL.sendReceiptEmail(
                email, 
                "Furniture Renting System", 
                f"Your Booking Receipt - ID: {booking_id}", 
                f"Your booking (ID: {booking_id}) has been confirmed. Please find your receipt attached to this email.", 
                html_content,
                pdf_data_processed,
                pdf_name
            )
            logger.info(f"Successfully sent receipt email to: {email}")
            
        except HTTPException as he:
            # Re-raise HTTP exceptions
            raise he
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
            
        return JSONResponse(
            status_code=200,
            content={
                "status": 200,
                "status_message": "OK",
                "data": {
                    "message": f"Receipt sent successfully to {email}"
                }
            }
        )
    except HTTPException as http_exc:
        logger.error(f"HTTP Exception: {str(http_exc.detail)}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error in send_receipt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")