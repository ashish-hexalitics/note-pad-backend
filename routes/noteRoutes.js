const express = require("express");
const notesController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", notesController.createNote); // Create a note
router.get("/user/:userId", notesController.getNotesByUserId); // Get note by user id
router.get("/:noteId",authMiddleware, notesController.getNote); // Get note by ID
router.put("/:noteId", notesController.updateNote); // Update a note
router.post(
  "/collaborators/:noteId",
  authMiddleware,
  notesController.updateAndCreateNoteCollaborators
); // Update a note collaborators
router.delete("/:noteId", notesController.deleteNote); // Delete a note

module.exports = router;
