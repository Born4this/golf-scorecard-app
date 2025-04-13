const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const http = require("http");
const server = http.createServer(app);

// ✅ Fix CORS to match deployed frontend exactly
app.use(
  cors({
    origin: "https://golf-scorecard-app.vercel.app", // MUST match your frontend URL
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  })
);

app.use(express.json());

// ⚡ Set up Socket.io server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://golf-scorecard-app.vercel.app", // Match frontend again here for Socket.io
    methods: ["GET", "POST", "PATCH"]
  }
});

// 🟢 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// 🛣️ Import and register routes
const userRoutes = require("./routes/users");
const groupRoutes = require("./routes/groups");
const scoreRoutes = require("./routes/scores")(io); // 👈 pass socket.io to scores

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/scores", scoreRoutes);

// ⚡ Handle socket events
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
