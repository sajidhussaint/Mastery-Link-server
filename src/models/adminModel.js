import mongoose from "mongoose"

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
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

adminSchema.statics.build = admin => {
  return new Admin(admin)
}

const Admin = mongoose.model("admin", adminSchema)

export { Admin }
