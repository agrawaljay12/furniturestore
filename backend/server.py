import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from bind import sio_app
import os


app = FastAPI()

# if uploads folder doesn't exist, create it
if not os.path.exists('static/uploads'):
    os.makedirs('static/uploads')

# Mount the static files
app.mount("/static", StaticFiles(directory='static'), name="static")
app.mount("/files", StaticFiles(directory='static/uploads'), name="files")
app.mount('/', app=sio_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get('/')
# async def home():
#     return {'message': 'Hello👋 Developers💻'}

# @app.post('/create_room')
# async def create_room(name: str, password: str):
#     try:
#         add_room(name, password)
#         return {'message': 'Room created successfully'}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

def start_server():
    port = int(os.environ.get("PORT", 10007))
    uvicorn.run("server:app", host="0.0.0.0", port=port)

if __name__ == '__main__':
    start_server()