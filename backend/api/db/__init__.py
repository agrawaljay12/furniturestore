import os
import certifi
from pymongo import MongoClient


MONGO_URI = os.getenv("MONGO_URL")

# Initialize MongoDB connection
client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)

db = client["furniture"]

# Collections
rooms_collection = db["rooms"]
devices_collection = db["devices"]
users_collection = db["users"]
otp_collection = db["otps"]
furniture_collection = db["furniture"]
file_upload_collection = db["file_uploads"]
booking_collection = db["bookings"]
banned_collection = db["banned"]
warning_collection = db["warnings"]
user_activity_collection = db["user_activity"]
message_collection = db["messages"]
addresses_collection = db["addresses"]
reviews_collection = db["reviews"]
offers_collection = db["offers"]