# SmartPick: AI-Powered Movie & Book Recommendation System 🎬📚

**Personalized recommendations for movies and books powered by content-based algorithms, OMDB and Google Books APIs. Modern, responsive, and built for deployment with secure backend practices.**

---

## 🌟 Features

- **Content-Based Recommendations:** Finds top matches by analyzing item attributes (plot, genre, author, etc.) using NLP vectorization and cosine similarity algorithms.
- **Multi-Domain Support:** Suggests both movies (using OMDB API) and books (using Google Books API).
- **Modern UI:** Responsive frontend with light/dark themes, Bootstrap icons, and smooth GSAP-based animations.
- **User Input:** Users search for a title and receive similar items instantly.
- **API Key Security:** Backend API keys are managed securely via `.env` and are never exposed.

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask, Flask-CORS, Scikit-learn, OMDB API, Google Books API
- **Frontend:** HTML, CSS, JavaScript, Bootstrap Icons, GSAP Animation, Three.js
- **Database:** None required – APIs and NLP for real-time, stateless recommendations
- **Deployment:** Can be deployed locally or on cloud using Python and static hosting for frontend

---

## 🚦 How It Works

1. **User inputs a movie or book title.**
2. **Flask backend** receives the input, fetches data using OMDB or Google Books API.
3. **NLP vectorization:** Uses CountVectorizer to process plot/description and genre info.
4. **Cosine similarity:** Calculates the most similar items based on processed vectors.
5. **Frontend shows top N recommendations** with movie/book info, ratings, and links.

---

## 🔑 Security Practices

- Backend API keys (OMDB & Google Books) are loaded from `.env` files and protected by `.gitignore`.
- There are **no keys in frontend, static files, or committed code**.
- Cross-Origin Resource Sharing (CORS) is enabled for frontend-backend communication only.

---

## 📊 Algorithms

- **NLP:** CountVectorizer from scikit-learn converts text to vectors.
- **Cosine similarity:** Finds top-N most similar items based on feature vectors.
- **Content-based:** Only item features and user queries are used – no collaborative/user ratings.
