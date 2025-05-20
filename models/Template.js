import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["comment", "caption", "hashtag"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    variables: [
      {
        name: String,
        description: String,
        required: Boolean,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["business", "personal", "marketing", "other"],
      default: "other",
    },
    tags: [String],
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

export default Template;
