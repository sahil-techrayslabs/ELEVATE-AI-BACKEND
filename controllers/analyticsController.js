import {
  analyzePost,
  updateEngagement,
  getAnalytics,
} from "../services/analyticsService.js";

export const analyzePostContent = async (req, res) => {
  try {
    const { postText } = req.body;
    const userId = req.user._id;

    if (!postText) {
      return res.status(400).json({ message: "Post text is required" });
    }

    const analysis = await analyzePost(postText, userId);
    res.status(200).json({ analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePostEngagement = async (req, res) => {
  try {
    const { postId } = req.params;
    const engagementData = req.body;

    if (!postId || !engagementData) {
      return res
        .status(400)
        .json({ message: "Post ID and engagement data are required" });
    }

    const updatedAnalysis = await updateEngagement(postId, engagementData);
    res.status(200).json({ analysis: updatedAnalysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const analytics = await getAnalytics(userId);
    res.status(200).json({ analytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
