# api/index.py

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import logging
from dotenv import load_dotenv

# Load environment variables from .env file (primarily for local development)
load_dotenv()

app = Flask(__name__)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Secure CORS configuration
# Allows:
# - localhost/127.0.0.1 on any port (local development)
# - any Vercel domain (for preview/production deployments)
# - custom domains specified in ALLOWED_ORIGINS environment variable
allowed_origins = [
    r"^http://localhost(:\d+)?$",
    r"^http://127\.0\.0\.1(:\d+)?$",
    r"^https://.*\.vercel\.app$"
]

custom_origins_env = os.getenv('ALLOWED_ORIGINS', '')
if custom_origins_env:
    for origin in custom_origins_env.split(','):
        origin = origin.strip()
        if origin:
            # Escape to create a literal regex pattern
            allowed_origins.append(r"^" + re.escape(origin) + r"$")

CORS(app, origins=allowed_origins)

# API Keys loaded securely from environment
GOOGLE_BOOKS_API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')
OMDB_API_KEY = os.getenv('OMDB_API_KEY')

# =====================================================
# ROUTES - API ENDPOINTS
# =====================================================

@app.route('/api')
def api_index():
    return jsonify({
        "message": "Welcome to SmartPick API!",
        "status": "running",
        "endpoints": {
            "movies": "/api/recommend/omdb-movies",
            "books": "/api/recommend/google-books"
        }
    })

# =====================================================
# MOVIES - OMDB API
# =====================================================

@app.route('/api/recommend/omdb-movies', methods=['POST'])
def recommend_omdb_movies():
    try:
        # Check API key configuration
        if not OMDB_API_KEY:
            logger.error("OMDB API key is not configured.")
            return jsonify({"error": "Service configuration error"}), 500

        data = request.get_json() or {}
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({"error": "No query provided"}), 400
            
        # Input Validation: Limit length to prevent DoS or abuse
        if len(query) > 100:
            return jsonify({"error": "Query too long (maximum 100 characters)"}), 400
        
        # Enforce HTTPS connection to prevent credential sniffing
        url = "https://www.omdbapi.com/"
        
        search_response = requests.get(url, params={
            'apikey': OMDB_API_KEY, 's': query, 'type': 'movie'
        }, timeout=10)
        search_response.raise_for_status()
        search_data = search_response.json()
        
        if search_data.get('Response') == 'False':
            return jsonify({
                "recommendations": [],
                "message": search_data.get('Error', 'No movies found'),
                "query": query
            })
        
        movies = search_data.get('Search', [])[:10]
        
        recommendations = []
        for movie in movies:
            imdb_id = movie.get('imdbID')
            detail_response = requests.get(url, params={
                'apikey': OMDB_API_KEY, 'i': imdb_id, 'plot': 'full'
            }, timeout=10)
            detail_response.raise_for_status()
            detail_data = detail_response.json()
            
            if detail_data.get('Response') == 'True':
                movie_data = {
                    "title": detail_data.get('Title', 'Unknown Title'),
                    "year": detail_data.get('Year', 'N/A'),
                    "genre": detail_data.get('Genre', ''),
                    "director": detail_data.get('Director', ''),
                    "actors": detail_data.get('Actors', ''),
                    "plot": detail_data.get('Plot', 'No plot available'),
                    "language": detail_data.get('Language', ''),
                    "country": detail_data.get('Country', ''),
                    "image": detail_data.get('Poster', ''),
                    "rating": detail_data.get('imdbRating', 'N/A'),
                    "runtime": detail_data.get('Runtime', ''),
                    "imdb_id": imdb_id,
                    "imdb_url": f"https://www.imdb.com/title/{imdb_id}/",
                    "type": detail_data.get('Type', 'movie')
                }
                recommendations.append(movie_data)
        
        return jsonify({
            "recommendations": recommendations,
            "total_found": len(movies),
            "query": query
        })
    
    except requests.exceptions.RequestException as e:
        logger.error(f"OMDB API Request failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch from external OMDB API"}), 502
    except Exception as e:
        logger.error(f"Error handling OMDB movies recommendation: {str(e)}", exc_info=True)
        # Sanitized error message (do not expose str(e) to client)
        return jsonify({"error": "An internal server error occurred"}), 500


# =====================================================
# BOOKS - GOOGLE BOOKS API
# =====================================================

@app.route('/api/recommend/google-books', methods=['POST'])
def recommend_google_books():
    try:
        # Check API key configuration
        if not GOOGLE_BOOKS_API_KEY:
            logger.error("Google Books API key is not configured.")
            return jsonify({"error": "Service configuration error"}), 500

        data = request.get_json() or {}
        query = data.get('query', '').strip()
        max_results = data.get('max_results', 10)

        if not query:
            return jsonify({"error": "No query provided"}), 400
            
        # Input Validation: Limit length to prevent DoS or abuse
        if len(query) > 100:
            return jsonify({"error": "Query too long (maximum 100 characters)"}), 400

        url = "https://www.googleapis.com/books/v1/volumes"
        params = {
            "q": query,
            "maxResults": min(max_results, 40),
            "key": GOOGLE_BOOKS_API_KEY
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        items = data.get("items", [])
        recommendations = []

        for item in items:
            volume_info = item.get("volumeInfo", {})
            book_data = {
                "title": volume_info.get("title", "Unknown Title"),
                "author": ", ".join(volume_info.get("authors", [])) if volume_info.get("authors") else "Unknown Author",
                "description": volume_info.get("description", ""),
                "image": volume_info.get("imageLinks", {}).get("thumbnail", ""),
                "rating": volume_info.get("averageRating"),
                "rating_count": volume_info.get("ratingsCount"),
                "published_date": volume_info.get("publishedDate", ""),
                "page_count": volume_info.get("pageCount"),
                "categories": ", ".join(volume_info.get("categories", [])) if volume_info.get("categories") else "",
                "language": volume_info.get("language", ""),
                "publisher": volume_info.get("publisher", ""),
                "info_link": volume_info.get("infoLink", ""),
                "preview_link": volume_info.get("previewLink", "")
            }
            recommendations.append(book_data)

        return jsonify({
            "recommendations": recommendations,
            "total_found": data.get("totalItems", 0)
        })

    except requests.exceptions.RequestException as e:
        logger.error(f"Google Books API Request failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch from external Google Books API"}), 502
    except Exception as e:
        logger.error(f"Error handling Google Books recommendation: {str(e)}", exc_info=True)
        # Sanitized error message (do not expose str(e) to client)
        return jsonify({"error": "An internal server error occurred"}), 500


# =====================================================
# RUN APPLICATION (For Local Testing)
# =====================================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("   SmartPick Backend Server Starting (Local Dev Mode)...")
    print("="*50)
    print("   Books Route:  http://localhost:5000/api/recommend/google-books")
    print("   Movies Route: http://localhost:5000/api/recommend/omdb-movies\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
