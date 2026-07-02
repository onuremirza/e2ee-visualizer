"use client";

export function RoleSwitch({
  value,
  onChange,
}: {
  value: "A→B" | "B→A";
  onChange: (v: "A→B" | "B→A") => void;
}) {
  const opts: { v: "A→B" | "B→A"; label: string }[] = [
    { v: "A→B", label: "Alice → Bob" },
    { v: "B→A", label: "Bob → Alice" },
  ];
  return (
    <div className="inline-flex items-center rounded-xl border border-panel-border bg-panel/60 p-1 text-xs">
      {opts.map(({ v, label }) => (
        <button
          key={v}
          className={`rounded-lg px-3 py-1.5 transition ${
            value === v
              ? "bg-accent text-[#04110b] font-medium"
              : "text-muted hover:text-foreground"
          }`}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
