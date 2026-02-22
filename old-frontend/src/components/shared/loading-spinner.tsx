import { Shield } from "lucide-react";

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative">
        <Shield className="h-12 w-12 animate-pulse text-blue-500" />
        <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {message || "Processing..."}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Running multi-agent debate loop. This may take a moment.
        </p>
      </div>
    </div>
  );
}
