const express = require("express");
const notesController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, notesController.createNote); // Create a note
router.get("/user/:userId", authMiddleware, notesController.getNotesByUserId); // Get note by user id
router.get(
  "/collaborator/:collaboratorId",
  authMiddleware,
  notesController.getNotesByCollaboratorId
); // get  notes  bycollaboratorid

router.get("/:noteId", authMiddleware, notesController.getNote); // Get note by ID
router.put("/:noteId", authMiddleware, notesController.updateNote); // Update a note
router.post(
  "/collaborators/:noteId",
  authMiddleware,
  notesController.updateAndCreateNoteCollaborators
);

// Update a note collaborators
router.delete("/:noteId", authMiddleware, notesController.deleteNote); // Delete a note

module.exports = router;
