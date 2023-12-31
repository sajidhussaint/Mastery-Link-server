import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Instructor } from "../models/instructorModel.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { Otp } from "../models/otpModel.js";
import { Course } from "../models/courseModel.js";

export const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, mobile } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const InstructorData = Instructor.build({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      mobile,
    });
    await InstructorData.save();
    await sendEmail(email);
    res.status(201).send({ message: "OTP generated", email });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error..." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const savedOtp = await Otp.findOne({ email });
    if (otp == savedOtp?.otp) {
      const instructor = await Instructor.findOne({ email });
      instructor.set({ isVerified: true });
      await instructor.save();

      const instructorJwt = jwt.sign(
        {
          instructorId: instructor.id,
          role: "instructor",
        },
        process.env.JWT_KEY
      );
      const instructorDetails = {
        _id: instructor.id,
        firstname: instructor.firstname,
        lastname: instructor.lastname,
        email: instructor.email,
        mobile: instructor.mobile,
        wallet: instructor.wallet,
        courses: instructor.courses,
        role: "instructor",
      };
      res.status(200).json({
        messge: "Instructor verfied",
        token: instructorJwt,
        instructor: instructorDetails,
      });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const instructor = await Instructor.findOne({ email });
    console.log(instructor, "instru=======");
    if (!instructor?.isBlocked) {
      const validPassword = await bcrypt.compare(password, instructor.password);
      if (validPassword) {
        if (instructor.isVerified) {
          const instructorJwt = jwt.sign(
            {
              instructorId: instructor.id,
              role: "instructor",
            },
            process.env.JWT_KEY
          );
          const instructorDetails = {
            _id: instructor.id,
            firstname: instructor.firstname,
            lastname: instructor.lastname,
            email: instructor.email,
            mobile: instructor.mobile,
            wallet: instructor.wallet,
            courses: instructor.courses,
            image: instructor.image,
            walletHistory: instructor.walletHistory,
            role: "instructor",
          };
          req.instructor = instructor.id;
          res.status(200).json({
            message: "instructor signed in",
            token: instructorJwt,
            instructor: instructorDetails,
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

export const getMycourses = async (req, res) => {
  try {
    const course = await Course.find().populate("category");
    console.log(course);
    res.status(200).json({ course });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { name, description, level, language, category, price, instructor } =
      req.body;
    const courseData = Course.build(req.body);
    await courseData.save();
    res.status(200).json(courseData);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400);
    }
    const course = await Course.findById(courseId)
      .populate("instructor")
      .populate("level")
      .populate("category")
      .populate("language");
    // .populate({
    //   path: "modules.module",
    //   model: "module",
    // });
    res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
