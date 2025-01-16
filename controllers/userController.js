import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Public (Change to Private if authentication is required)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    // Check for invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, error: "Invalid User ID" });
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide all required fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists with this email" });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      password, // Note: In a real application, make sure to hash passwords before saving
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update an existing user
// @route   PUT /api/users/:id
// @access  Public
export const updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Find user by ID
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;

    // Save updates
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    // Check for invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, error: "Invalid User ID" });
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Public
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await user.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    // Check for invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, error: "Invalid User ID" });
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
