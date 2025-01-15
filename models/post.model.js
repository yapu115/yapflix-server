import pool from "../config/db.config.js";

export class PostModel {
  // Create new post in db
  static async createPost({ postData }) {
    const { userId, date, likes, message, urlMediaImage } = postData;

    try {
      const newPost = `
          INSERT INTO posts (user_id, date, likes, message, url_media_image)
          VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
      const postValues = [
        userId,
        date || new Date(),
        likes || 0,
        message,
        urlMediaImage,
      ];
      const postResult = await pool.query(newPost, postValues);
      return postResult.rows[0];
    } catch (err) {
      console.log(err);
      throw new Error("Error uploading the post");
    }
  }

  // Save post pictures in db
  static async savePictures({ files, postId }) {
    try {
      const maxOrderResult = await pool.query(
        `SELECT COALESCE(MAX(upload_order), 0) AS max_order FROM pictures WHERE post_id = $1`,
        [postId]
      );
      let currentOrder = maxOrderResult.rows[0].max_order;

      const pictureValues = files.map((file) => {
        currentOrder++;
        return [file.path, postId, currentOrder];
      });

      const insertPicturesQuery = `
        INSERT INTO pictures (url, post_id, upload_order)
        VALUES ($1, $2, $3)
        RETURNING url
      `;

      const picturesData = [];
      for (const values of pictureValues) {
        const pictureResult = await pool.query(insertPicturesQuery, values);
        picturesData.push(pictureResult.rows[0].url);
      }

      return picturesData;
    } catch (error) {
      console.error("Error saving pictures:", error);
      throw new Error("Error saving pictures");
    }
  }

  // Read all db posts by userId
  static async readPosts({ userId }) {
    try {
      const postsQuery = await pool.query(
        `SELECT 
          posts.id AS post_id, 
          posts.user_id, 
          users.username, 
          COALESCE(users.avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS user_avatar,
          posts.message,
          posts.url_media_image,
          posts.date,
  
          pictures.url AS picture_url, 
          pictures.upload_order AS picture_order,
  
          comments.id AS comment_id,
          comments.user_id AS comment_user_id,
          comment_users.username AS comment_username,
          COALESCE(comment_users.avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS comment_user_avatar,
          comments.content AS comment_content,
          comments.created_at AS comment_date,
  
          likes.user_id AS like_user_id
  
          FROM posts 
          LEFT JOIN pictures ON posts.id = pictures.post_id
          LEFT JOIN users ON posts.user_id = users.id
          LEFT JOIN comments ON posts.id = comments.post_id
          LEFT JOIN users AS comment_users ON comments.user_id = comment_users.id
          LEFT JOIN likes ON posts.id = likes.post_id

          LEFT JOIN follows ON follows.followed_id = posts.user_id

          WHERE 
          posts.user_id IN (
            SELECT followed_id
            FROM follows
            WHERE follower_id = $1
          ) 
          OR posts.user_id = $1

          ORDER BY posts.date DESC, pictures.upload_order ASC`,
        [userId]
      );

      if (postsQuery.rows.length === 0) {
        throw new Error("No posts found");
      }

      const posts = postsQuery.rows.reduce((acc, row) => {
        const post = acc.find((p) => p.id === row.post_id);

        if (post) {
          if (
            row.picture_url &&
            !post.pictures.some((p) => p.url === row.picture_url)
          ) {
            post.pictures.push({
              url: row.picture_url,
              order: row.picture_order,
            });
          }

          if (
            row.comment_id &&
            !post.comments.some((comment) => comment.id === row.comment_id)
          ) {
            post.comments.push({
              id: row.comment_id,
              user_id: row.comment_user_id,
              username: row.comment_username,
              userAvatar: row.comment_user_avatar,
              content: row.comment_content,
              date: row.comment_date,
            });
          }

          if (row.like_user_id && !post.likes.includes(row.like_user_id)) {
            post.likes.push(row.like_user_id);
          }
        } else {
          const pictures = row.picture_url
            ? [{ url: row.picture_url, order: row.picture_order }]
            : [];

          if (row.url_media_image) {
            pictures.unshift({
              url: row.url_media_image,
              order: 0,
            });
          }

          acc.push({
            id: row.post_id,
            username: row.username,
            userAvatar: row.user_avatar,
            user_id: row.user_id,
            message: row.message,
            date: row.date,
            likes: row.like_user_id ? [row.like_user_id] : [],
            pictures: pictures,
            comments: row.comment_id
              ? [
                  {
                    id: row.comment_id,
                    user_id: row.comment_user_id,
                    username: row.comment_username,
                    userAvatar: row.comment_user_avatar,
                    content: row.comment_content,
                    date: row.comment_date,
                  },
                ]
              : [],
          });
        }
        return acc;
      }, []);

      return posts.map((post) => {
        post.pictures.sort((a, b) => a.order - b.order);
        return post;
      });
    } catch (err) {
      console.log(err);
      if (err.message === "No posts found") {
        throw new Error(err.message);
      }
      throw new Error("Error during posts search");
    }
  }

  // Read all user db posts by userId
  static async readUserPosts({ userId }) {
    try {
      const postsQuery = await pool.query(
        `SELECT 
          posts.id AS post_id,
          posts.message,
          posts.date,
          posts.url_media_image,

          posts.user_id, 
          users.username, 
          COALESCE(users.avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS user_avatar,
          

          pictures.url AS picture_url,
          pictures.upload_order AS picture_order,

          comments.id AS comment_id,
          comments.user_id AS comment_user_id,
          comments.content AS comment_content,
          comments.created_at AS comment_date,

          likes.user_id AS like_user_id

        FROM posts
        LEFT JOIN pictures ON posts.id = pictures.post_id
        LEFT JOIN users ON posts.user_id = users.id
        LEFT JOIN comments ON posts.id = comments.post_id
        LEFT JOIN likes ON posts.id = likes.post_id
        WHERE posts.user_id = $1
        ORDER BY posts.date DESC, pictures.upload_order ASC`,
        [userId]
      );

      if (postsQuery.rows.length === 0) {
        return [];
      }

      const posts = postsQuery.rows.reduce((acc, row) => {
        const post = acc.find((p) => p.id === row.post_id);

        if (post) {
          if (
            row.picture_url &&
            !post.pictures.some((p) => p.url === row.picture_url)
          ) {
            post.pictures.push({
              url: row.picture_url,
              order: row.picture_order,
            });
          }

          if (
            row.comment_id &&
            !post.comments.some((comment) => comment.id === row.comment_id)
          ) {
            post.comments.push({
              id: row.comment_id,
              username: row.username,
              userAvatar: row.user_avatar,
              user_id: row.comment_user_id,
              content: row.comment_content,
              date: row.comment_date,
            });
          }

          if (row.like_user_id && !post.likes.includes(row.like_user_id)) {
            post.likes.push(row.like_user_id);
          }
        } else {
          const pictures = row.picture_url
            ? [{ url: row.picture_url, order: row.picture_order }]
            : [];

          if (row.url_media_image) {
            pictures.unshift({
              url: row.url_media_image,
              order: 0,
            });
          }
          acc.push({
            id: row.post_id,
            username: row.username,
            userAvatar: row.user_avatar,
            message: row.message,
            date: row.date,
            urlMediaImage: row.url_media_image,
            likes: row.like_user_id ? [row.like_user_id] : [],
            pictures: pictures,
            comments: row.comment_id
              ? [
                  {
                    id: row.comment_id,
                    user_id: row.comment_user_id,
                    content: row.comment_content,
                    date: row.comment_date,
                  },
                ]
              : [],
          });
        }

        return acc;
      }, []);

      return posts.map((post) => {
        post.pictures.sort((a, b) => a.order - b.order);
        return post;
      });
    } catch (err) {
      console.error("Error fetching user posts:", err);
      throw new Error("Error fetching user posts");
    }
  }

  // Update likes table in db
  static async updatePostLikes({ likeData }) {
    const { userId, postId } = likeData;

    try {
      const { rows: existingLike } = await pool.query(
        "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",
        [userId, postId]
      );

      if (existingLike.length > 0) {
        await pool.query(
          "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
          [userId, postId]
        );

        await pool.query("UPDATE posts SET likes = likes - 1 WHERE id = $1", [
          postId,
        ]);

        return "like removed";
      } else {
        await pool.query(
          "INSERT INTO likes (user_id, post_id) VALUES ($1, $2)",
          [userId, postId]
        );

        await pool.query("UPDATE posts SET likes = likes + 1 WHERE id = $1", [
          postId,
        ]);

        return "Post liked";
      }
    } catch (err) {
      throw new Error("Error liking the post");
    }
  }

  // Insert new comment in comments table
  static async uploadNewComment({ commentData }) {
    const { userId, postId, content } = commentData;

    try {
      const commentQuery = await pool.query(
        `INSERT INTO comments (post_id, user_id, content)
        VALUES ($1, $2, $3) 
        RETURNING *`,
        [postId, userId, content]
      );

      const userQuery = await pool.query(
        `SELECT 
        username, 
        COALESCE(avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS user_avatar
        FROM users
        WHERE users.id = $1 
        `,
        [userId]
      );

      const commentData = commentQuery.rows[0];
      const userData = userQuery.rows[0];

      const fullComment = {
        username: userData.username,
        userAvatar: userData.user_avatar,
        content: commentData.content,
        date: new Date(commentData.created_at),
      };

      return fullComment;
    } catch (err) {
      console.log(err);
      throw new Error("Error during comment upload");
    }
  }
}
