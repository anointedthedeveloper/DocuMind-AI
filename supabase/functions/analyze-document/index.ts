import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Text too short to analyze" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a document analysis AI. Analyze the given text and return a JSON object with these fields:
- category: one of "Financial", "Legal", "Medical", "Correspondence", "Report", "Resume/CV", "Technical", "Academic", "General"
- summary: a 2-3 sentence summary of the document content
- keywords: array of 5-8 important keywords/key phrases
- language: the primary language of the text
- sentiment: "Positive", "Negative", or "Neutral"
- entities: array of named entities found (people, organizations, dates, amounts) each with "name" and "type" fields
- key_findings: array of 2-4 key findings or important points from the document

Return ONLY valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: `Analyze this document text:\n\n${text.slice(0, 4000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_document",
              description: "Return structured analysis of a document",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: ["Financial", "Legal", "Medical", "Correspondence", "Report", "Resume/CV", "Technical", "Academic", "General"] },
                  summary: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } },
                  language: { type: "string" },
                  sentiment: { type: "string", enum: ["Positive", "Negative", "Neutral"] },
                  entities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { type: "string" },
                      },
                      required: ["name", "type"],
                    },
                  },
                  key_findings: { type: "array", items: { type: "string" } },
                },
                required: ["category", "summary", "keywords", "language", "sentiment", "entities", "key_findings"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_document" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
