import { Router } from "express";
import {
  signup,
  verifyStudent,
  login,
  getCourses,
  getSingleCourse,
  stripePaymentIntent,
  enrollCourse
} from "../controllers/StudentController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyStudent);
router.get("/courses", getCourses);
router.get("/course/:courseId", getSingleCourse);
router.post("/create-payment-intent", stripePaymentIntent);
router.post("/create-payment",enrollCourse);

export default router;
