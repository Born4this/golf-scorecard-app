const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const http = require("http");
const server = http.createServer(app);

// ✅ Allow both Vercel and your custom domain
const allowedOrigins = [
  "https://golf-scorecard-app.vercel.app",
  "https://yourcustomdomain.com" // 👈 Replace with your real domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  })
);

app.use(express.json());

// ⚡ Setup Socket.io with CORS fix
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});

// 🟢 Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// 🛣️ Register routes
const userRoutes = require("./routes/users");
const groupRoutes = require("./routes/groups");
const scoreRoutes = require("./routes/scores")(io); // pass socket.io

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/scores", scoreRoutes);

// ⚡ Handle Socket.io events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// 🟢 Start the server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
