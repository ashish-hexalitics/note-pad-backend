const Notes = require("../models/Notes");
const { generateShareableLink } = require("../utils");

// Create a note
exports.createNote = async (req, res) => {
  const { title, content, owner } = req.body;
  try {
    const newNote = new Notes({
      content,
      title,
      owner,
      sharedLink: generateShareableLink(),
    });
    await newNote.save();
    res.status(201).json({ data: newNote });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};

// Get a note by ID
exports.getNote = async (req, res) => {
  const { noteId } = req.params;
  try {
    const note = await Notes.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ data: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};

// Get a note by shareable link
exports.getNoteByLink = async (req, res) => {
  const { sharedLink } = req.params;
  try {
    const note = await Notes.findOne({ sharedLink });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ data: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { content, collaborators } = req.body;
  try {
    const note = await Notes.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update note content or collaborators
    if (content) note.content = content;
    if (collaborators) note.collaborators = collaborators;

    await note.save();
    res.status(200).json({ data: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  const { noteId } = req.params;
  try {
    const note = await Notes.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await note.remove();
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};
