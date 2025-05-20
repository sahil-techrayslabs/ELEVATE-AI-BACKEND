import Post from "../models/Post.js";
import Engagement from "../models/Engagement.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const post = await Post.create(req.body);
  res.status(201).json({ success: true, data: post });
});

// @desc    Get all posts for a user
// @route   GET /api/posts
// @access  Private
export const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate("user", "name email");
  res.status(200).json({ success: true, count: posts.length, data: posts });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: post });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns post
  if (post.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this post`,
        401
      )
    );
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: post });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns post
  if (post.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this post`,
        401
      )
    );
  }

  await post.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Schedule post
// @route   POST /api/posts/:id/schedule
// @access  Private
export const schedulePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  if (post.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to schedule this post`,
        401
      )
    );
  }

  post.status = "scheduled";
  post.publishedAt = req.body.publishedAt;
  await post.save();

  res.status(200).json({ success: true, data: post });
});

// @desc    Get post engagement metrics
// @route   GET /api/posts/:id/engagement
// @access  Private
export const getPostEngagement = asyncHandler(async (req, res, next) => {
  const engagement = await Engagement.findOne({ post: req.params.id });
  if (!engagement) {
    return next(
      new ErrorResponse(
        `No engagement data found for post ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({ success: true, data: engagement });
});

// @desc    Update post engagement metrics
// @route   PUT /api/posts/:id/engagement
// @access  Private
export const updatePostEngagement = asyncHandler(async (req, res, next) => {
  let engagement = await Engagement.findOne({ post: req.params.id });

  if (!engagement) {
    req.body.post = req.params.id;
    engagement = await Engagement.create(req.body);
  } else {
    engagement = await Engagement.findOneAndUpdate(
      { post: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({ success: true, data: engagement });
});
