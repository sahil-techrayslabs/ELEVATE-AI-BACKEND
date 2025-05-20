import mongoose from "mongoose";

const aiDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postContent: {
      type: String,
      required: true,
    },
    generatedComment: {
      type: String,
      required: true,
    },
    analysis: {
      sentiment: String,
      engagement: {
        likes: Number,
        comments: Number,
        shares: Number,
      },
      topics: [
        {
          topic: String,
          count: Number,
        },
      ],
      trends: [
        {
          date: String,
          engagement: Number,
        },
      ],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AiData = mongoose.model("AiData", aiDataSchema);

export default AiData;
