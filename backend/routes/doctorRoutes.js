// routes/doctorRoutes.js
import express from "express";
import {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorCount,
} from "../controllers/doctorController.js";
import { doctorSignIn } from "../controllers/doctorAuthController.js";

const router = express.Router();

router.get("/", getDoctors);         // GET all doctors
router.get("/:id", getDoctor);       // GET doctor by ID
router.post("/", createDoctor);      // POST create doctor
router.put("/:id", updateDoctor);    // PUT update doctor
router.delete("/:id", deleteDoctor); // DELETE doctor

router.post("/login", doctorSignIn);

// Count for dashboard
router.get("/count/all", getDoctorCount);

export default router;
