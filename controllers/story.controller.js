import { validateStory } from "../validations/validate_stories.js";

export class StoryController {
  constructor({ storyModel }) {
    this.storyModel = storyModel;
  }

  // Create new Story
  createStory = async (req, res) => {
    const result = validateStory(req.body);

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    try {
      const story = await this.storyModel.createStory({
        storyData: result.data,
      });

      if (req.file) {
        const file = req.file;
        const storyId = story.id;

        const mediaFile = await this.storyModel.saveMedia({ file, storyId });

        story.mediaUrl = mediaFile;
      }

      res.send(story);
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };

  // Get all stories by Id(only followed users)
  getAllStories = async (req, res) => {
    const { userId } = req.params;

    try {
      const stories = await this.storyModel.readStories({ userId });
      console.log(stories);
      res.send(stories);
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };
}
