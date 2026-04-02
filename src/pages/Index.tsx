import { useState, useCallback } from "react";
import { ScanLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/DocumentUpload";
import ScanProgress from "@/components/ScanProgress";
import BatchScanProgress, { type BatchItem } from "@/components/BatchScanProgress";
import ExtractedText from "@/components/ExtractedText";
import AiAnalysis from "@/components/AiAnalysis";
import DocumentHistory, { type ScannedDocument } from "@/components/DocumentHistory";
import { performOcr, type OcrResult } from "@/lib/ocr";
import { analyzeTextWithAi, type AiAnalysis as AiAnalysisType } from "@/lib/ai-analyze";
import { exportAsPdf } from "@/lib/export-pdf";

const Index = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysisType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);

  const isBatch = files.length > 1;

  const scanSingleFile = useCallback(
    async (file: File): Promise<{ ocr: OcrResult; ai?: AiAnalysisType }> => {
      const ocr = await performOcr(file, (progress, status) => {
        setScanProgress(progress);
        setScanStatus(status);
      });

      let ai: AiAnalysisType | undefined;
      if (ocr.text.length > 10) {
        try {
          ai = await analyzeTextWithAi(ocr.text);
        } catch (err) {
          console.error("AI analysis failed:", err);
          toast({
            title: "AI Analysis unavailable",
            description: err instanceof Error ? err.message : "Could not analyze document.",
            variant: "destructive",
          });
        }
      }
      return { ocr, ai };
    },
    [toast]
  );

  const handleScan = useCallback(async () => {
    if (files.length === 0) return;
    setIsScanning(true);
    setOcrResult(null);
    setAnalysis(null);
    setScanProgress(0);

    if (!isBatch) {
      // Single file scan
      try {
        const { ocr, ai } = await scanSingleFile(files[0]);
        setOcrResult(ocr);
        setScanProgress(100);
        setScanStatus("Complete!");

        if (ai) {
          setAnalysis(ai);
          setDocuments((prev) => [
            { id: crypto.randomUUID(), name: files[0].name, text: ocr.text, category: ai.category, timestamp: new Date() },
            ...prev,
          ]);
        } else {
          setDocuments((prev) => [
            { id: crypto.randomUUID(), name: files[0].name, text: ocr.text, timestamp: new Date() },
            ...prev,
          ]);
        }

        toast({ title: "Scan complete!", description: `Extracted ${ocr.text.split(/\s+/).length} words.` });
      } catch {
        toast({ title: "Scan failed", description: "Could not extract text.", variant: "destructive" });
      } finally {
        setIsScanning(false);
      }
    } else {
      // Batch scan
      const items: BatchItem[] = files.map((f) => ({ fileName: f.name, status: "queued" as const, progress: 0 }));
      setBatchItems(items);

      for (let i = 0; i < files.length; i++) {
        const updateItem = (update: Partial<BatchItem>) => {
          setBatchItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, ...update } : item)));
        };

        updateItem({ status: "scanning" });
        try {
          const ocr = await performOcr(files[i], (progress) => {
            updateItem({ progress });
          });

          let ai: AiAnalysisType | undefined;
          if (ocr.text.length > 10) {
            updateItem({ status: "analyzing" });
            try {
              ai = await analyzeTextWithAi(ocr.text);
            } catch {
              // AI failed but OCR succeeded, continue
            }
          }

          updateItem({ status: "done", progress: 100 });
          setDocuments((prev) => [
            { id: crypto.randomUUID(), name: files[i].name, text: ocr.text, category: ai?.category, timestamp: new Date() },
            ...prev,
          ]);
        } catch {
          updateItem({ status: "error", error: "OCR failed" });
        }
      }

      toast({ title: "Batch scan complete!", description: `Processed ${files.length} documents.` });
      setIsScanning(false);
    }
  }, [files, isBatch, scanSingleFile, toast]);

  const overallBatchProgress =
    batchItems.length > 0
      ? (batchItems.filter((i) => i.status === "done" || i.status === "error").length / batchItems.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto flex items-center gap-3 py-4 px-4">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">DocScanner AI</h1>
            <p className="text-xs text-muted-foreground">Scan · Extract · Analyze</p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <DocumentUpload onFilesSelect={setFiles} isProcessing={isScanning} />

        {files.length > 0 && !isScanning && (
          <div className="flex gap-3 animate-fade-in">
            <Button onClick={handleScan} size="lg" className="flex-1 gap-2">
              <ScanLine className="h-5 w-5" />
              {isBatch ? `Scan ${files.length} Documents` : "Scan Document"}
            </Button>
            {ocrResult && !isBatch && (
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => exportAsPdf(files[0]?.name || "document", ocrResult.text)}
              >
                Export PDF
              </Button>
            )}
          </div>
        )}

        {isScanning && !isBatch && <ScanProgress progress={scanProgress} status={scanStatus} />}
        {isScanning && isBatch && (
          <BatchScanProgress items={batchItems} overallProgress={overallBatchProgress} />
        )}

        {ocrResult && !isBatch && (
          <ExtractedText text={ocrResult.text} confidence={ocrResult.confidence} language={ocrResult.language} />
        )}

        {(isAnalyzing || analysis) && !isBatch && (
          <AiAnalysis analysis={analysis} isLoading={isAnalyzing} />
        )}

        <DocumentHistory
          documents={documents}
          onExportPdf={(doc) => exportAsPdf(doc.name, doc.text)}
          onDelete={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
        />

        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            Powered by Tesseract.js OCR + Lovable AI
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
