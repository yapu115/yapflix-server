import {
  validateUser,
  validatePartialUser,
} from "../validations/validate_users.js";
import jwt from "jsonwebtoken";

const generateToken = ({ user }) => {
  const secretKey = process.env.JWT_SECRET;
  const expiresIn = "1h";

  const id = user.id;
  const username = user.username;
  const email = user.email;
  const userAvatar = user.userAvatar;

  return jwt.sign({ id, username, email, userAvatar }, secretKey, {
    expiresIn,
  });
};

export class UserController {
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  // Create new user
  createUser = async (req, res) => {
    const result = validateUser(req.body);

    if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    try {
      const user = await this.userModel.create({ userData: result.data });
      res.send(user);
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };

  // Get a particular user by username
  getUser = async (req, res) => {
    const result = validatePartialUser(req.body);

    if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    try {
      const user = await this.userModel.get({ userData: result.data });
      const token = generateToken({ user });
      res
        .cookie("access_token", token, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 1000 * 60 * 60, // 1 hour
        })
        .send({ user, token });
    } catch (error) {
      res.status(400).send(error.message);
    }
  };

  // Get all users
  getAllUsers = async (req, res) => {
    try {
      const { userId } = req.params;

      const allUsers = await this.userModel.getAll();
      const followed = await this.userModel.getFollowed(userId);

      const followedIds = new Set(followed.map((user) => user.id));

      const users = allUsers.map((user) => ({
        ...user,
        isFollowing: followedIds.has(user.id),
      }));

      res.send({ users });
    } catch (error) {
      res.status(400).send(error.message);
    }
  };

  // Verify if the user is logged in
  verifySigned = async (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: "Not signed in" });
    }

    try {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({
        user: data,
        message: "User signed in",
      });
    } catch (err) {
      res
        .status(403)
        .json({ loggedIn: false, message: "Invalid or expired token" });
    }
  };

  // log out
  deleteSigned = async (req, res) => {
    res
      .clearCookie("access_token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .json({ message: "logout succesful" });
  };

  // Verify user followers
  verifyFollowers = async (req, res) => {
    const { userId } = req.params;
    try {
      const followers = await this.userModel.getFollowers({ userId });
      console.log(followers);
      res.send(followers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // Verify user followed
  verifyFollowing = async (req, res) => {
    const { userId } = req.params;
    try {
      const followed = await this.userModel.getFollowed({ userId });
      res.send(followed);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // follow user
  followUser = async (req, res) => {
    const { userId } = req.params;
    const { targetId } = req.body;

    try {
      await this.userModel.follow({ userId, targetId });
      res.status(200).json({ message: "Followed user successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to follow user" });
    }
  };

  // unfollow user
  unfollowUser = async (req, res) => {
    const { userId } = req.params;
    const { targetId } = req.body;

    try {
      await this.userModel.unfollow({ userId, targetId });
      res.status(200).json({ message: "Unfollowed user successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  };

  // update avatar
  saveAvatar = async (req, res) => {
    const { userId } = req.body;

    console.log(userId);
    console.log(req.file);

    if (!userId || !req.file) {
      return res.status(400).json({ message: "There is data missing." });
    }

    try {
      const file = req.file;
      const newAvatar = await this.userModel.updateAvatar({ file, userId });
      res.send(newAvatar);
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };
}
