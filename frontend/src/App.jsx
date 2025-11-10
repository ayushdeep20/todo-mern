import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

// ---------------- API base ----------------
// Backend API base (Render / Environment Aware)
const API_BASE =
  import.meta.env.VITE_API_URL || "https://todo-mern-8685.onrender.com/api";
axios.defaults.baseURL = API_BASE;


/* =============== Tiny helpers =============== */
function PriorityDot({ priority }) {
  const cls =
    priority === "high"
      ? "bg-red-500"
      : priority === "medium"
      ? "bg-yellow-500"
      : priority === "low"
      ? "bg-green-500"
      : "bg-transparent";
  if (!priority) return null;
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} aria-hidden="true" />;
}

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

/* =============== iOS-style Bottom Sheet (no deps) =============== */
function BottomSheet({ show, onClose, children, title = "" }) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  // translateY in px
  const [ty, setTy] = useState(0);

  useEffect(() => {
    if (!show) setTy(0);
  }, [show]);

  const begin = (y) => {
    dragging.current = true;
    startY.current = y;
  };
  const move = (y) => {
    if (!dragging.current) return;
    const delta = Math.max(0, y - startY.current);
    currentY.current = delta;
    setTy(delta);
  };
  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const shouldClose = currentY.current > 140; // threshold
    if (shouldClose) {
      // animate down
      setTy(400);
      setTimeout(onClose, 160);
    } else {
      // snap back
      setTy(0);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Dim */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl"
        style={{
          transform: `translateY(${ty}px)`,
          transition: dragging.current ? "none" : "transform 160ms ease-out",
        }}
        // mouse
        onMouseDown={(e) => begin(e.clientY)}
        onMouseMove={(e) => move(e.clientY)}
        onMouseUp={end}
        onMouseLeave={end}
        // touch
        onTouchStart={(e) => begin(e.touches[0].clientY)}
        onTouchMove={(e) => move(e.touches[0].clientY)}
        onTouchEnd={end}
      >
        <div className="p-5 max-w-sm mx-auto">
          <div className="h-1 w-10 bg-gray-300 rounded mx-auto mb-3" />
          {title && <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
}

/* =============== Add / Edit forms =============== */
function AddTaskForm({
  title,
  setTitle,
  description,
  setDescription,
  date,
  setDate,
  time,
  setTime,
  priority,
  setPriority,
  onSubmit, // async -> returns true/false
}) {
  return (
    <>
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
      <select
        className="w-full border p-2 rounded mb-4"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">Priority (optional)</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        className="w-full bg-blue-600 text-white p-2 rounded-lg mb-2 active:scale-[.99]"
        onClick={onSubmit}
      >
        Add
      </button>
      <p className="text-[11px] text-gray-500 text-center">
        Tip: drag the sheet down to close.
      </p>
    </>
  );
}

function EditTaskForm({ editingTask, setEditingTask, onSave }) {
  const setField = (k) => (e) => setEditingTask((t) => ({ ...t, [k]: e.target.value }));
  return (
    <>
      <input
        className="w-full border p-2 rounded mb-3"
        placeholder="Task Title"
        value={editingTask.title || ""}
        onChange={setField("title")}
      />
      <textarea
        className="w-full border p-2 rounded mb-3"
        placeholder="Description (optional)"
        value={editingTask.description || ""}
        onChange={setField("description")}
      />
      <div className="flex gap-3 mb-3">
        <input
          type="date"
          className="w-1/2 border p-2 rounded"
          value={dayjs(editingTask.dateTime).format("YYYY-MM-DD")}
          onChange={(e) => {
            const d = e.target.value;
            const t = dayjs(editingTask.dateTime).format("HH:mm");
            setEditingTask((cur) => ({ ...cur, dateTime: `${d}T${t}` }));
          }}
        />
        <input
          type="time"
          className="w-1/2 border p-2 rounded"
          value={dayjs(editingTask.dateTime).format("HH:mm")}
          onChange={(e) => {
            const t = e.target.value;
            const d = dayjs(editingTask.dateTime).format("YYYY-MM-DD");
            setEditingTask((cur) => ({ ...cur, dateTime: `${d}T${t}` }));
          }}
        />
      </div>
      <select
        className="w-full border p-2 rounded mb-4"
        value={editingTask.priority || ""}
        onChange={setField("priority")}
      >
        <option value="">Priority (optional)</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button className="w-full bg-blue-600 text-white p-2 rounded-lg mb-2 active:scale-[.99]" onClick={onSave}>
        Save
      </button>
      <p className="text-[11px] text-gray-500 text-center">
        Tip: drag the sheet down to close.
      </p>
    </>
  );
}

/* =============== Main App =============== */
export default function App() {
  // tabs
  const [tab, setTab] = useState("home");

  // weekly data: { "YYYY-MM-DD(Mon)": { open, completed, tasks:[...] } }
  const [weekly, setWeekly] = useState({});
  const [openWeek, setOpenWeek] = useState(null);

  // add modal
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("");

  // edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // search
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

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
        priority: priority || undefined,
        status: "in-progress",
        dateTime: `${date}T${time}`,
      });
      setTitle("");
      setDescription("");
      setPriority("");
      setDate("");
      setTime("");
      await fetchWeekly();
      setShowAdd(false);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Add failed");
    }
  };

  const toggleComplete = async (id, status) => {
    try {
      await axios.put(`/tasks/${id}`, {
        status: status === "completed" ? "in-progress" : "completed",
      });
      fetchWeekly();
      if (tab === "search" && searchText.trim()) runSearch();
    } catch (err) {
      console.log("Update error:", err?.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      fetchWeekly();
      if (tab === "search" && searchText.trim()) runSearch();
    } catch (err) {
      console.log("Delete error:", err?.response?.data || err.message);
    }
  };

  const startEdit = (task) => {
    setEditingTask({
      ...task,
      dateTime: dayjs(task.dateTime).format("YYYY-MM-DDTHH:mm"),
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    try {
      const { _id, title, description, priority, dateTime, status } = editingTask;
      await axios.put(`/tasks/${_id}`, {
        title,
        description,
        priority: priority || undefined,
        status,
        dateTime,
      });
      setShowEdit(false);
      setEditingTask(null);
      fetchWeekly();
      if (tab === "search" && searchText.trim()) runSearch();
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Edit failed");
    }
  };

  const weekKeys = useMemo(
    () => Object.keys(weekly).sort((a, b) => new Date(b) - new Date(a)),
    [weekly]
  );

  const runSearch = async () => {
    setSearchLoading(true);
    try {
      const q = searchText.trim();
      const res = await axios.get("/tasks", q ? { params: { q } } : undefined);
      setSearchResults(res.data || []);
    } catch (err) {
      console.log("Search error:", err?.response?.data || err.message);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-24 font-sans max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {tab === "home" ? "Weekly Overview" : "Search Tasks"}
        </h1>
        {tab === "home" && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 text-white rounded-full w-10 h-10 text-2xl leading-[40px] text-center shadow active:scale-95"
            title="Add Task"
          >
            +
          </button>
        )}
      </div>

      {/* CONTENT */}
      {tab === "home" ? (
        <>
          {weekKeys.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12">
              No tasks yet. Tap <span className="font-semibold">+</span> to add your first task.
            </div>
          )}

          <div className="space-y-4">
            {weekKeys.map((week) => {
              const data = weekly[week];
              const start = dayjs(week);
              const end = start.add(6, "day");
              const open = data.open;
              const completed = data.completed;
              const progress = open + completed === 0 ? 0 : Math.round((completed / (open + completed)) * 100);
              const expanded = openWeek === week;

              return (
                <div key={week} className="transition">
                  {/* Week card */}
                  <button
                    className="w-full bg-white shadow rounded-2xl p-4 border text-left active:scale-[.995] transition"
                    onClick={() => setOpenWeek(expanded ? null : week)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {start.format("MMM D")} → {end.format("MMM D")}
                      </p>
                      <span className="text-xs text-gray-500">{expanded ? "Hide" : "Show"}</span>
                    </div>

                    <p className="text-sm mt-2">
                      🔵 {open} Open &nbsp;&nbsp; ✅ {completed} Done
                    </p>

                    <div className="mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </button>

                  {/* Animated expansion */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      expanded ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="space-y-3 pl-1">
                      {data.tasks.length === 0 && (
                        <li className="text-xs text-gray-400 pl-1 py-2">No tasks in this week.</li>
                      )}

                      {data.tasks.map((task) => (
                        <li
                          key={task._id}
                          className="border rounded-xl p-3 flex justify-between items-center bg-gray-50"
                        >
                          <div className="pr-3">
                            <div className="flex items-center gap-2">
                              <PriorityDot priority={task.priority} />
                              <p
                                className={`text-sm ${
                                  task.status === "completed" ? "line-through text-gray-400" : ""
                                }`}
                              >
                                {task.title}
                              </p>
                            </div>
                            <p className="text-[11px] text-gray-500">
                              {dayjs(task.dateTime).format("MMM D, h:mm A")}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{task.description}</p>
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
                              className="text-gray-600 text-lg"
                              onClick={() => startEdit(task)}
                              title="Edit task"
                            >
                              ✎
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
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // SEARCH TAB
        <>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm outline-none"
              placeholder="Search by title or description"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
            />
            <button onClick={runSearch} className="bg-blue-600 text-white px-4 rounded-lg text-sm active:scale-95">
              Search
            </button>
          </div>

          {searchLoading && <p className="text-gray-400 text-sm">Searching…</p>}
          {!searchLoading && searchText.trim() && searchResults.length === 0 && (
            <div className="text-gray-400 text-sm py-8">No matching tasks.</div>
          )}

          <ul className="space-y-3">
            {searchResults.map((task) => (
              <li key={task._id} className="border rounded-xl p-3 flex justify-between items-center bg-gray-50">
                <div className="pr-3">
                  <div className="flex items-center gap-2">
                    <PriorityDot priority={task.priority} />
                    <p className={`text-sm ${task.status === "completed" ? "line-through text-gray-400" : ""}`}>
                      {task.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-500">{dayjs(task.dateTime).format("MMM D, h:mm A")}</p>
                  {task.description && <p className="text-[11px] text-gray-500 mt-0.5">{task.description}</p>}
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    className="text-green-600 text-lg"
                    onClick={() => toggleComplete(task._id, task.status)}
                    title="Toggle complete"
                  >
                    ✓
                  </button>
                  <button className="text-gray-600 text-lg" onClick={() => startEdit(task)} title="Edit task">
                    ✎
                  </button>
                  <button className="text-red-600 text-lg" onClick={() => deleteTask(task._id)} title="Delete task">
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-sm mx-auto flex">
          <button
            className={cn("flex-1 py-3 text-sm", tab === "home" ? "text-blue-600 font-medium" : "text-gray-500")}
            onClick={() => setTab("home")}
          >
            Home
          </button>
        <button
            className={cn("flex-1 py-3 text-sm", tab === "search" ? "text-blue-600 font-medium" : "text-gray-500")}
            onClick={() => setTab("search")}
          >
            Search
          </button>
        </div>
      </nav>

      {/* Sheets */}
      <BottomSheet show={showAdd} onClose={() => setShowAdd(false)} title="Add Task">
        <AddTaskForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          priority={priority}
          setPriority={setPriority}
          onSubmit={addTask}
        />
      </BottomSheet>

      <BottomSheet
        show={showEdit}
        onClose={() => {
          setShowEdit(false);
          setEditingTask(null);
        }}
        title="Edit Task"
      >
        {editingTask && (
          <EditTaskForm
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            onSave={saveEdit}
          />
        )}
      </BottomSheet>
    </div>
  );
}
