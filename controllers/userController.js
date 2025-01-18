import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { createCustomError } from "../errors/customError.js";

// custom user details
const customUserDetails = (user) => {
  const { _id, name, userName, email, photoURL, phone, role, isDeleted } = user;
  return { _id, name, userName, email, photoURL, phone, role, isDeleted };
};

// JWT token
const generateAuthToken = (userId) => {
  return jwt.sign({ _id: userId.toString() }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 * @param   {string} name - User's full name
 * @param   {string} userName - Unique username
 * @param   {string} email - User's email address
 * @param   {string} password - User's password (min 6 characters)
 * @param   {string} [phone] - User's phone number (optional)
 * @returns {object} User details and JWT token
 */
export const registerUser = asyncWrapper(async (req, res) => {
  const { name, userName, email, password, phone } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    if (existingUser.email === email) {
      throw createCustomError("User already exists with this email", 400);
    } else {
      throw createCustomError("Username is already taken", 400);
    }
  }

  const user = await User.create({
    name,
    userName,
    email,
    password,
    phone,
  });

  const token = generateAuthToken(user._id);
  const userDetails = customUserDetails(user);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: userDetails,
    token,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 * @param   {string} loginCred - Email, username, or phone number
 * @param   {string} password - User's password
 * @returns {object} User details and JWT token
 */
export const loginUser = asyncWrapper(async (req, res) => {
  const { loginCred, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: loginCred }, { userName: loginCred }, { phone: loginCred }],
  }).select("+password");

  if (!user) {
    throw createCustomError("User not found", 404);
  }

  if (!user.password) {
    throw createCustomError("Please login with Google", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createCustomError("Invalid credentials", 401);
  }

  const token = generateAuthToken(user._id);
  const userDetails = customUserDetails(user);
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: userDetails,
    token,
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 * @returns {object} Array of user objects
 */
export const getUsers = asyncWrapper(async (req, res) => {
  const users = await User.find({ isDeleted: false }).select("-password");
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 * @param   {string} id - User ID
 * @returns {object} User details
 */
export const getUserById = asyncWrapper(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).select("-password");

  if (!user) {
    throw createCustomError("User not found", 404);
  }

  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 * @param   {string} id - User ID
 * @param   {object} updateData - Data to update (name, email, phone, photoURL)
 * @returns {object} Updated user details
 */
export const updateUser = asyncWrapper(async (req, res) => {
  const { name, email, phone, photoURL } = req.body;

  const user = await User.findOne({ _id: req.params.id, isDeleted: false });

  if (!user) {
    throw createCustomError("User not found", 404);
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.photoURL = photoURL || user.photoURL;

  await user.save();

  res.status(200).json({ success: true, data: customUserDetails(user) });
});

/**
 * @desc    Soft delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 * @param   {string} id - User ID
 * @returns {object} Success message
 */
export const deleteUser = asyncWrapper(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false });

  if (!user) {
    throw createCustomError("User not found", 404);
  }

  user.isDeleted = true;
  await user.save();

  res.status(200).json({ success: true, message: "User deleted successfully" });
});

/**
 * @desc    Change user password
 * @route   PUT /api/users/:id/change-password
 * @access  Private
 * @param   {string} id - User ID
 * @param   {string} currentPassword - Current password
 * @param   {string} newPassword - New password
 * @returns {object} Success message
 */
export const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).select("+password");

  if (!user) {
    throw createCustomError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw createCustomError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
});
