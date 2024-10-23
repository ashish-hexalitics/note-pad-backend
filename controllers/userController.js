const User = require("../models/User");

// get user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: { user: user } });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Get email from query params (optional)
    const email = req?.query?.email;

    let filter = {
      _id: { $ne: req.user.id }, 
    };
    if (email) {
      filter.email = email;
    }

    // Find users based on filter, excluding the password field
    const users = await User.find(filter).select("-password");

    // Check if users are found
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ data: { users: users } });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
