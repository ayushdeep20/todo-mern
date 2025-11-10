import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API = import.meta.env.VITE_API || "http://localhost:4000/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [priority, setPriority] = useState("Low");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    axios.get(`${API}/tasks`)
      .then(res => setTasks(res.data))
      .catch(() => setTasks([]));
  }, [refresh]);

  const addTask = async () => {
    if (!title || !dateTime) return alert("Title and Date/Time required");
    await axios.post(`${API}/tasks`, { title, description, dateTime, priority });
    setTitle("");
    setDescription("");
    setDateTime("");
    setPriority("Low");
    setRefresh(!refresh);
  };

  const toggleStatus = async (id, current) => {
    const status = current === "completed" ? "open" : "completed";
    await axios.put(`${API}/tasks/${id}`, { status });
    setRefresh(!refresh);
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`);
    setRefresh(!refresh);
  };

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">My To-Do List</h1>

      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded w-full p-2 mb-2"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded w-full p-2 mb-2"
        />
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="border rounded w-full p-2 mb-2"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border rounded w-full p-2 mb-2"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <button
          onClick={addTask}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Your Tasks</h2>
      <div className="space-y-3">
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center">No tasks yet</p>
        )}
        {tasks.map(t => (
          <div key={t._id} className="bg-white shadow rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className={`font-semibold ${t.status === "completed" ? "line-through text-gray-400" : ""}`}>{t.title}</h3>
              <p className="text-sm text-gray-500">{dayjs(t.dateTime).format("ddd, MMM D hh:mm A")}</p>
              <p className="text-xs text-gray-400">Priority: {t.priority}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(t._id, t.status)}
                className={`px-3 py-1 rounded text-white ${t.status === "completed" ? "bg-yellow-500" : "bg-green-500"}`}
              >
                {t.status === "completed" ? "Undo" : "Done"}
              </button>
              <button
                onClick={() => deleteTask(t._id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
