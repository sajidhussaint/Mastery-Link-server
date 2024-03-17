import { Admin } from "../models/adminModel.js";
import { Student } from "../models/studentModel.js";
import { Instructor } from "../models/instructorModel.js";
import { Category } from "../models/categoryModel.js";
import { Course } from "../models/courseModel.js";
import { Language } from "../models/languageModel.js";
import { Level } from "../models/levelModel.js";
import { EnrolledCourse } from "../models/enrolledCourse.js";
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
      console.log("incorrect password");//TODO:fix incorrect pass
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

export const editCategory = async (req, res) => {
  try {
    const { categoryId, value } = req.body;
    if (categoryId) {
      await Category.findOneAndUpdate({ _id: categoryId }, { category: value });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const categoryData = Category.build({
      category,
    });
    await categoryData.save();
    res.status(201).send({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const course = await Course.find()
      .populate("category")
      .populate("language")
      .populate("level");

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

export const listCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (categoryId) {
      const listedCategory = await Category.findOneAndUpdate(
        { _id: categoryId },
        { status: true }
      );
      res.status(200).json({ category: listedCategory, success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unlistCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (categoryId) {
      const listedCategory = await Category.findOneAndUpdate(
        { _id: categoryId },
        { status: false }
      );
      res.status(200).json({ category: listedCategory, success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//languages

export const getAllLanguage = async (req, res) => {
  try {
    const language = await Language.find();

    console.log(language, "====this is language");
    res.status(200).json({ language });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editLanguage = async (req, res) => {
  try {
    const { languageId, value } = req.body;
    if (languageId) {
      await Language.findOneAndUpdate({ _id: languageId }, { language: value });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const languageData = Language.build({
      language,
    });
    await languageData.save();
    res.status(201).send({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listLanguage = async (req, res) => {
  try {
    const { languageId } = req.body;
    if (languageId) {
      const listedLanguage = await Language.findOneAndUpdate(
        { _id: languageId },
        { status: true }
      );
      res.status(200).json({ language: listedLanguage, success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unlistLanguage = async (req, res) => {
  try {
    const { languageId } = req.body;
    if (languageId) {
      const listedCategory = await Language.findOneAndUpdate(
        { _id: languageId },
        { status: false }
      );
      res.status(200).json({ language: listedCategory, success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//levels

export const getAllLevel = async (req, res) => {
  try {
    const level = await Level.find();

    res.status(200).json({ level });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editLevel = async (req, res) => {
  try {
    const { levelId, value } = req.body;
    if (levelId) {
      await Level.findOneAndUpdate({ _id: levelId }, { level: value });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addLevel = async (req, res) => {
  try {
    const { level } = req.body;
    const levelData = Level.build({
      level,
    });
    await levelData.save();
    res.status(201).send({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listLevel = async (req, res) => {
  try {
    const { levelId } = req.body;
    if (levelId) {
      const listedLevel = await Level.findOneAndUpdate(
        { _id: levelId },
        { status: true }
      );
      res.status(200).json({ language: listedLevel, success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unlistLevel = async (req, res) => {
  try {
    const { levelId } = req.body;
    if (levelId) {
      const listedLevel = await Level.findOneAndUpdate(
        { _id: levelId },
        { status: false }
      );
      res.status(200).json({ level: listedLevel, success: true });
    } else {
      res.status(400).json({ message: "Invalid Id" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminDashBoard = async (req, res) => {
  try {
    const enrolledCountByCategoryAndDate = await EnrolledCourse.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $group: {
          _id: {
            category: "$course.category",
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
          },
          enrolledCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          data: {
            $push: {
              date: "$_id.date",
              enrolledCount: "$enrolledCount",
            },
          },
        },
      },
      {
        $project: {
          category: "$_id",
          data: 1,
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
    ]);

    let totalRevenue = 0;
    const totalRevenueResult = await EnrolledCourse.aggregate([
      {
        $match: {
          status: true, // Assuming you want to consider only enrolled courses with status true
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
        },
      },
    ]);
    if (totalRevenueResult.length > 0) {
      totalRevenue = totalRevenueResult[0].totalRevenue;
    }

    const instructorCount = await Instructor.countDocuments();
    const studentCount = await Student.countDocuments();
    const courseCount = await Course.countDocuments();

    res.status(200).json({
      enrolledCountByCategoryAndDate,
      totalRevenue,
      instructorCount,
      studentCount,
      courseCount,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const approveCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      res.status(400).json({ message: "Course Id not found" });
    }
    const course = await Course.findById(courseId);
    course.set({
      approval: "approved",
    });
    await course.save();
    res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      res.status(400).json({ message: "Course Id not found" });
    }
    const course = await Course.findById(courseId);
    course.set({
      approval: "rejected",
    });
    await course.save();
    res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
