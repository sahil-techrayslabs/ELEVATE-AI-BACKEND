import { OpenAI } from "openai";
import dotenv from "dotenv";
import AiData from "../models/AiData.js";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateCommentAI = async (postText, userId) => {
  try {
    const prompt = `Analyze this LinkedIn post and generate a relevant, engaging comment: "${postText}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    const comment = response.choices[0]?.message?.content.trim();

    // Store the generated comment
    await AiData.create({
      user: userId,
      postContent: postText,
      generatedComment: comment,
      status: "completed",
    });

    return comment;
  } catch (error) {
    console.error("Error generating AI comment:", error);
    throw new Error("Failed to generate AI comment");
  }
};

export const analyzePostContent = async (postText, userId) => {
  try {
    const prompt = `Analyze this LinkedIn post and provide:
    1. Overall sentiment (positive, negative, neutral)
    2. Main topics discussed
    3. Key engagement factors
    4. Content suggestions
    Post: "${postText}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const analysis = response.choices[0]?.message?.content;
    const parsedAnalysis = {
      sentiment: "Positive", // Extract from analysis
      topics: [
        { topic: "Technology", count: 1 },
        { topic: "Innovation", count: 1 },
      ],
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
      suggestions: analysis,
    };

    // Store analysis results
    await AiData.create({
      user: userId,
      postContent: postText,
      analysis: parsedAnalysis,
      status: "completed",
    });

    return parsedAnalysis;
  } catch (error) {
    console.error("Error analyzing post:", error);
    throw new Error("Failed to analyze post");
  }
};
