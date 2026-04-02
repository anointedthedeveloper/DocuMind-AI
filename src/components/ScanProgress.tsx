import { ScanLine } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScanProgressProps {
  progress: number;
  status: string;
}

const ScanProgress = ({ progress, status }: ScanProgressProps) => (
  <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
    <div className="relative">
      <ScanLine className="h-12 w-12 text-primary animate-pulse-scan" />
    </div>
    <Progress value={progress} className="w-full max-w-xs h-2" />
    <p className="text-sm text-muted-foreground font-medium">{status}</p>
  </div>
);

export default ScanProgress;
