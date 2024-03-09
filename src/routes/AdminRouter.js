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
  editCategory,
  addCategory,
  listCategory,
  unlistCategory,
  getAllLanguage,
  editLanguage,
  addLanguage,
  listLanguage,
  unlistLanguage,
  addLevel,
  editLevel,
  getAllLevel,
  listLevel,
  unlistLevel,
  adminDashBoard,
  approveCourse,
  rejectCourse,
} from "../controllers/AdminController.js";
const router = Router();

router.post("/login", login);

router.get("/student-list", getAllStudent);
router.get("/instructor-list", getAllInstructor);

router.get("/course-list", getAllCourses);
//block
router.patch("/block-student", blockStudent);
router.patch("/unblock-student", unblockStudent);

router.patch("/block-instructor", blockInstructor);
router.patch("/unblock-instructor", unblockInstructor);

//CATEGORY
router.get("/categories", getAllCategory);
router.patch("/edit-category", editCategory);
router.post("/add-category", addCategory);
router.patch("/list-category", listCategory);
router.patch("/unlist-category", unlistCategory);

//LANGUAGES
router.get("/languages", getAllLanguage);
router.patch("/edit-language", editLanguage);
router.post("/add-language", addLanguage);
router.patch("/list-language", listLanguage);
router.patch("/unlist-language", unlistLanguage);

//LEVELS
router.get("/levels", getAllLevel);
router.patch("/edit-level", editLevel);
router.post("/add-level", addLevel);
router.patch("/list-level", listLevel);
router.patch("/unlist-level", unlistLevel);

router.get("/dashboard", adminDashBoard);

router.patch("/approve-course", approveCourse);
router.patch("/reject-course", rejectCourse);

export default router;
