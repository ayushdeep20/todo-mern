const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dateTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
});

module.exports = mongoose.model("Task", TaskSchema);
