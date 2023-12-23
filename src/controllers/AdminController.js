import { Admin } from "../models/adminModel.js";
import { Student } from "../models/studentModel.js";
import { Instructor } from "../models/instructorModel.js";
import { Category } from "../models/categoryModel.js";
import { Course } from "../models/courseModel.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (admin.password === password) {
      const adminJwt = jwt.sign(
        {
          adminId: admin.id,
          role: "admin",
        },
        process.env.JWT_KEY
      );
      const adminDetails = {
        _id: admin.id,
        email: admin.email,
        role: "admin",
      };

      res.status(200).json({
        admin: adminDetails,
        message: "Admin signed in",
        token: adminJwt,
        success: true,
      });
    } else {
      console.log("incorrect password");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllStudent = async (req, res) => {
  try {
    const student = await Student.find();
    res.status(200).json({ student });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.find();
    res.status(200).json({ instructor });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCategory = async (req, res) => {
  try {
    const category = await Category.find();
    res.status(200).json({ category });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const course = await Course.find().populate("category")
    // .populate("language");
    console.log(course);
    res.status(200).json({ course });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const blockStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (studentId) {
      await Student.findOneAndUpdate({ _id: studentId }, { isBlocked: true });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unblockStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (studentId) {
      await Student.findOneAndUpdate({ _id: studentId }, { isBlocked: false });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const blockInstructor = async (req, res) => {
  try {
    const { instructorId } = req.body;
    if (instructorId) {
      await Instructor.findOneAndUpdate(
        { _id: instructorId },
        { isBlocked: true }
      );
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unblockInstructor = async (req, res) => {
  try {
    const { instructorId } = req.body;
    if (instructorId) {
      await Instructor.findOneAndUpdate(
        { _id: instructorId },
        { isBlocked: false }
      );
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
