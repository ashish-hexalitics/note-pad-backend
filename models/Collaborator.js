const mongoose = require("mongoose");
const { Schema } = mongoose;

const collaboratorSchema = new Schema(
  {
    noteId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    collaboratorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    permission: {
      type: String,
      enum: ['edit', 'delete', 'view'],
    },
  },
  { timestamps: true }
);

const Collaborator = mongoose.model("collaborator", collaboratorSchema);

module.exports = Collaborator;
