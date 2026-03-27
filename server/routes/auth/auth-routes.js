const express = require("express");
const router = express.Router();
const { register } = require("../../controller/auth/register");
const { login, logout } = require("../../controller/auth/login");
const { forgotPassword, resetPassword } = require("../../controller/auth/password-controller");
const { getAllUsers, deleteUser, updateUser, createUser, approveUser, toggleApiAccess, updateUserFilters, clearUserSessions } = require("../../controller/auth/user-controller");
const authMiddleware = require("../../middleware/auth-middleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes (Only accessible with valid token)
router.post("/logout", authMiddleware, logout);
router.get("/users", authMiddleware, getAllUsers);
router.post("/users", authMiddleware, createUser);
router.delete("/users/:id", authMiddleware, deleteUser);
router.put("/users/:id", authMiddleware, updateUser);
router.put("/users/approve/:id", authMiddleware, approveUser);
router.put("/users/toggle-api/:id", authMiddleware, toggleApiAccess);
router.put("/users/update-filters/:id", authMiddleware, updateUserFilters);
router.put("/users/clear-sessions/:id", authMiddleware, clearUserSessions);

module.exports = router;