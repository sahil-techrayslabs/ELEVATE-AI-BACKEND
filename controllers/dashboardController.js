import AiData from "../models/AiData.js";
import User from "../models/User.js";

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's AI data with analytics
    const aiData = await AiData.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate engagement metrics
    const totalPosts = aiData.length;
    const totalEngagement = aiData.reduce((sum, post) => {
      const engagement = post.analysis?.engagement || {};
      return (
        sum +
        (engagement.likes || 0) +
        (engagement.comments || 0) +
        (engagement.shares || 0)
      );
    }, 0);

    // Get sentiment distribution
    const sentimentDistribution = aiData.reduce((acc, post) => {
      const sentiment = post.analysis?.sentiment || "neutral";
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    // Get topic distribution
    const topicDistribution = aiData.reduce((acc, post) => {
      const topics = post.analysis?.topics || [];
      topics.forEach((topic) => {
        acc[topic.topic] = (acc[topic.topic] || 0) + topic.count;
      });
      return acc;
    }, {});

    // Get engagement trends
    const engagementTrends = aiData.map((post) => ({
      date: post.createdAt,
      engagement: post.analysis?.engagement || {
        likes: 0,
        comments: 0,
        shares: 0,
      },
    }));

    res.json({
      totalPosts,
      totalEngagement,
      sentimentDistribution,
      topicDistribution,
      engagementTrends,
      recentPosts: aiData.map((post) => ({
        id: post._id,
        content: post.postContent,
        generatedComment: post.generatedComment,
        analysis: post.analysis,
        createdAt: post.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
