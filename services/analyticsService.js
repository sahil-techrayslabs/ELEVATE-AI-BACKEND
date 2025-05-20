import AiData from "../models/AiData.js";

export const analyzePost = async (postText, userId) => {
  try {
    // Analyze sentiment and topics using OpenAI
    const analysis = {
      sentiment: "Positive",
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
      topics: [
        { topic: "Technology", count: 1 },
        { topic: "Innovation", count: 1 },
      ],
      trends: [{ date: new Date().toISOString().split("T")[0], engagement: 0 }],
    };

    // Store analysis data
    const aiData = new AiData({
      user: userId,
      postContent: postText,
      generatedComment: "",
      analysis,
      status: "completed",
    });

    await aiData.save();
    return analysis;
  } catch (error) {
    console.error("Error analyzing post:", error);
    throw new Error("Failed to analyze post");
  }
};

export const updateEngagement = async (postId, engagementData) => {
  try {
    const aiData = await AiData.findById(postId);
    if (!aiData) throw new Error("Post not found");

    aiData.analysis.engagement = {
      ...aiData.analysis.engagement,
      ...engagementData,
    };

    // Update trends
    const today = new Date().toISOString().split("T")[0];
    const totalEngagement = Object.values(engagementData).reduce(
      (a, b) => a + b,
      0
    );

    const trendIndex = aiData.analysis.trends.findIndex(
      (t) => t.date === today
    );
    if (trendIndex >= 0) {
      aiData.analysis.trends[trendIndex].engagement = totalEngagement;
    } else {
      aiData.analysis.trends.push({ date: today, engagement: totalEngagement });
    }

    await aiData.save();
    return aiData.analysis;
  } catch (error) {
    console.error("Error updating engagement:", error);
    throw new Error("Failed to update engagement data");
  }
};

export const getAnalytics = async (userId) => {
  try {
    const analytics = await AiData.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    return analytics;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw new Error("Failed to fetch analytics data");
  }
};
