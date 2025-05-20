import OpenAI from "openai";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import Template from "../models/Template.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate a social media post
export const generatePost = async (req, res) => {
  try {
    const { topic, tone, platform, length, keywords } = req.body;

    // Construct the prompt based on the input parameters
    const prompt = `Generate a ${length} ${tone} social media post for ${platform} about ${topic}${
      keywords ? ` using these keywords: ${keywords}` : ""
    }. The post should be engaging and optimized for the platform.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional social media manager. Generate engaging posts that are optimized for the specified platform. The tone should be ${tone} and the length should be ${length}.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedPost = completion.choices[0].message.content;

    res.json({ post: generatedPost });
  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({ error: "Failed to generate post" });
  }
};

// @desc    Generate hashtags for a post
// @route   POST /api/ai/generate-hashtags
// @access  Private
export const generateHashtags = asyncHandler(async (req, res, next) => {
  const { content, platform } = req.body;

  const prompt = `Generate relevant hashtags for the following ${platform} post content: "${content}". 
  Return only the hashtags separated by commas, without any additional text.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  const hashtags = completion.choices[0].message.content
    .split(",")
    .map((tag) => tag.trim());
  res.status(200).json({ success: true, data: hashtags });
});

// @desc    Generate caption for a post
// @route   POST /api/ai/generate-caption
// @access  Private
export const generateCaption = asyncHandler(async (req, res, next) => {
  const { content, platform, tone } = req.body;

  const prompt = `Generate an engaging ${tone} caption for the following ${platform} post content: "${content}". 
  The caption should be optimized for ${platform} and include relevant emojis where appropriate.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  res.status(200).json({
    success: true,
    data: completion.choices[0].message.content,
  });
});

// @desc    Generate comment responses
// @route   POST /api/ai/generate-comment
// @access  Private
export const generateComment = asyncHandler(async (req, res, next) => {
  const { postContent, commentContext, tone } = req.body;

  const prompt = `Generate a ${tone} response to the following comment on this post: "${postContent}"
  Comment context: "${commentContext}"
  The response should be engaging and appropriate for the platform.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  res.status(200).json({
    success: true,
    data: completion.choices[0].message.content,
  });
});

// @desc    Get AI content suggestions
// @route   POST /api/ai/content-suggestions
// @access  Private
export const getContentSuggestions = asyncHandler(async (req, res, next) => {
  const { platform, industry, targetAudience } = req.body;

  const prompt = `Generate 5 content ideas for ${platform} posts targeting ${targetAudience} in the ${industry} industry.
  Each suggestion should include a title and brief description.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  res.status(200).json({
    success: true,
    data: completion.choices[0].message.content,
  });
});

// @desc    Analyze post performance
// @route   POST /api/ai/analyze-performance
// @access  Private
export const analyzePostPerformance = asyncHandler(async (req, res, next) => {
  const { postContent, engagementMetrics } = req.body;

  const prompt = `Analyze the following social media post and its engagement metrics:
  Post content: "${postContent}"
  Engagement metrics: ${JSON.stringify(engagementMetrics)}
  Provide insights on performance and suggestions for improvement.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  res.status(200).json({
    success: true,
    data: completion.choices[0].message.content,
  });
});
