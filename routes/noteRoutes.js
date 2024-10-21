const express = require("express");
const notesController = require("../controllers/noteController");
// const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", notesController.createNote); // Create a note
router.get("/:noteId", notesController.getNote); // Get note by ID
router.get("/shared/:sharedLink", notesController.getNoteByLink); // Get note by shared link
router.put("/:noteId", notesController.updateNote); // Update a note
router.delete("/:noteId", notesController.deleteNote); // Delete a note

module.exports = router;
