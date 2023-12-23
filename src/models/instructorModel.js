import mongoose from "mongoose"

const instructorSchema = new mongoose.Schema(
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
    qualification: {
      type: String
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    wallet: {
      type: Number,
      default: 0
    },
    walletHistory: [
      {
        date: {
          type: Date
        },
        amount: {
          type: Number
        },
        description: {
          type: String
        }
      }
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
      }
    ]
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

instructorSchema.statics.build = instructor => {
  return new Instructor(instructor)
}

const Instructor = mongoose.model("instructor", instructorSchema)

export { Instructor }
