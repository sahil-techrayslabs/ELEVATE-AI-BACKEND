import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ["linkedin", "twitter", "facebook"],
      default: "linkedin",
    },
    metadata: {
      title: String,
      description: String,
      tags: [String],
      url: String,
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    aiAnalysis: {
      sentiment: String,
      topics: [
        {
          topic: String,
          confidence: Number,
        },
      ],
      keywords: [String],
      suggestedHashtags: [String],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: Date,
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
