import { supabase } from "@/integrations/supabase/client";

export interface AiAnalysis {
  category: string;
  summary: string;
  keywords: string[];
  language: string;
  sentiment: string;
  entities: { name: string; type: string }[];
  key_findings: string[];
}

export async function analyzeTextWithAi(text: string): Promise<AiAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-document", {
    body: { text },
  });

  if (error) throw new Error(error.message || "AI analysis failed");
  if (data?.error) throw new Error(data.error);

  return data as AiAnalysis;
}
