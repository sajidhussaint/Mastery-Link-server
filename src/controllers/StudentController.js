import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Otp } from "../models/otpModel.js";
import { Student } from "../models/studentModel.js";
import { Course } from "../models/courseModel.js";
import { Instructor } from "../models/instructorModel.js";
import { Category } from "../models/categoryModel.js";

import { sendEmail } from "../utils/nodeMailer.js";
import { stripePayment } from "../utils/StripePayment.js";
import { EnrolledCourse } from "../models/enrolledCourse.js";
const INSTRUCTOR_COURSE_PERCENTAGE = 70;

export const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, mobile } = req.body;
    const AlreadyStudent = await Student.findOne({ email });
    if (AlreadyStudent) {
      return res.status(401).json({ message: "Student Alredy Exist" });
    }
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
    const student = await Student.findOne({ email }).populate({
      path: "courses",
      model: "course",
      populate: [
        { path: "language", model: "language" },
        { path: "category", model: "category" },
      ],
    });
    if (!student) {
      return res.status(401).json({ message: "Invalid User Found" });
    }

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
            createdAt: student.createdAt,
          };

          res.status(200).json({
            message: "Student signed in",
            token: studentJwt,
            student: studentDetails,
            success: true,
          });
        } else {
          await sendEmail(email);
          return res.status(401).json({ message: "Not verified" });
        }
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      return res.status(401).json({ message: "Student Blocked" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCourses = async (req, res) => {
  try {
    const { category } = req.query;
    console.log(category,'cat');

    const categories = await Category.find({ status: true });

    if (category == "undefined") {
      const courses = await Course.find({})
        .populate("category")
        .populate("level")
        .populate("language");
        
      res.status(200).json({
        courses,
        categories,
      });
    } else {
      const courses = await Course.find({ category })
        .populate("category")
        .populate("level")
        .populate("language");
      res.status(200).json({
        courses,
        categories,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400);
    }
    const course = await Course.findById(courseId)
      .populate("instructor")
      .populate("level")
      .populate("category")
      .populate("language")
      .populate({
        path: "modules.module",
        model: "module",
      });
    res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const stripePaymentIntent = async (req, res) => {
  try {
    console.log("running stripe");
    const { courseId, studentId } = req.body;
    console.log(courseId, studentId);
    const url = await stripePayment(courseId, studentId);
    console.log("oooo");
    res.status(200).json(url);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const existingEnrollment = await EnrolledCourse.findOne({
      studentId,
      courseId,
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Course already enrolled" });
    }
    const course = await Course.findById(courseId);
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(400).json({ message: "Id not valid" });
    }
    student.courses?.push(courseId);
    await student.save();

    const enrolledCourse = EnrolledCourse.build({
      courseId,
      studentId,
      price: course?.price,
    });
    await enrolledCourse.save();
    const instructorAmount =
      (course.price * INSTRUCTOR_COURSE_PERCENTAGE) / 100;
    const description = `Enrollment fee from course ${course?.name} (ID: ${course?.id})`;

    if (course) {
      const instructor = await Instructor.findById(course.instructor);
      if (!instructor) {
        return res.status(400).json({ message: "Instructor not found" });
      }
      instructor.set({ wallet: (instructor.wallet ?? 0) + instructorAmount });
      await instructor.save();

      const walletHistoryDetails = {
        amount: instructorAmount,
        description,
        date: new Date(),
      };
      instructor.walletHistory?.push(walletHistoryDetails);
      await instructor.save();
    }

    res.status(201).json(enrolledCourse);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getEnrolledCourse = async (req, res) => {
  try {
    const { courseId, studentId } = req.query;

    const enrolledCourse = await EnrolledCourse.findOne({
      studentId,
      courseId,
    }).populate({
      path: "courseId",
      populate: {
        path: "modules.module",
        model: "module",
      },
    });
    res.status(200).json(enrolledCourse);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addNotes = async (req, res) => {
  try {
    const { enrolledId, notes } = req.body;
    console.log(enrolledId, notes, "sss");
    const course = await EnrolledCourse.findById(enrolledId);
    course?.notes?.push(notes);
    await course?.save();
    res.status(201).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { newPassword, currentPassword, studentId } = req.body;
    if (!studentId) {
      res.status(400).json({ message: "Invalid token" });
    }
    const student = await Student.findById(studentId);
    //TODO:handle invalid id

    const isPasswordVerified = await bcrypt.compare(
      currentPassword,
      student.password
    );

    if (!isPasswordVerified) {
      res.status(401).json({ meassage: "Incorrect password" });
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      student.set({
        password: hashedPassword,
      });
      await student.save();
      res.status(200).json(student);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, mobile, studentId } = req.body;
    const student = await Student.findById(studentId).populate({
      path: "courses",
      model: "course",
      populate: [
        { path: "language", model: "language" },
        { path: "category", model: "category" },
      ],
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" }); // Added return statement
    }
    student.set({
      firstname,
      lastname,
      mobile,
    });
    await student.save();
    res.status(200).json(student);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchCourses = async (req, res, next) => {
  try {
    const { search, category, level, language } = req.query;
    console.log(req.query);
    const inputs = {};

    if (search) {
      inputs.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      inputs.category = category;
    }
    if (level) {
      inputs.level = level;
    }
    if (language) {
      inputs.language = language;
    }

    const course = await Course.find({ approval: "approved", ...inputs })
      .populate("category")
      .populate("level");
    res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addProgression = async (req, res, next) => {
  try {
    const { enrollmentId, moduleId } = req.query;
    console.log(enrollmentId);
    const progression = await EnrolledCourse.findOne({
      courseId: enrollmentId,
    });
    if (!progression) {
      console.log("no progress");
      return res.status(400).json({ message: "Enrollment not found" });
    }
    if (!progression.progression?.includes(moduleId)) {
      progression.progression?.push(moduleId);
      await progression.save(); // Assuming progression is a Mongoose document instance
    }

    res.status(201).json(progression);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
