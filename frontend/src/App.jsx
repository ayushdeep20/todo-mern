import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

axios.defaults.baseURL = "https://todo-mern-8685.onrender.com/api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  // Load tasks on start
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
    if (!title || !date || !time) return alert("Title, Date and Time are required");

    try {
      await axios.post("/tasks", {
        title,
        description,
        dateTime: `${date} ${time}`,
      });

      setTitle("");
      setDate("");
      setTime("");
      setDescription("");

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
      console.log("Error deleting:", err);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      await axios.put(`/tasks/${id}`, { completed: !currentStatus });
      fetchTasks();
    } catch (err) {
      console.log("Error updating:", err);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">To-Do App</h1>

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

        <input
          className="w-full border p-2 rounded"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          onClick={addTask}
        >
          Add Task
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-3">Tasks</h2>

      {tasks.length === 0 && <p className="text-gray-500">No tasks yet.</p>}

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task._id} className="border p-3 rounded flex justify-between">
            <div>
              <p
                className={`text-lg ${task.completed ? "line-through text-gray-400" : ""}`}
              >
                {task.title}
              </p>
              <p className="text-sm text-gray-500">
                {dayjs(task.dateTime).format("MMM D, YYYY h:mm A")}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="text-green-600"
                onClick={() => toggleComplete(task._id, task.completed)}
              >
                ✓
              </button>
              <button className="text-red-600" onClick={() => deleteTask(task._id)}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
