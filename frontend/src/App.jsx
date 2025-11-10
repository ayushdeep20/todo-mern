import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// Change ONLY this if you change backend URL
axios.defaults.baseURL = "https://todo-mern-8685.onrender.com/api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.log("Could not fetch tasks:", err);
    }
  };

  const addTask = async () => {
    if (!title || !date || !time) return alert("Title, Date, and Time are required");

    try {
      await axios.post("/tasks", {
        title,
        description,
        priority,
        dateTime: new Date(`${date}T${time}`),
        status: "in-progress"
      });

      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setPriority("");

      fetchTasks();
    } catch (err) {
      console.log("Error adding task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.log("Error deleting task:", err);
    }
  };

  const toggleComplete = async (id, status) => {
    try {
      await axios.put(`/tasks/${id}`, { status: status === "completed" ? "in-progress" : "completed" });
      fetchTasks();
    } catch (err) {
      console.log("Error updating status:", err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 text-center">To-Do Manager</h1>

      <div className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">Priority (optional)</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="w-full border p-2 rounded"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={addTask}>
          Add Task
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-3">Tasks</h2>

      {tasks.length === 0 && <p className="text-gray-500">No tasks yet.</p>}

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task._id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p
                className={`text-lg ${
                  task.status === "completed" ? "line-through text-gray-400" : ""
                }`}
              >
                {task.title}
              </p>

              <p className="text-sm text-gray-500">
                {dayjs(task.dateTime).format("MMM D, YYYY h:mm A")}
              </p>

              {task.priority && (
                <span
                  className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                    task.priority === "high"
                      ? "bg-red-200 text-red-700"
                      : task.priority === "medium"
                      ? "bg-yellow-200 text-yellow-700"
                      : "bg-green-200 text-green-700"
                  }`}
                >
                  {task.priority}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                className="text-green-600 text-xl"
                onClick={() => toggleComplete(task._id, task.status)}
              >
                ✓
              </button>
              <button
                className="text-red-600 text-xl"
                onClick={() => deleteTask(task._id)}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
