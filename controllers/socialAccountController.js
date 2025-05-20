import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import SocialAccount from "../models/SocialAccount.js";
import Post from "../models/Post.js";
import Engagement from "../models/Engagement.js";

// @desc    Connect a new social media account
// @route   POST /api/social-accounts
// @access  Private
export const connectAccount = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const account = await SocialAccount.create(req.body);
  res.status(201).json({ success: true, data: account });
});

// @desc    Get all connected accounts for a user
// @route   GET /api/social-accounts
// @access  Private
export const getAccounts = asyncHandler(async (req, res, next) => {
  const accounts = await SocialAccount.find({ user: req.user.id });
  res
    .status(200)
    .json({ success: true, count: accounts.length, data: accounts });
});

// @desc    Get account analytics
// @route   GET /api/social-accounts/:id/analytics
// @access  Private
export const getAccountAnalytics = asyncHandler(async (req, res, next) => {
  const account = await SocialAccount.findById(req.params.id);
  if (!account) {
    return next(
      new ErrorResponse(`Account not found with id of ${req.params.id}`, 404)
    );
  }

  // Get posts for this account
  const posts = await Post.find({
    user: req.user.id,
    platform: account.platform,
  });

  // Get engagement metrics
  const engagement = await Engagement.find({
    post: { $in: posts.map((post) => post._id) },
    platform: account.platform,
  });

  // Calculate analytics
  const analytics = {
    totalPosts: posts.length,
    totalEngagement: engagement.reduce((acc, curr) => {
      return (
        acc + curr.metrics.likes + curr.metrics.comments + curr.metrics.shares
      );
    }, 0),
    averageEngagementRate:
      engagement.reduce((acc, curr) => {
        return acc + curr.metrics.engagementRate;
      }, 0) / (engagement.length || 1),
    topPosts: posts
      .sort((a, b) => {
        const aEngagement = engagement.find(
          (e) => e.post.toString() === a._id.toString()
        );
        const bEngagement = engagement.find(
          (e) => e.post.toString() === b._id.toString()
        );
        return (
          (bEngagement?.metrics.engagementRate || 0) -
          (aEngagement?.metrics.engagementRate || 0)
        );
      })
      .slice(0, 5),
    audienceDemographics: engagement[0]?.analytics.audienceDemographics || {},
    bestPerformingTime: engagement[0]?.analytics.bestPerformingTime || null,
  };

  res.status(200).json({ success: true, data: analytics });
});

// @desc    Update account settings
// @route   PUT /api/social-accounts/:id/settings
// @access  Private
export const updateAccountSettings = asyncHandler(async (req, res, next) => {
  const account = await SocialAccount.findById(req.params.id);
  if (!account) {
    return next(
      new ErrorResponse(`Account not found with id of ${req.params.id}`, 404)
    );
  }

  if (account.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this account`,
        401
      )
    );
  }

  account.settings = { ...account.settings, ...req.body };
  await account.save();

  res.status(200).json({ success: true, data: account });
});

// @desc    Disconnect social media account
// @route   DELETE /api/social-accounts/:id
// @access  Private
export const disconnectAccount = asyncHandler(async (req, res, next) => {
  const account = await SocialAccount.findById(req.params.id);
  if (!account) {
    return next(
      new ErrorResponse(`Account not found with id of ${req.params.id}`, 404)
    );
  }

  if (account.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this account`,
        401
      )
    );
  }

  await account.remove();
  res.status(200).json({ success: true, data: {} });
});
