import os
import sys
from pathlib import Path

# Add the backend directory to the path so we can import from it
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

# Import app from backend/server.py
from server import app

# Use Mangum to handle AWS Lambda integration
from mangum import Mangum

# Create the handler
handler = Mangum(app) 