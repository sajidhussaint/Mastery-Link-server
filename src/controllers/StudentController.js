import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Otp } from "../models/otpModel.js";
import { Student } from "../models/studentModel.js";
import { Course } from "../models/courseModel.js";

import { sendEmail } from "../utils/nodeMailer.js";

export const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, mobile } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = Student.build({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      mobile,
    });
    await student.save();
    await sendEmail(email);
    res.status(201).send({ message: "OTP generated", email });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyStudent = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const savedOtp = await Otp.findOne({ email });
    if (otp === savedOtp?.otp) {
      const student = await Student.findOne({ email });
      student.set({ isVerified: true });
      await student.save();
      const studentJwt = jwt.sign(
        {
          studentId: student.id,
          role: "student",
        },
        process.env.JWT_KEY
      );
      const studentDetails = {
        _id: student.id,
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        mobile: student.mobile,
        wallet: student.wallet,
        courses: student.courses,
        image: student.image,
        role: "student",
      };
      res.status(200).json({
        message: "Student Verified",
        token: studentJwt,
        student: studentDetails,
      });
    } else {
      res.status(400).send({ message: "Otp Verification Failed" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(password);
    const student = await Student.findOne({ email });
    console.log(student, "stdent=======");
    if (!student?.isBlocked) {
      const validPassword = await bcrypt.compare(password, student.password);
      if (validPassword) {
        if (student.isVerified) {
          const studentJwt = jwt.sign(
            {
              studentId: student.id,
              role: "student",
            },
            process.env.JWT_KEY
          );
          const studentDetails = {
            _id: student.id,
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            mobile: student.mobile,
            wallet: student.wallet,
            courses: student.courses,
            image: student.image,
            role: "student",
          };
          res.status(200).json({
            message: "Student signed in",
            token: studentJwt,
            student: studentDetails,
            success: true,
          });
        } else {
          await sendEmail(email);
          console.log("Not verified");
        }
      } else {
        console.log("Incorrect password");
      }
    } else {
      console.log("Student Blocked");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate("category")
      .populate("level")
      .populate("language");
    res.status(200).json(courses);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
