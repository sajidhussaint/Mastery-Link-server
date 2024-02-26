import mongoose from "mongoose"

const chatSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "course"
    },

    messages: [
      {
        firstname: {
          type: String,
          required: true
        },
        lastname: {
          type: String,
          required: true
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        message: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        isInstructor: {
          type: Boolean,
        },
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

chatSchema.statics.build = chat => {
  return new Chat(chat)
}

const Chat = mongoose.model("chat", chatSchema)

export { Chat }
