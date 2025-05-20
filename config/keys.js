import dotenv from "dotenv";

dotenv.config();

export const keys = {
  jwtSecret: process.env.JWT_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  // Add other keys as needed
};
