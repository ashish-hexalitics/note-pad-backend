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
    socket.join(noteId); // Join the room for this note
    if (user._id && !onlineUsers.some((u) => u._id === user._id)) {
      onlineUsers.push({
        ...user,
        noteId,
        isOnline: true,
        socketId: socket.id,
      });
    }

    try {
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

      if (!noteResponse.ok) throw new Error("Failed to fetch note data");

      const collaborators = await noteResponse.json();
      io.to(noteId).emit("sentJoinedUsers", { collaborators, onlineUsers }); // Emit only to this note room
    } catch (error) {
      console.error("Error fetching note:", error.message);
    }
  });

  socket.on("updateNoteContent", async (data) => {
    if (!data._id || !data.content || !data.noteId || !data.token) {
      console.error("Invalid data received for note update");
      return;
    }

    if (!messagging.some((u) => u.userId === data._id)) {
      messagging.push({
        message: `${data.name} is editing notes`,
        userId: data._id,
        name: data.name,
        content: data.content,
        noteId: data.noteId,
      });
    }

    try {
      const collaboratorResponse = await fetch(
        `http://localhost:8000/api/notes/collaborators/${data._id}`,
        {
          method: "PUT",
          body: JSON.stringify({ collaboratorContent: data.content }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      if (!collaboratorResponse.ok)
        throw new Error("Failed to update collaborator content");

      const noteResponse = await fetch(
        `http://localhost:8000/api/notes/${data.noteId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      if (!noteResponse.ok)
        throw new Error("Failed to fetch updated note data");

      const collaborators = await noteResponse.json();
      io.to(data.noteId).emit("noteContentUpdated", {
        messagging,
        collaborators,
        currentContent: data.content,
      });
    } catch (error) {
      console.error("Error updating note content:", error.message);
    }
  });

  socket.on("resetMesseging", () => {
    messagging = [];
    io.emit("resetMessegSuccess", messagging);
  });

  socket.on("removeCollaborators",(collaboratorId)=>{
    io.emit("removeCollaboratorsSuccess", collaboratorId);
  })

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("sentJoinedUsers", { onlineUsers }); // Update others on the user disconnect
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
