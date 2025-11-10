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
  // weekly summary object: { "YYYY-MM-DD(monday)": { open, completed, tasks: [...] } }
  const [weekly, setWeekly] = useState({});
  const [openWeek, setOpenWeek] = useState(null);

  // form / modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // search within expanded week
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWeekly();
  }, []);

  const fetchWeekly = async () => {
    try {
      const res = await axios.get("/weekly-summary");
      setWeekly(res.data || {});
    } catch (err) {
      console.log("Fetch weekly failed:", err?.response?.data || err.message);
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
      // clear
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      // refresh weekly view
      fetchWeekly();
    } catch (err) {
      console.log("Add error:", err?.response?.data || err.message);
    }
  };

  const toggleComplete = async (id, status) => {
    try {
      await axios.put(`/tasks/${id}`, {
        status: status === "completed" ? "in-progress" : "completed",
      });
      fetchWeekly();
    } catch (err) {
      console.log("Update error:", err?.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      fetchWeekly();
    } catch (err) {
      console.log("Delete error:", err?.response?.data || err.message);
    }
  };

  const weekKeys = useMemo(
    () =>
      Object.keys(weekly)
        .sort((a, b) => new Date(b) - new Date(a)), // latest week first
    [weekly]
  );

  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-28 font-sans max-w-sm mx-auto">
      {/* Search (filters tasks inside expanded week) */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tasks in this week"
        className="w-full bg-gray-100 px-4 py-2 rounded-lg mb-6 text-sm outline-none"
      />

      {/* Header */}
      <h1 className="text-xl font-semibold mb-3">Weekly Overview</h1>

      {/* If no data */}
      {weekKeys.length === 0 && (
        <p className="text-gray-400 text-sm">No tasks yet. Add one with the + button.</p>
      )}

      {/* Weekly cards */}
      <div className="space-y-4">
        {weekKeys.map((week) => {
          const data = weekly[week];
          const start = dayjs(week);
          const end = start.add(6, "day");

          // filter tasks by search when expanded
          const tasksFiltered =
            openWeek === week && search.trim()
              ? data.tasks.filter(
                  (t) =>
                    (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
                    (t.description || "")
                      .toLowerCase()
                      .includes(search.toLowerCase())
                )
              : data.tasks;

          return (
            <div key={week}>
              {/* Week card */}
              <div
                className="bg-white shadow rounded-2xl p-4 cursor-pointer border active:scale-[.995]"
                onClick={() => setOpenWeek(openWeek === week ? null : week)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {start.format("MMM D")} → {end.format("MMM D")}
                  </p>
                  <span className="text-xs text-gray-500">
                    {openWeek === week ? "Hide" : "Show"}
                  </span>
                </div>

                <p className="text-sm mt-2">
                  🔵 {data.open} Open &nbsp;&nbsp; ✅ {data.completed} Done
                </p>

                {/* progress bar */}
                <div className="mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width:
                        data.open + data.completed === 0
                          ? "0%"
                          : Math.round(
                              (data.completed / (data.open + data.completed)) * 100
                            ) + "%",
                    }}
                  />
                </div>
              </div>

              {/* Expanded task list */}
              {openWeek === week && (
                <ul className="mt-3 space-y-3 pl-1">
                  {tasksFiltered.map((task) => (
                    <li
                      key={task._id}
                      className="border rounded-xl p-3 flex justify-between items-center bg-gray-50"
                    >
                      <div className="pr-3">
                        <p
                          className={`text-sm ${
                            task.status === "completed"
                              ? "line-through text-gray-400"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {dayjs(task.dateTime).format("MMM D, h:mm A")}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 items-center">
                        <button
                          className="text-green-600 text-lg"
                          onClick={() => toggleComplete(task._id, task.status)}
                          title="Toggle complete"
                        >
                          ✓
                        </button>
                        <button
                          className="text-red-600 text-lg"
                          onClick={() => deleteTask(task._id)}
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                  {tasksFiltered.length === 0 && (
                    <li className="text-xs text-gray-400 pl-1">No matching tasks in this week.</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

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
