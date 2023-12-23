import { Router } from "express"
import { signup,verifyOtp,login } from "../controllers/InstructorController.js"
const router = Router()


router.post("/signup",signup)
router.post("/login",login)
router.post("/verify-otp",verifyOtp)




export default router