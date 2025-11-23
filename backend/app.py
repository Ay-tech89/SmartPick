import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# API Keys 
GOOGLE_BOOKS_API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')
OMDB_API_KEY = os.getenv('OMDB_API_KEY')

@app.route('/')
def index():
    return jsonify({
        "message": "Welcome to SmartPick API!",
        "status": "running",
        "endpoints": {
            "movies": "/api/movies",
            "books": "/api/books"
        }
    })