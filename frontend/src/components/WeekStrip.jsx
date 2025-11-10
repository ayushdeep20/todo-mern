import dayjs from "dayjs";

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

/**
 * WeekStrip
 * - Renders a horizontal list of week cards (Mon→Sun)
 * - Highlights current week
 * - Clicking a pill sets openWeek
 */
export default function WeekStrip({ weekKeys = [], weekly = {}, openWeek, setOpenWeek }) {
  if (!weekKeys.length) return null;

  const isThisWeek = (weekKey) => {
    const start = dayjs().startOf("week").add(1, "day"); // Monday
    const key = start.format("YYYY-MM-DD");
    return key === weekKey;
  };

  return (
    <div className="mb-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
      <div className="flex gap-2">
        {weekKeys.map((wk) => {
          const data = weekly[wk] || { open: 0, completed: 0 };
          const start = dayjs(wk);
          const end = start.add(6, "day");

          const active = openWeek === wk;
          const current = isThisWeek(wk);

          return (
            <button
              key={wk}
              onClick={() => setOpenWeek(wk)}
              className={cls(
                "shrink-0 rounded-xl border px-3 py-2 text-left min-w-[150px]",
                active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-black",
                current && !active ? "ring-1 ring-blue-400" : ""
              )}
              title={`${start.format("MMM D")} → ${end.format("MMM D")}`}
            >
              <div className="text-xs opacity-80">
                {start.format("MMM D")} → {end.format("MMM D")}
              </div>
              <div className="mt-1 text-[11px] flex items-center gap-3">
                <span className={cls(active ? "opacity-90" : "text-blue-700")}>🔵 {data.open} Open</span>
                <span className={cls(active ? "opacity-90" : "text-emerald-700")}>✅ {data.completed} Done</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
