# backend/app.py

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

# =====================================================
# ROUTES - API ENDPOINTS
# =====================================================

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

# =====================================================
# MOVIES - OMDB API
# =====================================================


@app.route('/recommend/omdb-movies', methods=['POST'])
def recommend_omdb_movies():
    data = request.get_json() or {}
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    url = "http://www.omdbapi.com/"
    
    try:
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
    
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



# =====================================================
# BOOKS - GOOGLE BOOKS API
# =====================================================


@app.route('/recommend/google-books', methods=['POST'])
def recommend_google_books():
    data = request.get_json() or {}
    query = data.get('query', '').strip()
    max_results = data.get('max_results', 10)

    if not query:
        return jsonify({"error": "No query provided"}), 400

    url = "https://www.googleapis.com/books/v1/volumes"
    params = {
        "q": query,
        "maxResults": min(max_results, 40),
        "key": GOOGLE_BOOKS_API_KEY
    }

    try:
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
        return jsonify({"error": f"Failed to fetch from Google Books API: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# =====================================================
# RUN APPLICATION
# =====================================================


if __name__ == '__main__':
    print("\n" + "="*50)
    print("   SmartPick Backend Server Starting...")
    print("="*50)
    print("   Books: Google Books API")
    print("   Movies: OMDB API\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
