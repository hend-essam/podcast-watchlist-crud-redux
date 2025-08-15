# Podcast Watchlist CRUD Redux

A full-stack web application to manage your favorite podcasts. Built with React, Redux Toolkit, Tailwind CSS, Vite, and a custom Node.js/JSON Server backend.

## Features

- Add, edit, delete podcasts (with PIN protection)
- Search and filter podcasts by category
- Rate podcasts (1–5 stars)
- Responsive UI with modal dialogs
- Data validation for URLs and PINs
- Rate-limited backend with domain restrictions

## Tech Stack

- **Frontend:** React 19, Redux Toolkit, Tailwind CSS, Vite
- **Backend:** Node.js, JSON Server, custom validation middleware
- **Deployment:** Vercel (see [`server/vercel.json`](server/vercel.json))

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/hend-essam/podcast-watchlist-crud-redux.git
   cd podcast-watchlist-crud-redux
   ```

2. **Install dependencies:**
   ```sh
   cd client
   npm install
   cd ../server
   npm install
   ```

### Running Locally

#### Backend

1. Create a `.env` file in `server/` with:
   ```
   PORT=3005
   ADMIN_PIN=your_admin_pin
   NODE_ENV=development
   ```
2. Start the backend:
   ```sh
   npm start
   ```

#### Frontend

1. Start the frontend:

   ```sh
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

See the [workspace structure above](#) for details.

## API Endpoints

- `GET /podcasts` — List all podcasts
- `GET /podcasts/:id` — Get a single podcast
- `POST /podcasts` — Add a podcast (requires PIN)
- `PATCH /podcasts/:id` — Edit a podcast (requires PIN)
- `DELETE /podcasts/:id` — Delete a podcast (requires PIN)
- `GET /podcasts?q=searchTerm` — Search podcasts
