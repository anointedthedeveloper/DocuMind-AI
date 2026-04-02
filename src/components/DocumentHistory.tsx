import { FileText, Download, Trash2, Clock, Search, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface ScannedDocument {
  id: string;
  name: string;
  text: string;
  category?: string;
  timestamp: Date;
}

interface DocumentHistoryProps {
  documents: ScannedDocument[];
  onExportPdf: (doc: ScannedDocument) => void;
  onDelete: (id: string) => void;
}

const DocumentHistory = ({ documents, onExportPdf, onDelete }: DocumentHistoryProps) => {
  const [search, setSearch] = useState("");

  if (documents.length === 0) return null;

  const filtered = search.trim()
    ? documents.filter((doc) => {
        const q = search.toLowerCase();
        return (
          doc.name.toLowerCase().includes(q) ||
          doc.text.toLowerCase().includes(q) ||
          doc.category?.toLowerCase().includes(q)
        );
      })
    : documents;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Scanned Documents ({documents.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by name, content, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No documents match "{search}"
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.timestamp.toLocaleString()} · {doc.text.length} chars
                  </p>
                  {search && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {highlightMatch(doc.text, search)}
                    </p>
                  )}
                </div>
                {doc.category && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {doc.category}
                  </Badge>
                )}
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onExportPdf(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function highlightMatch(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 100);
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 50);
  return (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
}

export default DocumentHistory;
