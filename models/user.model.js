import pool from "../config/db.config.js";
import bcrypt from "bcrypt";

export class UserModel {
  // Create new user in users table in db
  static async create({ userData }) {
    const { username, password, email } = userData;

    try {
      // verify existing user
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (existingUser.rows.length > 0) {
        throw new Error("Username already exists");
      }

      // Verify mail in use
      const existingMail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingMail.rows.length > 0) {
        throw new Error("Email already in use");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, hashedPassword]
      );

      return {
        username,
        email,
      };
    } catch (err) {
      if (
        err.message === "Username already exists" ||
        err.message === "Email already in use"
      ) {
        throw new Error(err.message);
      }
      throw new Error("Error creating user");
    }
  }

  // get user from users table by Id
  static async get({ userData }) {
    const { username, password } = userData;

    try {
      const result = await pool.query(
        "SELECT id, email, password, COALESCE(avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS avatar FROM users WHERE username = $1",
        [username]
      );

      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      const user = result.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      console.log(user);
      return {
        id: user.id,
        username: username,
        email: user.email,
        userAvatar: user.avatar,
        message: "Login successful",
      };
    } catch (err) {
      if (
        err.message === "User not found" ||
        err.message === "Invalid password"
      ) {
        throw new Error(err.message);
      }
      throw new Error("Error during login");
    }
  }

  // Get all users from users table in db
  static async getAll() {
    try {
      const result = await pool.query(
        "SELECT id, email, COALESCE(avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS avatar, username FROM users"
      );

      if (result.rows.length === 0) {
        throw new Error("Users not found");
      }

      const users = result.rows;

      return users;
    } catch (err) {
      if (err.message === "Users not found") {
        throw new Error(err.message);
      }
      console.log(err.message);
      throw new Error("Error during users search");
    }
  }

  // get all followers from follows table in db
  static async getFollowers({ userId }) {
    try {
      const followersQuery = await pool.query(
        `SELECT u.id, u.username, u.avatar
         FROM follows f
         JOIN users u ON f.follower_id = u.id
         WHERE f.followed_id = $1`,
        [userId]
      );

      return followersQuery.rows;
    } catch (err) {
      throw new Error("Failed to retrieve followers");
    }
  }

  // get all followed from follows table in db
  static async getFollowed({ userId }) {
    try {
      const followedQuery = await pool.query(
        `SELECT u.id, u.username, u.avatar
         FROM follows f
         JOIN users u ON f.followed_id = u.id
         WHERE f.follower_id = $1`,
        [userId]
      );

      return followedQuery.rows;
    } catch (err) {
      throw new Error("Failed to retrieve followed");
    }
  }

  // Insert a new follow value in follows table from db
  static async follow({ userId, targetId }) {
    try {
      await pool.query(
        `INSERT INTO follows (follower_id, followed_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [userId, targetId]
      );

      return;
    } catch (err) {
      throw new Error("Failed to retrieve followed");
    }
  }

  // Remove a follow value in follows table from db
  static async unfollow({ userId, targetId }) {
    try {
      await pool.query(
        `DELETE FROM follows
         WHERE follower_id = $1 AND followed_id = $2`,
        [userId, targetId]
      );

      return;
    } catch (err) {
      throw new Error("Failed to retrieve followed");
    }
  }

  // Set new avatar in users table in db by Id
  static async updateAvatar({ file, userId }) {
    try {
      const avatarValue = [file.path, userId];

      const insertMediaQuery = `
        UPDATE users SET avatar = $1 WHERE id = $2
        RETURNING avatar
      `;

      const mediaResult = await pool.query(insertMediaQuery, avatarValue);
      const newAvatar = mediaResult.rows[0];
      return newAvatar;
    } catch (error) {
      console.error("Error saving avatar:", error);
      throw new Error("Error saving avatar");
    }
  }
}
