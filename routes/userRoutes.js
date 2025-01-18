import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// POST /api/users - Create a new user
router.post("/register", registerUser);

// POST /api/users - login user
router.post("/login", loginUser);

// GET /api/users - Get all users
router.get("/", getUsers);

// GET /api/users/:id - Get a single user by ID
router.get("/:id", getUserById);

// PUT /api/users/:id - Update an existing user
router.put("/:id", updateUser);

// DELETE /api/users/:id - Delete a user
router.delete("/:id", deleteUser);

export default router;
