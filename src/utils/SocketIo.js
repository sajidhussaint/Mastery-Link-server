// src/services/socketService.ts
import { Server } from "socket.io";
import { createServer } from "http";
import { Chat } from "../models/chatModel.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    // origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const activeMembers = new Map();

io.on("connection", (socket) => {
  console.log(socket.client.conn.server.clientsCount, " user connected");

  // const connectedClientsCount = Object.keys(io.sockets.sockets).length;
  // console.log(connectedClientsCount, "connections");

  // Listen for chat messages
  socket.on("join-room", (data) => {
    console.log(data,'join room');
    socket.join(data.courseId);

    if (activeMembers.has(data.courseId)) {
      activeMembers.set(data.courseId, activeMembers.get(data.courseId) + 1);
    } else {
      activeMembers.set(data.courseId, 1);
    }

    io.to(data.courseId).emit("active-members", {
      courseId: data.courseId,
      members: activeMembers.get(data.courseId),
    });
  });

  socket.on("get-all-messages", async ({ courseId }) => {
    const messages = await Chat.findOne({ courseId });
    console.log(messages,'message founded');

    io.to(courseId).emit("get-course-response", messages);
  });

  socket.on("message", async (data) => {
    const { courseId, message } = data;

    const existChat = await Chat.findOne({ courseId });

    if (existChat) {
      const chat = await Chat.findOne({ courseId });
      if (!chat) {
        throw new Error("Chat not found");
      }
      chat.messages?.push(message);
      await chat.save();
    } else {
      const chatDetails = {
        courseId,
        messages: [message],
      };
      const chatroom = Chat.build(chatDetails);
      await chatroom.save();
    }
    console.log(data, "data  emit");
    io.to(data.courseId).emit("messageResponse", data);
    // socket.emit("messageResponse", data);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected");
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) {
        if (activeMembers.has(room)) {
          activeMembers.set(room, activeMembers.get(room) - 1);
          io.to(room).emit("active-members", {
            courseId: room,
            count: activeMembers.get(room),
          });
        }
      }
    });
  });
});

const emitEvent = (eventData) => {
  io.emit(eventData.event, eventData.data);
};

httpServer.listen(4000, () => {
  console.log("Socket.IO listening on *:4000");
});

export { io, emitEvent };
