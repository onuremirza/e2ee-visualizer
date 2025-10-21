"use client";

export function RoleSwitch({
  value,
  onChange,
}: {
  value: "A→B" | "B→A";
  onChange: (v: "A→B" | "B→A") => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border px-2 py-1 text-xs dark:border-gray-800">
      <button
        className={`rounded-lg px-2 py-1 ${
          value === "A→B" ? "bg-emerald-100 dark:bg-emerald-900/40" : ""
        }`}
        onClick={() => onChange("A→B")}
        aria-pressed={value === "A→B"}
      >
        Alice → Bob
      </button>
      <span className="opacity-60">|</span>
      <button
        className={`rounded-lg px-2 py-1 ${
          value === "B→A" ? "bg-emerald-100 dark:bg-emerald-900/40" : ""
        }`}
        onClick={() => onChange("B→A")}
        aria-pressed={value === "B→A"}
      >
        Bob → Alice
      </button>
    </div>
  );
}
