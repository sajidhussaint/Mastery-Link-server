import mongoose from "mongoose"

const studentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    mobile: {
      type: Number,
      required: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    wallet: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      }
    }
  }
)

studentSchema.statics.build = student => {
  return new Student(student)
}

const Student = mongoose.model("student", studentSchema)

export { Student }
