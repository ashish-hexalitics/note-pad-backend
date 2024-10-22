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
      sharedLink: "",
    });
    newNote.sharedLink = `/user/invitaion-note/${newNote._id}`;
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
    // Check if the note exists
    const isNote = await Notes.findById(noteId);
    if (!isNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update note content or collaborators if provided
    const updatedData = {
      content: content || isNote.content,
      collaborators: collaborators || isNote.collaborators,
    };

    // Find and update the note, return the updated document
    const updatedNote = await Notes.findOneAndUpdate(
      { _id: noteId },
      updatedData,
      { new: true } // Returns the updated note
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Failed to update the note" });
    }

    res.status(200).json({ data: updatedNote });
  } catch (error) {
    console.error("Error updating note:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  const { noteId } = req.params;
  try {
    const note = await Notes.findByIdAndDelete({ _id: noteId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};

// Get a note by ID
exports.getNotesByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const note = await Notes.find({ owner: userId });

    res.status(200).json({ data: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};
