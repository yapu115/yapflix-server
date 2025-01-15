import { validatePost } from "../validations/validate_posts.js";

export class PostController {
  constructor({ postModel }) {
    this.postModel = postModel;
  }

  // Create new post
  createPost = async (req, res) => {
    const result = validatePost(req.body);

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    try {
      const post = await this.postModel.createPost({ postData: result.data });
      if (req.files && req.files.length > 0) {
        const files = req.files;
        const postId = post.id;
        const pictures = await this.postModel.savePictures({ files, postId });
        post.pictures = pictures;
      }
      res.send(post);
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };

  // Get all post by Id (only followed users)
  getAllPosts = async (req, res) => {
    const { userId } = req.params;
    try {
      const posts = await this.postModel.readPosts({ userId });
      res.send(posts);
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };

  // Get users posts by Id
  getPostsByUser = async (req, res) => {
    const { id: userId } = req.params;

    try {
      const posts = await this.postModel.readUserPosts({ userId });
      res.send(posts);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };

  // Update post likes
  updateLikes = async (req, res) => {
    const { id: postId } = req.params;
    const { userId } = req.body;

    const likeData = {
      postId,
      userId,
    };

    try {
      const message = await this.postModel.updatePostLikes({ likeData });

      res.status(200).send({ success: true, message });
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };

  // Create new post comment
  uploadComment = async (req, res) => {
    const { postId } = req.params;
    const { userId, content } = req.body;

    const commentData = {
      postId,
      userId,
      content,
    };

    try {
      const comment = await this.postModel.uploadNewComment({ commentData });

      res.status(200).send(comment);
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };
}
