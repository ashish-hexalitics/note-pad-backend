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
  console.log("New client connected");

  socket.on("joinNote", async ({ noteId, user }) => {
    console.log('aya')
    try {
      // Call the API to add the user as a collaborator
      const addCollaboratorResponse = await fetch(
        `http://localhost:8000/api/notes/collaborators/${noteId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const addCollaboratorResult = await addCollaboratorResponse.json();

      if (addCollaboratorResponse.ok) {
        // Fetch the updated note with its collaborators
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

        const noteResult = await noteResponse.json();

        if (noteResponse.ok) {
          // Emit the updated note's collaborators to all users in the room
          io.to(noteId).emit("updateCollaborators", noteResult);
          // Join the user to the room specific to the note
        //   socket.broadcast.emit("updateCollaborators", noteResult);
          socket.join(noteId);
          console.log(`${user.name} joined note: ${noteId}`);
        } else {
          console.log("Error fetching note details:", noteResult.message);
        }
      } else {
        console.log(
          "Error adding collaborator:",
          addCollaboratorResult.message
        );
      }
    } catch (error) {
      console.error("Error while adding collaborator:", error.message);
    }
  });

  socket.on('updateNoteContent', ({data}) => {
    const noteId = data._id
    io.to(noteId).emit('noteContentUpdated', { data });
    socket.join(noteId);
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
