const Notes = require("../models/Notes");
const Collaborator = require("../models/Collaborator");
const User = require("../models/User");

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
    // Find the note by its ID and populate collaborators
    const note = await Notes.findById(noteId).populate("collaborators");
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Map through collaborators and retrieve user data, resolving all promises
    const collaborators =
      note.collaborators.length > 0
        ? await Promise.all(
            note.collaborators.map(async (collaborator) => {
              const user = await User.findById(
                collaborator.collaboratorId
              ).select("-password");
              return {
                ...collaborator.toObject(), // Keep collaborator data
                name: user.name,
                email: user.email, // Add corresponding user data
              };
            })
          )
        : [];

    // Respond with note data and populated collaborators
    res.status(200).json({
      data: {
        ...note.toObject(),
        collaborators,
        isOwner: note.owner.toString() === req.user.id,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get a note by shareable link
exports.updateAndCreateNoteCollaborators = async (req, res) => {
  const { noteId } = req.params;
  const { collaboratorId, permission } = req.body;

  const collabId = collaboratorId ? collaboratorId : req.user.id;

  try {
    // Find the note by ID
    const note = await Notes.findOne({ _id: noteId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const isOwner = note.owner.toString() === collabId;
    const isCollaborator = await Collaborator.findOne({
      noteId,
      ownerId: note.owner,
      collaboratorId: collaboratorId ? collaboratorId : collabId,
    });

    if (isOwner || isCollaborator) {
      return res.status(200).json({
        data: { note, collaborator: isCollaborator },
        message: "User already a collaborator or owner",
        status: "error",
      });
    }

    const newCollaborator = await Collaborator.create({
      noteId,
      ownerId: note.owner,
      collaboratorId: collabId,
      permission: permission ? permission : "view",
    });
    newCollaborator.save();

    note.collaborators.push(newCollaborator._id);

    await note.save();
    res.status(200).json({
      data: { note, collaborator: newCollaborator },
      message: "Collaborator added successfully",
      status: "success",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error", error });
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
  const { search } = req.query;
  try {
    const filter = { owner: userId };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    const note = await Notes.find(filter);

    res.status(200).json({ data: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};

exports.getNotesByCollaboratorId = async (req, res) => {
  const { collaboratorId } = req.params;
  try {
    const collaborators = await Collaborator.find({
      collaboratorId: collaboratorId,
    });

    const notes = await Promise.all(
      collaborators.map(async (collaborator) => {
        const note = await Notes.findOne({ _id: collaborator.noteId });
        return { ...note.toObject(), permission: collaborator.permission };
      })
    );

    res.status(200).json({ data: notes });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error);
  }
};

exports.updateTheCollaboratorContent = async (req, res) => {
  const { collaboratorId } = req.params;

  try {
    // Find the collaborator by the provided collaboratorId
    const collaborator = await Collaborator.findOne({
      collaboratorId: collaboratorId,
    });

    if (!collaborator) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    // Update the collaborator's content
    const updatedCollaborator = await Collaborator.findOneAndUpdate(
      { collaboratorId: collaboratorId },
      {
        collaboratorContent: req.body.collaboratorContent
          ? req.body.collaboratorContent
          : collaborator.collaboratorContent,
        permission: req.body.permission
          ? req.body.permission
          : collaborator.permission,
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({ data: updatedCollaborator });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.removeNoteCollaborators = async (req, res) => {
  const { noteId, collaboratorId } = req.params;

  try {
    // Find the note by ID
    const note = await Notes.findOne({ _id: noteId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Ensure the collaborator exists in this note
    const collaborator = await Collaborator.findOne({
      noteId: noteId,
      collaboratorId: collaboratorId,
    });

    if (!collaborator) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    // Check if the requester is the owner or the collaborator
    const isOwner = note.owner.toString() === req.user.id.toString();
    const isCollaborator =
      collaborator.collaboratorId.toString() === req.user.id.toString();

    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ message: "Unauthorized to remove collaborator" });
    }

    // Remove collaborator from note's collaborator list
    note.collaborators = note.collaborators.filter(
      (id) => id.toString() !== collaborator._id.toString()
    );

    // Save the updated note
    await note.save();

    // Delete the collaborator record
    await Collaborator.findByIdAndDelete(collaborator._id);

    res
      .status(200)
      .json({ message: "Collaborator removed successfully", data: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.checkPermission = async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.id;

  try {
    // First, check if the user is the owner of the note
    const note = await Notes.findOne({ _id: noteId });

    if (note.owner.toString() === req.user.id) {
      return res.status(200).json({
        message: "Owner",
        permission: "edit",
      });
    }

    // If not the owner, check if they are a collaborator with certain permissions
    const collaborator = await Collaborator.findOne({
      noteId,
      collaboratorId: userId,
    });

    if (!collaborator) {
      return res.status(403).json({
        message: "No permission",
        permission: "view",
      });
    }

    // If the user is a collaborator, return their permission level
    res.status(200).json({
      message: "Collaborator",
      permission: collaborator.permission,
    });
  } catch (error) {
    console.error("Error checking permission:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
