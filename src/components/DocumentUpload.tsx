import { useCallback, useState } from "react";
import { Upload, FileImage, X, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DocumentUploadProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
}

const DocumentUpload = ({ onFilesSelect, isProcessing }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const valid = Array.from(newFiles).filter(
        (f) => f.type.startsWith("image/") || f.type === "application/pdf"
      );
      if (valid.length === 0) return;

      setFiles((prev) => {
        const updated = [...prev, ...valid];
        // Generate previews for image files
        valid.forEach((f) => {
          if (f.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setPreviews((p) => new Map(p).set(f.name + f.size, e.target?.result as string));
            };
            reader.readAsDataURL(f);
          }
        });
        return updated;
      });

      onFilesSelect([...files, ...valid]);
    },
    [files, onFilesSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesSelect(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setPreviews(new Map());
    onFilesSelect([]);
  };

  return (
    <Card
      className={`relative border-2 border-dashed transition-all duration-300 overflow-hidden ${
        dragActive
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-muted hover:border-primary/40"
      } ${isProcessing ? "pointer-events-none opacity-60" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      {files.length > 0 ? (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {files.length} document{files.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-1.5 pointer-events-none">
                  <Plus className="h-3.5 w-3.5" />
                  Add more
                </Button>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </label>
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
                Clear all
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((file, i) => {
              const key = file.name + file.size;
              const preview = previews.get(key);
              return (
                <div
                  key={key + i}
                  className="relative group rounded-lg border border-border overflow-hidden bg-muted/30"
                >
                  {preview ? (
                    <img src={preview} alt={file.name} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs truncate text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-4 p-12 cursor-pointer">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-semibold text-foreground">
              Drop your documents here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse · JPG, PNG, PDF · Multiple files supported
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">Batch scanning supported</Badge>
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>
      )}
    </Card>
  );
};

export default DocumentUpload;
