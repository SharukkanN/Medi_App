import express from "express";
import { signIn, validateToken } from "../controllers/authController.js";

const router = express.Router();

// Sign In
router.post("/signin", signIn);

// Validate Token
router.get("/validate", validateToken);

export default router;
