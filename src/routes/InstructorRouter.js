import { Router } from "express"
import { signup,verifyOtp,login,getMycourses,addCourse } from "../controllers/InstructorController.js"
const router = Router()


router.post("/signup",signup)
router.post("/login",login)
router.post("/verify-otp",verifyOtp)
router.get("/my-courses",getMycourses)
router.post("/add-course",addCourse)




export default router