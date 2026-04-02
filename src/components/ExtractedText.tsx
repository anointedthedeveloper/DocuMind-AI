import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExtractedTextProps {
  text: string;
  confidence: number;
  language?: string;
}

const ExtractedText = ({ text, confidence, language }: ExtractedTextProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Extracted Text</CardTitle>
        <div className="flex items-center gap-2">
          {language && (
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-xs ${
              confidence > 80
                ? "border-success text-success"
                : confidence > 50
                ? "border-warning text-warning"
                : "border-destructive text-destructive"
            }`}
          >
            {confidence.toFixed(0)}% confidence
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono text-foreground leading-relaxed">
            {text}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedText;
