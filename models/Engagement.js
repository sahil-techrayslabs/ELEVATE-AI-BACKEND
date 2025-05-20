import mongoose from "mongoose";

const engagementSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    platform: {
      type: String,
      enum: ["linkedin", "twitter", "facebook"],
      required: true,
    },
    metrics: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
    },
    comments: [
      {
        user: String,
        content: String,
        timestamp: Date,
        sentiment: String,
      },
    ],
    analytics: {
      bestPerformingTime: Date,
      audienceDemographics: {
        age: Object,
        gender: Object,
        location: Object,
      },
      topEngagers: [
        {
          user: String,
          engagementCount: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

const Engagement = mongoose.model("Engagement", engagementSchema);

export default Engagement;
