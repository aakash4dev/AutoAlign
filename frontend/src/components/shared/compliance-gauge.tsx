"use client";

export function ComplianceGauge({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  const color =
    percentage >= 85
      ? "text-green-500"
      : percentage >= 60
        ? "text-yellow-500"
        : "text-red-500";

  const strokeColor =
    percentage >= 85
      ? "#22c55e"
      : percentage >= 60
        ? "#eab308"
        : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{percentage}%</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Compliance Score</p>
    </div>
  );
}
