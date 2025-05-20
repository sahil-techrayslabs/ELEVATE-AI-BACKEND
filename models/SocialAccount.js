import mongoose from "mongoose";

const socialAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      enum: ["linkedin", "twitter", "facebook"],
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: String,
    tokenExpiry: Date,
    profilePicture: String,
    followers: Number,
    following: Number,
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      autoPost: {
        type: Boolean,
        default: false,
      },
      bestTimeToPost: {
        type: Boolean,
        default: true,
      },
      engagementNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const SocialAccount = mongoose.model("SocialAccount", socialAccountSchema);

export default SocialAccount;
