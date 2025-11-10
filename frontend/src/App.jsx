import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

// Backend API base (Render)
axios.defaults.baseURL = "https://todo-mern-8685.onrender.com/api";

/* ---- Inline modal to avoid import issues ---- */
function AddTaskModal({
  show,
  onClose,
  title,
  setTitle,
  description,
  setDescription,
  date,
  setDate,
  time,
  setTime,
  addTask,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-end z-50">
      <div className="bg-white rounded-t-2xl p-5 w-full max-w-sm">
        <div className="h-1 w-10 bg-gray-300 rounded mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4 text-center">Add Task</h2>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded mb-3"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex gap-3 mb-3">
          <input
            type="date"
            className="w-1/2 border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className="w-1/2 border p-2 rounded"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-blue-600 text-white p-2 rounded-lg mb-2 active:scale-[.99]"
          onClick={() => {
            addTask();
            onClose();
          }}
        >
          Add
        </button>

        <button
          className="w-full text-center text-gray-500 text-sm"
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
/* ---- End inline modal ---- */

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // form state for AddTaskModal
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.log("Fetch error:", err?.response?.data || err.message);
    }
  };

  const addTask = async () => {
    if (!title || !date || !time) {
      alert("Title, Date & Time required");
      return;
    }
    try {
      await axios.post("/tasks", {
        title,
        description,
        status: "in-progress",
        dateTime: new Date(`${date}T${time}`),
      });

      // clear form
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");

      // refresh
      fetchTasks();
    } catch (err) {
      console.log("Add error:", err?.response?.data || err.message);
    }
  };

  const toggleComplete = async (id, status) => {
    try {
      await axios.put(`/tasks/${id}`, {
        status: status === "completed" ? "in-progress" : "completed",
      });
      fetchTasks();
    } catch (err) {
      console.log("Update error:", err?.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.log("Delete error:", err?.response?.data || err.message);
    }
  };

  // derived UI numbers
  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "completed").length,
    [tasks]
  );
  const pendingCount = useMemo(
    () => tasks.length - completedCount,
    [tasks, completedCount]
  );

  // simple "today" filter without extra plugins
  const todayKey = dayjs().format("YYYY-MM-DD");
  const tasksToday = useMemo(
    () =>
      tasks
        .filter((t) => dayjs(t.dateTime).format("YYYY-MM-DD") === todayKey)
        .filter((t) =>
          search.trim()
            ? (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
              (t.description || "").toLowerCase().includes(search.toLowerCase())
            : true
        ),
    [tasks, todayKey, search]
  );

  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-28 font-sans max-w-sm mx-auto">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a task"
        className="w-full bg-gray-100 px-4 py-2 rounded-lg mb-6 text-sm outline-none"
      />

      {/* Weekday strip (highlight today) */}
      <div className="flex justify-between text-center text-xs text-gray-600 mb-6">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
          const jsDay = (dayjs().day() + 6) % 7; // Monday=0
          return (
            <div
              key={d}
              className={`w-8 py-1 rounded-md ${
                i === jsDay ? "bg-blue-600 text-white font-medium" : "bg-gray-100"
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-indigo-100 rounded-lg p-3 text-center">
          <p className="text-xs">Task Complete</p>
          <p className="text-xl font-semibold">{completedCount}</p>
          <p className="text-[10px] text-gray-500">This Week</p>
        </div>
        <div className="bg-red-100 rounded-lg p-3 text-center">
          <p className="text-xs">Task Pending</p>
          <p className="text-xl font-semibold">{pendingCount}</p>
          <p className="text-[10px] text-gray-500">This Week</p>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Weekly Progress</p>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width:
                tasks.length === 0
                  ? "0%"
                  : Math.round((completedCount / tasks.length) * 100) + "%",
            }}
          />
        </div>
      </div>

      {/* Tasks Today */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Tasks Today</p>
        <span className="text-xs text-gray-500">{tasksToday.length}</span>
      </div>

      {tasksToday.length === 0 && (
        <p className="text-gray-400 text-sm mb-3">No tasks for today.</p>
      )}

      <ul className="space-y-3">
        {tasksToday.map((task) => (
          <li
            key={task._id}
            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
          >
            <input
              type="checkbox"
              checked={task.status === "completed"}
              onChange={() => toggleComplete(task._id, task.status)}
            />
            <div className="flex-1">
              <p
                className={`text-sm ${
                  task.status === "completed" ? "line-through text-gray-400" : ""
                }`}
              >
                {task.title}
              </p>
              <p className="text-[10px] text-gray-500">
                {dayjs(task.dateTime).format("MMM D, h:mm A")}
              </p>
            </div>
            <button
              className="text-red-600 text-sm px-2"
              onClick={() => deleteTask(task._id)}
              aria-label="Delete task"
              title="Delete"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 bg-blue-600 text-white rounded-full w-14 h-14 text-3xl shadow-lg active:scale-95"
        aria-label="Add Task"
        title="Add Task"
      >
        +
      </button>

      {/* Bottom-sheet Add Task Modal */}
      <AddTaskModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        addTask={addTask}
      />
    </div>
  );
}
