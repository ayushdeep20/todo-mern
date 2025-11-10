import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

axios.defaults.baseURL = "https://todo-mern-8685.onrender.com/api";

export default function App() {
  const [weeklyData, setWeeklyData] = useState({});
  const [openWeek, setOpenWeek] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    fetchWeekly();
  }, []);

  const fetchWeekly = async () => {
    try {
      const res = await axios.get("/weekly-summary");
      setWeeklyData(res.data);
    } catch (err) {
      console.log("Fetch summary failed:", err);
    }
  };

  const addTask = async () => {
    if (!title || !date || !time) return alert("Title, Date & Time required");

    await axios.post("/tasks", {
      title,
      description,
      dateTime: new Date(`${date}T${time}`),
      status: "in-progress"
    });

    setTitle("");
    setDescription("");
    setDate("");
    setTime("");

    fetchWeekly();
  };

  const toggleComplete = async (id, current) => {
    await axios.put(`/tasks/${id}`, {
      status: current === "completed" ? "in-progress" : "completed"
    });
    fetchWeekly();
  };

  const deleteTask = async (id) => {
    await axios.delete(`/tasks/${id}`);
    fetchWeekly();
  };

  return (
    <div className="p-5 max-w-md mx-auto font-sans">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-4">Weekly Tasks</h1>

      {/* ADD TASK FORM */}
      <div className="mb-6 space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Task Title"
          value={title} onChange={(e) => setTitle(e.target.value)} />

        <textarea className="w-full border p-2 rounded" placeholder="Description (optional)"
          value={description} onChange={(e) => setDescription(e.target.value)} />

        <input type="date" className="w-full border p-2 rounded"
          value={date} onChange={(e) => setDate(e.target.value)} />

        <input type="time" className="w-full border p-2 rounded"
          value={time} onChange={(e) => setTime(e.target.value)} />

        <button className="w-full bg-blue-600 text-white p-2 rounded"
          onClick={addTask}>
          Add Task
        </button>
      </div>

      {/* WEEKLY SUMMARY CARDS */}
      {Object.keys(weeklyData).length === 0 && (
        <p className="text-gray-500">No tasks yet.</p>
      )}

      <div className="space-y-4">
        {Object.entries(weeklyData).map(([week, data]) => {
          const start = dayjs(week);
          const end = start.add(6, "day");

          return (
            <div key={week}>

              {/* WEEK CARD */}
              <div
                className="bg-white shadow rounded-2xl p-4 cursor-pointer border"
                onClick={() => setOpenWeek(openWeek === week ? null : week)}
              >
                <p className="font-semibold">
                  {start.format("MMM D")} → {end.format("MMM D")}
                </p>

                <p className="text-sm mt-1">
                  🔵 {data.open} Open &nbsp;&nbsp; ✅ {data.completed} Done
                </p>
              </div>

              {/* TASK LIST (only if this week is expanded) */}
              {openWeek === week && (
                <ul className="mt-3 space-y-3 pl-2">
                  {data.tasks.map(task => (
                    <li key={task._id}
                      className="border rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className={task.status === "completed" ? "line-through text-gray-400" : ""}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dayjs(task.dateTime).format("MMM D, h:mm A")}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          className="text-green-600 font-bold"
                          onClick={() => toggleComplete(task._id, task.status)}
                        >
                          ✓
                        </button>

                        <button
                          className="text-red-600 font-bold"
                          onClick={() => deleteTask(task._id)}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
