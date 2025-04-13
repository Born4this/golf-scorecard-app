const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const http = require("http");
const server = http.createServer(app);

app.use(cors({
  origin: "https://golf-scorecard.vercel.app"
}));


// ⚡ Set up Socket.io server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for now
    methods: ["GET", "POST", "PATCH"]
  }
});

app.use(cors());
app.use(express.json());

// 🟢 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// 🛣️ Import and register routes
const userRoutes = require("./routes/users");
const groupRoutes = require("./routes/groups");
const scoreRoutes = require("./routes/scores")(io); // 👈 call the function with io!

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/scores", scoreRoutes); // 👈 scoreRoutes is now a router instance

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
