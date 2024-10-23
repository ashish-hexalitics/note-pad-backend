const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const dotenv = require("dotenv");
dotenv.config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");

app.use(require("cors")());
app.use(express.json());

const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust this to your client URL or leave it open for testing
    methods: ["GET", "POST"],
  },
});

let collaborators = {}; // Store active viewers per noteId

// When a user connects
io.on("connection", (socket) => {
  console.log(socket.id, "New client connected");

  let onlineUsers = [];
  let messagging = [];

  socket.on("joinNote", async ({ noteId, user }) => {
    user._id &&
      !onlineUsers.some((u) => u._id === user._id) &&
      onlineUsers.push({
        ...user,
        noteId,
        isOnline: true,
        socketId: socket.id,
      });
    const noteResponse = await fetch(
      `http://localhost:8000/api/notes/${noteId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    const collaborators = await noteResponse.json();

    io.emit("sentJoinedUsers", { collaborators, onlineUsers });
  });

  socket.on("updateNoteContent", async (data) => {
    // Check if user is not already in the 'messagging' list and add them
    if (data._id && !messagging.some((u) => u.userId === data._id)) {
      messagging.push({
        message: `${data.name} is editing notes`,
        userId: data._id,
        content: data.content,
        noteId: data.noteId,
      });
    }

    try {
      // Send collaborator content to backend for update
      const collaboratorResponse = await fetch(
        `http://localhost:8000/api/notes/collaborators/${data._id}`,
        {
          method: "PUT",
          body: JSON.stringify({ collaboratorContent: data.content }), // Properly format the body
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`, // Include the authorization token
          },
        }
      );

      if (!collaboratorResponse.ok) {
        throw new Error("Failed to update collaborator content");
      }

      // Fetch the updated collaborators
      const noteResponse = await fetch(
        `http://localhost:8000/api/notes/${data.noteId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`, // Include the authorization token
          },
        }
      );

      if (!noteResponse.ok) {
        throw new Error("Failed to fetch updated note data");
      }

      const collaborators = await noteResponse.json();

      // Emit updated note content and collaborators to all clients
      io.emit("noteContentUpdated", { messagging, collaborators });
    } catch (error) {
      console.error("Error updating note content:", error.message);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notes", noteRoutes);

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
