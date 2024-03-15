import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    chapters: [
      {
        chapter: { type: String },
        seconds: { type: Number },
        duration: { type: String },
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

moduleSchema.statics.build = (module) => {
  return new Module(module);
};

const Module = mongoose.model("module", moduleSchema);

export { Module };
