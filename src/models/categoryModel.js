import mongoose from "mongoose"

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: true
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

categorySchema.statics.build = category => {
  return new Category(category)
}

const Category = mongoose.model("category", categorySchema)

export { Category }
