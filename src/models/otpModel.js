import mongoose from "mongoose"

const OTP_EXPIRY_TIME = 10

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
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

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: OTP_EXPIRY_TIME })

otpSchema.statics.build = otp => {
  return new Otp(otp)
}

const Otp = mongoose.model("otp", otpSchema)

export { Otp }
