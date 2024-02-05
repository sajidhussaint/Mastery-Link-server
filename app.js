import express from "express";
import cors from "cors";
import { createServer } from "http";
import { io } from "./src/utils/SocketIo.js";
import studentRoute from "./src/routes/StudentRouter.js";
import adminRoute from "./src/routes/AdminRouter.js";
import instructorRoute from "./src/routes/InstructorRouter.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  })
);

const httpServer = createServer(app);
io.attach(httpServer);


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/", studentRoute);
app.use("/admin", adminRoute);
app.use("/instructor", instructorRoute);

export { httpServer };
