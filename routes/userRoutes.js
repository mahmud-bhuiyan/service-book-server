const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const router = express.Router();

// GET /api/users - Get all users
router.get("/", getUsers);

// GET /api/users/:id - Get a single user by ID
router.get("/:id", getUserById);

// POST /api/users - Create a new user
router.post("/", createUser);

// PUT /api/users/:id - Update an existing user
router.put("/:id", updateUser);

// DELETE /api/users/:id - Delete a user
router.delete("/:id", deleteUser);

module.exports = router;
