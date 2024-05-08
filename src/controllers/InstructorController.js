import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"

import { Instructor } from "../models/instructorModel.js";
import { EnrolledCourse } from "../models/enrolledCourse.js";
import { Module } from "../models/moduleModel.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { Otp } from "../models/otpModel.js";
import { Course } from "../models/courseModel.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../config/aws.config.js";
import { videoDuration } from "@numairawan/video-duration";
import { secondsToHMS } from "../utils/timeConverter.js";

export const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, mobile } = req.body;
    const AlreadyInstructor = await Instructor.findOne({ email });
    if (AlreadyInstructor) {
      return res.status(401).json({ message: "Instructor Alredy Exist" });
    }
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

    if (!instructor) {
      return res.status(401).json({ message: "Invalid User Found" });
    }
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
          return res.status(401).json({ message: "Not verified" });
        }
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      return res.status(401).json({ message: "Instructor Blocked" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMycourses = async (req, res) => {
  try {
    const { instructor } = req.query;
    const course = await Course.find({ instructor }).populate("category");

    res.status(200).json({ course });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const courseData = Course.build(req.body);

    await courseData.save();
    const instructor = await Instructor.findById(req.query.instructorId);
    instructor.courses?.push(courseData?._id);
    await instructor.save();
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
      .populate("language")
      .populate({
        path: "modules.module",
        model: "module",
      });

    const enrollments = await EnrolledCourse.find({ courseId }).populate(
      "studentId"
    );
    res.status(200).json({ course, enrollments });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCourseImage = async (req, res) => {
  try {
    const { courseId } = req.body;
    const file = req.file;
    if (!file) {
      res.status(404).json({ message: "file not found" });
    }
    const Singlecourse = await Course.findById(courseId);
    if (!Singlecourse) {
      res.status(404).json({ message: "course not found" });
    }
    // const sanitizedCourseName = course.name.replace(/\s/g, "_");
    // Replace spaces with underscores or any character
    // const sanitizedFileName = encodeURIComponent(file.originalname)
    // const key = `courses/${sanitizedCourseName}/image/${sanitizedFileName}`;

    const params = {
      Bucket: "masterylinks",
      Key: `${Date.now()}.jpg`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const filePath = `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;


    await s3.send(new PutObjectCommand(params));
    const courses = await Course.findById(courseId);
    courses.set({
      image: filePath,
    });
    await courses.save();
    const course = await Course.findById(courseId);
    res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createModule = async (req, res) => {
  try {
    const { name, description, courseId } = req.body;
    const file = req.file;
    const existingModule = await Course.findById(courseId);

    const order = (existingModule?.modules?.length || 0) + 1;
    const key = `courses/module/${name}/${file.originalname}`;
    const params = {
      Bucket: "masterylinks",
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const filePath = `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;
    await s3.send(new PutObjectCommand(params));
    console.log(filePath);
    const { seconds } = await videoDuration(filePath);
    const durationHMS = secondsToHMS(seconds);

    const moduleData = {
      name,
      description,
      courseId,
      module: filePath,
      duration: durationHMS,
    };
    const module = Module.build(moduleData);
    await module.save();
    const CourseData = await Course.findById(courseId);
    if (!CourseData) {
      res.status(404).json({ message: "course not found" });
    }
    CourseData?.modules?.push({ module: module.id, order: order });
    await CourseData.save();
    res.status(200).json(CourseData);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addChapter = async (req, res) => {
  try {
    const { moduleId, time, chapter } = req.body;
    const seconds = Number(time);
    const duration = secondsToHMS(seconds);
    const chapterDetails = {
      chapter,
      seconds,
      duration,
    };
    const module = await Module.findById(moduleId);
    module?.chapters?.push(chapterDetails);
    await module.save();

    res.status(200).json(module);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
