import { Router } from "express";
import {
  login,
  getAllStudent,
  getAllInstructor,
  getAllCategory,
  getAllCourses,
  blockStudent,
  unblockStudent,
  blockInstructor,
  unblockInstructor,
} from "../controllers/AdminController.js";
const router = Router();

router.post("/login", login);

router.get("/student-list", getAllStudent);
router.get("/instructor-list", getAllInstructor);
router.get("/category-list", getAllCategory);
router.get("/course-list", getAllCourses);
//block
router.patch("/block-student", blockStudent);
router.patch("/unblock-student", unblockStudent);

router.patch("/block-instructor", blockInstructor);
router.patch("/unblock-instructor", unblockInstructor);








export default router;
