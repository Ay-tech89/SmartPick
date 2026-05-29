# SmartPick: Movie & Book Recommendation System 🎬📚

**SmartPick is a web application providing personalized recommendations for movies and books, powered by OMDB and Google Books APIs. The project is designed with a modern frontend and a secured, serverless-ready Python backend.**

---

## 🌟 Features

- **Multi-Domain Support:** Suggests both movies (using OMDB API) and books (using Google Books API).
- **Modern UI:** Responsive frontend with light/dark themes, Bootstrap icons, and smooth GSAP-based micro-animations.
- **Interactive Three.js Experience:** A 3D interactive hero background on the landing page.
- **Security Hardening:** Enforces HTTPS communication, sanitizes error reporting to clients, limits input queries, and restricts cross-origin resource sharing (CORS).
- **Vercel Native Routing:** Pre-configured to deploy easily as a static frontend and serverless Python backend.

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask, Flask-CORS, Requests (configured for Vercel Serverless Functions)
- **Frontend:** HTML, Vanilla CSS, JavaScript, Bootstrap Icons, GSAP Animation, Three.js
- **APIs:** OMDB API, Google Books API
- **Deployment:** Vercel (static files + Python serverless functions)

---

## 🔑 Security Architecture

The application has been audited and secured with the following production practices:
- **API Key Protection:** Keys are loaded via environment variables (`GOOGLE_BOOKS_API_KEY`, `OMDB_API_KEY`) and are never exposed to the client side.
- **HTTPS Enforcement:** External APIs are queried exclusively over TLS/HTTPS.
- **Safe CORS Policy:** Restricts incoming requests to local development origins and Vercel subdomains (with options to add custom domains dynamically).
- **Sanitized Errors:** Internal server-side errors are logged on the server instead of sending stack traces or library details to the client.
- **Input Limits:** Search inputs are truncated and limited to a maximum of 100 characters to prevent buffer or resource denial-of-service (DoS) attempts.

---

## 🚦 Local Development

To run the application locally:

### 1. Set Up Environment Variables
Create an `.env` file inside the `api/` directory (or project root):
```env
GOOGLE_BOOKS_API_KEY=your_google_books_key
OMDB_API_KEY=your_omdb_key
```

### 2. Start the Backend Server
Install dependencies and run the Flask entrypoint:
```bash
pip install -r api/requirements.txt
python api/index.py
```
The server will start running at `http://localhost:5000`.

### 3. Start the Frontend
Simply open `frontend/index.html` in your browser (e.g., using Live Server in VS Code or any local static server). The frontend will automatically detect that it is running on `localhost` and communicate with the local server.

---

## ☁️ Deploying to Vercel

The repository contains a `vercel.json` configured for a combined frontend/backend deployment.

1. **Push your code to GitHub/GitLab.**
2. **Import the repository into Vercel.**
3. Add your environment variables in the Vercel Dashboard (**Project Settings > Environment Variables**):
   - `GOOGLE_BOOKS_API_KEY`
   - `OMDB_API_KEY`
4. Click **Deploy**. Vercel will host the frontend statically and run the backend inside Python Serverless Functions.
