import { Brain, FileText, Tag, Languages, Users, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiAnalysis as AnalysisType } from "@/lib/ai-analyze";

interface AiAnalysisProps {
  analysis: AnalysisType | null;
  isLoading: boolean;
}

const AiAnalysis = ({ analysis, isLoading }: AiAnalysisProps) => {
  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent animate-pulse-scan" />
            Analyzing with AI...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Tag className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Category</p>
              <p className="text-sm font-semibold text-foreground">{analysis.category}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Languages className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Language</p>
              <p className="text-sm font-semibold text-foreground">{analysis.language}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Sentiment</p>
              <p className="text-sm font-semibold text-foreground">{analysis.sentiment}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Summary</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </div>

        {analysis.key_findings && analysis.key_findings.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-warning" />
              Key Findings
            </p>
            <ul className="space-y-1.5">
              {analysis.key_findings.map((finding, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.entities && analysis.entities.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-accent" />
              Entities Found
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.entities.map((entity, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {entity.name}
                  <span className="ml-1 text-muted-foreground">({entity.type})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Keywords</p>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiAnalysis;
