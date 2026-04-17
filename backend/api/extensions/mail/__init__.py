import os
import smtplib
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv 
import base64
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env
# load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../../.env'))

class MAIL:
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT","587"))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS") == "True"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL") == "True"

    @staticmethod
    def _create_server_connection():
        server = None
        try:
            logger.info(f"Connecting to mail server: {MAIL.MAIL_SERVER}:{MAIL.MAIL_PORT}")
            logger.info(f"Using TLS: {MAIL.MAIL_USE_TLS}, Using SSL: {MAIL.MAIL_USE_SSL}")
            
            # Verify credentials are not None or empty
            if not MAIL.MAIL_USERNAME or not MAIL.MAIL_PASSWORD:
                logger.error(f"Missing credentials. Username: {MAIL.MAIL_USERNAME}, Password: {'*' * (len(MAIL.MAIL_PASSWORD or '') if MAIL.MAIL_PASSWORD else 0)}")
                raise ValueError("Email username or password not configured properly")
                
            if MAIL.MAIL_USE_SSL:
                server = smtplib.SMTP_SSL(MAIL.MAIL_SERVER, MAIL.MAIL_PORT)
            else:
                server = smtplib.SMTP(MAIL.MAIL_SERVER, MAIL.MAIL_PORT)
                if MAIL.MAIL_USE_TLS:
                    server.starttls()
                    
            # Verify connection
            server.ehlo_or_helo_if_needed()
            
            # Log in with credentials
            logger.info(f"Attempting login with username: {MAIL.MAIL_USERNAME}")
            server.login(MAIL.MAIL_USERNAME, MAIL.MAIL_PASSWORD)
            logger.info("Login successful")
            
            return server
            
        except Exception as e:
            if server:
                try:
                    server.quit()
                except:
                    pass
            logger.error(f"Error creating mail server connection: {str(e)}")
            raise
    
    @staticmethod
    def sendmail(to, from_name, subject, body):
        msg = EmailMessage()
        msg["From"] = f"{from_name} <{MAIL.MAIL_USERNAME}>"
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)
        
        with MAIL._create_server_connection() as server:
            server.send_message(msg)
    
    @staticmethod
    def sendHtmlMail(to, from_name, subject, body, html):
        msg = EmailMessage()
        msg["From"] = f"{from_name} <{MAIL.MAIL_USERNAME}>"
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)
        msg.add_alternative(html, subtype='html')

        with MAIL._create_server_connection() as server:
            server.send_message(msg)
    
    @staticmethod
    def sendHtmlMailWithFiles(to, from_name, subject, body, html, files):
        msg = MIMEMultipart()
        msg["From"] = f"{from_name} <{MAIL.MAIL_USERNAME}>"
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        msg.attach(MIMEText(html, "html"))
        
        for file_path in files:
            with open(file_path, "rb") as f:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(f.read())
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(file_path)}")
                msg.attach(part)
        
        with MAIL._create_server_connection() as server:
            server.send_message(msg)

    @staticmethod
    def sendReceiptEmail(to, from_name, subject, body, html, pdf_data=None, pdf_name="receipt.pdf"):
        """
        Send an email with a receipt as an attachment.
        
        Args:
            to: Recipient email address
            from_name: Sender name
            subject: Email subject
            body: Plain text body
            html: HTML body
            pdf_data: Base64 encoded PDF data or raw PDF bytes
            pdf_name: Name of the PDF file attachment
        """
        try:
            logger.info(f"Preparing to send receipt email to: {to}")
            
            msg = MIMEMultipart()
            msg["From"] = f"{from_name} <{MAIL.MAIL_USERNAME}>"
            msg["To"] = to
            msg["Subject"] = subject
            
            # Add message ID and date for better email tracking
            from email.utils import make_msgid, formatdate
            msg["Message-ID"] = make_msgid(domain=MAIL.MAIL_USERNAME.split('@')[1])
            msg["Date"] = formatdate(localtime=True)
            
            # Add plain text and HTML parts
            msg.attach(MIMEText(body, "plain"))
            msg.attach(MIMEText(html, "html"))
            
            if pdf_data:
                # Decode base64 data if it's in that format
                try:
                    pdf_binary = None
                    
                    # Log the type and beginning of the data to help with debugging
                    logger.info(f"PDF data type: {type(pdf_data)}")
                    if isinstance(pdf_data, str):
                        preview = pdf_data[:50] + "..." if len(pdf_data) > 50 else pdf_data
                        logger.info(f"PDF data preview: {preview}")
                    
                    # Case 1: Data URI format
                    if isinstance(pdf_data, str) and pdf_data.startswith('data:application/pdf;base64,'):
                        logger.info("Decoding PDF data in data URI format")
                        pdf_binary = base64.b64decode(pdf_data.split(',')[1])
                    # Case 2: Raw base64 string
                    elif isinstance(pdf_data, str):
                        try:
                            logger.info("Attempting to decode as base64")
                            pdf_binary = base64.b64decode(pdf_data)
                        except Exception as decode_error:
                            logger.warning(f"Base64 decoding failed: {str(decode_error)}")
                            logger.info("Not valid base64, using as raw text")
                            pdf_binary = pdf_data.encode('utf-8')
                    # Case 3: Already binary data
                    elif isinstance(pdf_data, bytes):
                        logger.info("Using provided binary data directly")
                        pdf_binary = pdf_data
                    else:
                        logger.warning(f"Unexpected PDF data type: {type(pdf_data)}")
                        if pdf_data is None:
                            raise ValueError("PDF data is None")
                        # Try to convert to string and then to bytes as a last resort
                        pdf_binary = str(pdf_data).encode('utf-8')
                    
                    # Validate we have binary data for the PDF
                    if not pdf_binary:
                        raise ValueError("Failed to get valid PDF binary data")
                    
                    if len(pdf_binary) < 10:
                        raise ValueError(f"PDF data suspiciously short: {len(pdf_binary)} bytes")
                    
                    # Attach the PDF
                    logger.info(f"Attaching PDF as: {pdf_name} ({len(pdf_binary)} bytes)")
                    part = MIMEBase("application", "pdf")
                    part.set_payload(pdf_binary)
                    encoders.encode_base64(part)
                    part.add_header("Content-Disposition", f"attachment; filename={pdf_name}")
                    part.add_header("Content-ID", f"<{pdf_name}>")
                    msg.attach(part)
                    
                except Exception as e:
                    logger.error(f"Error processing PDF attachment: {str(e)}")
                    raise
            
            with MAIL._create_server_connection() as server:
                logger.info(f"Sending email to: {to}")
                server.send_message(msg)
                logger.info("Email sent successfully")
                return True
                
        except Exception as e:
            logger.error(f"Error sending receipt email: {str(e)}")
            raise


# Example of Sending. 

# MAIL.sendmail("recipient@example.com", "Sender Name", "Test Subject", "Test Body")
# MAIL.sendHtmlMail("recipient@example.com", "Sender Name", "Test Subject", "Test Body", "<h1>Test HTML</h1>")
# MAIL.sendHtmlMailWithFiles(
#     "recipient@example.com", 
#     "Sender Name", 
#     "Test Subject with Attachment", 
#     "Test Body", 
#     "<h1>HTML with Attachment</h1>", 
#     ["path/to/file1.txt", "path/to/file2.pdf"]
# )