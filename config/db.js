import mongoose from "mongoose"

export default async function() {
  await mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Database connected...")
    })
    .catch(err => {
      console.log("Database connection failed...", err.message)
    })
}