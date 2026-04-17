# Furniture Renting System Documentation

## Project Overview
The Furniture Renting System is a comprehensive web application designed to facilitate the rental and purchase of furniture. It provides a platform for users to browse, rent, and buy furniture, while administrators can manage inventory, users, and orders.

## Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Axios
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker, Nginx

## Setup Instructions

### 1. Clone the Repository
Clone the repository to your local machine and navigate into the project directory.
```bash
git clone https://github.com/your-repo/furniture-renting-system.git
cd furniture-renting-system
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

#### a. Create a virtual environment and activate it:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

#### b. Install the dependencies:
```bash
pip install -r req.txt
```

#### c. Start the FastAPI server:
```bash
uvicorn api.main:app --reload
```

### 3. Frontend Setup
Navigate to the frontend directory and set up the Node.js environment.

#### a. Install the dependencies:
```bash
cd ../frontend
npm install
```

#### b. Start the development server:
```bash
npm run dev
```

## File/Folder Structure
```
furniture-renting-system/
├── backend/
│   ├── api/
│   ├── models/
│   ├── static/
│   ├── main.py
│   ├── req.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
└── README.md
```

## Features and Functionalities
- **User Management**: Registration, Login, Profile Management
- **Furniture Management**: Add, Update, Delete, View Furniture
- **Order Management**: Create, Update, View Orders
- **Payment Integration**: PayPal
- **Admin Dashboard**: Manage Users, Furniture, Orders

## API Documentation

### Authentication
- **POST /api/v1/auth/user/create**: Create a new user
- **POST /api/v1/auth/user/login**: User login

### Furniture
- **POST /api/v1/furniture/add**: Add new furniture
- **POST /api/v1/furniture/list**: List all furniture for a user
- **POST /api/v1/furniture/update-furniture**: Update furniture details

### Orders
- **POST /api/v1/booking/create**: Create a new booking

## Database Schema
### Users Collection
- `_id`: ObjectId
- `username`: String
- `email`: String
- `password`: String
- `role`: String (user, admin)

### Furniture Collection
- `_id`: ObjectId
- `title`: String
- `description`: String
- `category`: String
- `price`: Number
- `is_for_rent`: Boolean
- `rent_price`: Number
- `is_for_sale`: Boolean
- `condition`: String
- `availability_status`: String
- `dimensions`: String
- `location`: String
- `created_by`: String
- `created_at`: Date

### Orders Collection
- `_id`: ObjectId
- `user_id`: ObjectId
- `furniture_id`: ObjectId
- `booking_status`: String
- `duration`: Number
- `total_price`: Number
- `payment_status`: String
- `payment_method`: String
- `delivery_address`: String
- `booking_date`: Date
- `payment_date`: Date

## User Roles and Permissions
- **User**: Can browse, rent, and buy furniture, manage their profile
- **Admin**: Can manage users, furniture, and orders

## Common Errors and Troubleshooting

### Error: `ModuleNotFoundError: No module named '...'`
- **Solution**: Ensure all dependencies are installed and the virtual environment is activated.

### Error: `ConnectionError: Failed to connect to MongoDB`
- **Solution**: Ensure MongoDB is running and the connection string is correct.

## Testing

### Unit Tests
Unit tests are located in the `backend/tests` directory.

### Run Tests
To run the tests, use the following command:
```bash
pytest
```

## Future Enhancements
- **Mobile App**: Develop a mobile application for the platform
- **Enhanced Analytics**: Add more detailed analytics and reporting features
- **Multi-language Support**: Support for multiple languages

## Contact Information
- **Email**: support@furniturerentalsystem.com
- **Phone**: +1-800-123-4567
- **Address**: 123 Furniture St, City, Country
