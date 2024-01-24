import { Router } from "express"
import { signup, verifyStudent,login,getCourses } from "../controllers/StudentController.js"
const router = Router()

router.post("/signup",signup)
router.post("/login",login)
router.post("/verify-otp",verifyStudent)
router.get("/courses",getCourses)


export default router
