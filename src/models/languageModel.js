import mongoose from "mongoose"

const languageSchema = new mongoose.Schema(
  {
    language: {
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

languageSchema.statics.build = language => {
  return new Language(language)
}

const Language = mongoose.model("language", languageSchema)

export { Language }
