// routes/userRoutes.js
import express from "express";
import {
  addUser,
  fetchUsers,
  fetchUser,
  editUser,
  removeUser,
  getUsersCount,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", addUser);
router.get("/", fetchUsers);
router.get("/:id", fetchUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);
router.get("/count/all", getUsersCount);

export default router;
