import { Course } from "../models/courseModel.js";
import { EnrolledCourse } from "../models/enrolledCourse.js";
import Stripe from "stripe";

export const stripePayment = async (courseId, studentId) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const course = await Course.findById(courseId);
  const existingEnrollment = await EnrolledCourse.findOne({
    studentId,
    courseId,
  });
  if (existingEnrollment) {
    res.status(400).send({ message: "Already enrolled" });
  }
  if (!course) {
    res.status(400).send({ message: "Course not found" });
  }
  const payment = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: course.name,
          },
          unit_amount: course.price * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/status?success=true&courseId=${courseId}`,
    cancel_url: `${process.env.CLIENT_URL}/status`,
  });

  return payment.url;
};
