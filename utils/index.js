const crypto = require("crypto");

exports.generateShareableLink = () => {
  return crypto.randomBytes(16).toString("hex");
};
