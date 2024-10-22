const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema for a Note
const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "collaborator",
      },
    ],
    sharedLink: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Create the Note model using the schema
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
