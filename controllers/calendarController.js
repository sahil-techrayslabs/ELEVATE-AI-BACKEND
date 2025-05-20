import Post from "../models/Post.js";

// Add a new scheduled post
export const addPost = async (req, res) => {
  try {
    const { title, content, platform, time, date } = req.body;
    const userId = req.user._id; // From auth middleware

    const post = await Post.create({
      title,
      content,
      platform,
      time,
      date,
      userId,
      status: "scheduled",
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ error: "Failed to add post" });
  }
};

// Get all scheduled posts for the user
export const getPosts = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const posts = await Post.find({ userId }).sort({ date: 1 });
    res.json(posts);
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({ error: "Failed to get posts" });
  }
};

// Update a scheduled post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // From auth middleware

    const post = await Post.findOne({ _id: id, userId });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
};

// Delete a scheduled post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // From auth middleware

    const post = await Post.findOne({ _id: id, userId });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};
