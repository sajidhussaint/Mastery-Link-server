import mongoose from "mongoose";

const enrolledCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Boolean,
      default: true,
    },
    progression: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    notes: [
      {
        type: String,
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

enrolledCourseSchema.statics.build = (enrolledCourse) => {
  return new EnrolledCourse(enrolledCourse);
};

const EnrolledCourse = mongoose.model("enrolledCourse", enrolledCourseSchema);

export { EnrolledCourse };
