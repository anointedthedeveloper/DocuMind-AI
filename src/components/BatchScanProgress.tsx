import { ScanLine, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface BatchItem {
  fileName: string;
  status: "queued" | "scanning" | "analyzing" | "done" | "error";
  progress: number;
  error?: string;
}

interface BatchScanProgressProps {
  items: BatchItem[];
  overallProgress: number;
}

const statusIcon = (status: BatchItem["status"]) => {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "scanning":
    case "analyzing":
      return <ScanLine className="h-4 w-4 text-primary animate-pulse-scan" />;
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
  }
};

const statusLabel = (status: BatchItem["status"]) => {
  switch (status) {
    case "queued": return "Queued";
    case "scanning": return "Scanning...";
    case "analyzing": return "Analyzing...";
    case "done": return "Complete";
    case "error": return "Failed";
  }
};

const BatchScanProgress = ({ items, overallProgress }: BatchScanProgressProps) => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-foreground">
        Batch Processing ({items.filter((i) => i.status === "done").length}/{items.length})
      </p>
      <p className="text-xs text-muted-foreground">{overallProgress.toFixed(0)}%</p>
    </div>
    <Progress value={overallProgress} className="h-2" />
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
          {statusIcon(item.status)}
          <span className="text-sm truncate flex-1 text-foreground">{item.fileName}</span>
          <span className="text-xs text-muted-foreground shrink-0">{statusLabel(item.status)}</span>
        </div>
      ))}
    </div>
  </div>
);

export default BatchScanProgress;
