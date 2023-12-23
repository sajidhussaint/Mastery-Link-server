import { Router } from "express"
import { signup, verifyStudent,login } from "../controllers/StudentController.js"
const router = Router()

router.post("/signup",signup)
router.post("/login",login)
router.post("/verify-otp",verifyStudent)


export default router
