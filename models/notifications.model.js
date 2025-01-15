import pool from "../config/db.config.js";

export class notificationsModel {
  // Create notification in db
  static async create({ notificationData }) {
    const { userId, type, content, senderId } = notificationData;

    try {
      const query = `
        INSERT INTO notifications (user_id, type, content, sender_id, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
      `;
      const values = [userId, type, content, senderId];
      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  }

  // Create notification from db
  static async getAll({ userId }) {
    try {
      const query = `
        SELECT 
        n.id,
        n.type,
        n.content,
        n.created_at,
        u.username,
        COALESCE(u.avatar, 'https://res.cloudinary.com/dweirdwh9/image/upload/v1736480925/default_pfp_yzrryd.png') AS user_avatar
        FROM notifications n
        JOIN users u ON n.sender_id = u.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC;
    `;
      const result = await pool.query(query, [userId]);

      return result.rows;
    } catch (err) {}
  }
}
