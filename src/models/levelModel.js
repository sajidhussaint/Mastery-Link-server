import mongoose from "mongoose"

const levelSchema = new mongoose.Schema(
  {
    level: {
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

levelSchema.statics.build = level => {
  return new Level(level)
}

const Level = mongoose.model("level", levelSchema)

export { Level }
