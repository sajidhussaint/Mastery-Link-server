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
  editCategory,addCategory,
  listCategory,
  unlistCategory
} from "../controllers/AdminController.js";
const router = Router();

router.post("/login", login);

router.get("/student-list", getAllStudent);
router.get("/instructor-list", getAllInstructor);
router.get("/category-list", getAllCategory);
router.patch("/category-list", editCategory);
router.post("/category-list", addCategory);
router.get("/course-list", getAllCourses);
//block
router.patch("/block-student", blockStudent);
router.patch("/unblock-student", unblockStudent);

router.patch("/block-instructor", blockInstructor);
router.patch("/unblock-instructor", unblockInstructor);


router.patch("/list-category",listCategory);
router.patch("/unlist-category",unlistCategory);








export default router;
