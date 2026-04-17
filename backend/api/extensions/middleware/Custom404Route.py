from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException


class CustomAPIMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api"):
            try:
                response = await call_next(request)
                # If the route doesn't exist, it will raise a 404
                if response.status_code == 404:
                    return JSONResponse(
                        content={
                            "error": "Route not found",
                            "status": 404,
                            "message": "The requested API endpoint does not exist. Please check your request and try again."
                        },
                        status_code=404
                    )
                return response
            except StarletteHTTPException as exc:
                if exc.status_code == 404:
                    return JSONResponse(
                        content={
                            "error": "Route not found",
                            "status": 404,
                            "message": "The requested API endpoint does not exist. Please check your request and try again."
                        },
                        status_code=404
                    )
                raise exc
        return await call_next(request)