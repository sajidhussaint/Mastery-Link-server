import { Router } from "express";
import {
  signup,
  verifyOtp,
  login,
  getMycourses,
  addCourse,
  getSingleCourse,
  updateCourseImage,
  createModule,
  addChapter,
} from "../controllers/InstructorController.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/my-courses", getMycourses);
router.post("/add-course", addCourse);
router.get("/course/:courseId", getSingleCourse);

router.put("/add-course-image", upload.single("image"), updateCourseImage);

router.post("/create-module", upload.single("file"), createModule);
router.post("/add-chapter",upload.none(), addChapter);
export default router;
