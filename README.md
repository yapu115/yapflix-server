<div align="center">
  <h1>🎬 YAPFLIX Backend 🎬</h1>
  <p>Backend for the YAPFLIX social network, designed to handle server operations, web logic, and database integration.</p>
</div>

---

## 📖 **Description**

The YAPFLIX backend is a REST API developed with **Node.js** and **Express**. Its purpose is to manage user data, authentication, and publications, as well as interact with external services such as cloud storage and third-party APIs.

---

## ⚙️ **Requirements**

- **Node.js** (version 16 or higher)  
- **PostgreSQL** installed and configured

---

## ✨ Features

- User management (registration, login, profiles).
- Publishing and modifying multimedia content.
- Integration with cloud storage for images.
- Content search through external APIs (The Movies Database, Google Books, Internet Games Database).
- Notification handling.
- Model-View Controller design pattern

---

## 🛠️ **Previous Installations**

1. Clone this repository:  

   ```bash
   git clone https://github.com/yapu115/yapflix-backend.git
   cd yapflix-backend
   ```
   
2. Install the dependencies: 

```bash
   npm install
   ```

3. Set environment variables

---

## 🔐 Setting Environment Variables

Create a .env file in the root directory and add the following variables:

```bash
   # Database configuration
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=your_username
  DB_PASSWORD=your_password
  DB_NAME=yapflix
  
  # Authentication keys
  JWT_SECRET=your_secret_key
  
  # Cloud storage configuration
  CLOUD_STORAGE_KEY=your_api_key
  CLOUD_STORAGE_SECRET=your_secret
  
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  
  # External APIs
  TMDB_API_KEY=your_tmdb_api_key
  
  GOOGLE_BOOKS_API_KEY=your_api_key
  
  IGDB_CLIENT_ID=your_client_id
  IGDB_API_CLIENT_SECRET=your_api_client_secret

   ```

   ---

   ## 📂 Project Structure

```bash
📦 yapflix-backend
 ┣ 📂src
 ┃ ┣ 📂config          # Server and database configuration
 ┃ ┣ 📂controllers     # Route controllers
 ┃ ┣ 📂middlewares     # Middlewares (authentication, cors, etc.)
 ┃ ┣ 📂models          # Database models
 ┃ ┣ 📂routes          # API routes
 ┃ ┣ 📂services        # Business logic and external services
 ┃ ┣ 📂validations     # Models validations
 ┃ ┗ app.js            # Main entry point
 ┗ .env.example        # Example environment variables
```

--- 

## 🔗 API ENDPOINTS

### Users

- GET /users/getAll/:userId - Get all users followed by an ID
- POST /users/signup - Register a new user
- POST /users/signin - Login a user
- GET /users/logged - Check if a user is logged in
- POST /users/logout - Log out a user
- GET /users/:userId/followers - Get a user's followers
- GET /users/:userId/following - Get a user's following
- POST /users/:userId/follow - Follow a user
- POST /users/:userId/unfollow - Unfollow a user
- POST /users/avatar - Change a user's avatar

### Posts

- POST /posts/create - Create a post
- GET /posts/:userId/read - Get all posts from a user and those followed by the user
- GET /posts/read/:id/user - Get all posts from a user
- POST /posts/:id/like - Update the likes
- POST /posts/:postId/comments - Add a comment

### Stories

- POST /stories/create - Create a story
- GET /stories/:userId/read - Get all the stories

### Notifications

- POST /notifications/create - Create a notification
- GET /notifications/getAll/:userId - Get all notifications from a user

### External APIs

- GET /apis/movies - Perform a movie search
- GET /apis/videogames - Perform a videogame search
- GET /apis/books - Perform a book search
- GET /apis/music - Perform a music search



