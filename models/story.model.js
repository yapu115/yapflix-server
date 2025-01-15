import pool from "../config/db.config.js";

export class StoryModel {
  // Create new story in stories table in db
  static async createStory({ storyData }) {
    const { userId, date, type, expirationDate } = storyData;

    try {
      const newStoryQuery = `
            INSERT INTO stories (user_id, date, type, expiration_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `;
      const storyValues = [
        userId,
        date || new Date(),
        type || "image",
        expirationDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      ];

      const storyResult = await pool.query(newStoryQuery, storyValues);
      return storyResult.rows[0];
    } catch (err) {
      console.error("Error creating story:", err);
      throw new Error("Error creating the story");
    }
  }

  // Save story image in story_media table in db
  static async saveMedia({ file, storyId }) {
    try {
      const mediaValues = [file.path, storyId];

      const insertMediaQuery = `
        INSERT INTO story_media (url, story_id)
        VALUES ($1, $2)
        RETURNING url
      `;

      const mediaResult = await pool.query(insertMediaQuery, mediaValues);

      return mediaResult.rows[0].url;
    } catch (error) {
      console.error("Error saving media:", error);
      throw new Error("Error saving media");
    }
  }

  // Get all stories from stories table in db by userId
  static async readStories({ userId }) {
    try {
      const storiesQuery = await pool.query(
        `SELECT 
          s.id AS story_id, 
          s.user_id, 

          u.username AS username, 
          COALESCE(u.avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS user_avatar,
          
          s.date AS story_date,
          s.type AS story_type,
          s.expiration_date AS expiration_date,
          
          sm.url AS media_url
        
          FROM stories s
          LEFT JOIN story_media sm ON s.id = sm.story_id
          LEFT JOIN users u ON s.user_id = u.id

          WHERE 
            s.user_id IN (
                SELECT followed_id
                FROM follows
                WHERE follower_id = $1
            ) 
            OR s.user_id = $1

          ORDER BY u.username ASC, s.date DESC`,
        [userId]
      );

      if (storiesQuery.rows.length === 0) {
        throw new Error("No stories found");
      }

      const groupedStories = storiesQuery.rows.reduce((acc, row) => {
        let user = acc.find((u) => u.userId === row.user_id);

        if (!user) {
          user = {
            userId: row.user_id,
            username: row.username,
            userAvatar: row.user_avatar,
            stories: [],
          };
          acc.push(user);
        }

        user.stories.push({
          id: row.story_id,
          date: row.story_date,
          type: row.story_type,
          expiration_date: row.expiration_date,
          mediaUrl: row.media_url,
        });

        return acc;
      }, []);

      return groupedStories;
    } catch (err) {
      console.error("Error reading stories:", err.message);
      if (err.message === "No stories found") {
        throw new Error(err.message);
      }
      throw new Error("Error during stories search");
    }
  }
}
