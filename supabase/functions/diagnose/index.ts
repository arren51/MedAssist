import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptomSummary } = await req.json();

    if (!symptomSummary || typeof symptomSummary !== "string") {
      return new Response(
        JSON.stringify({ error: "symptomSummary is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical triage assistant AI. Your job is to analyze patient symptoms and provide ranked possible diagnoses.

CRITICAL RULES:
1. NEVER provide a diagnosis with confidence above 60% unless the symptoms very clearly match a well-known condition.
2. If you are not confident, you MUST set isInconclusive to true. Patient safety is paramount.
3. Always recommend seeing a healthcare professional.
4. For each diagnosis, provide practical "whereToGo" guidance (e.g., "Emergency Room", "Urgent Care Center", "General Practitioner", "Pharmacy / Self-care").
5. Urgency levels: "emergency" (go now), "urgent" (within 24h), "routine" (schedule appointment), "self-care" (manage at home).
6. Be conservative. It is better to say "inconclusive" than to guess wrong.

You MUST respond with valid JSON matching this exact structure:
{
  "diagnoses": [
    {
      "condition": "string - name of condition",
      "confidence": number 0-100,
      "description": "string - brief plain-language explanation",
      "urgency": "emergency" | "urgent" | "routine" | "self-care",
      "recommendations": ["string array of actionable steps"],
      "whereToGo": "string - type of facility to visit"
    }
  ],
  "isInconclusive": boolean,
  "disclaimer": "string - safety disclaimer"
}

Provide 2-5 possible diagnoses ranked by likelihood. The top one is the provisional diagnosis.
If the highest confidence is below 60%, set isInconclusive to true.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze these patient-reported symptoms and provide a structured diagnosis:\n\n${symptomSummary}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response (may be wrapped in markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      // Return a safe fallback
      parsed = {
        diagnoses: [
          {
            condition: "Assessment Incomplete",
            confidence: 20,
            description: "We were unable to generate a reliable analysis from the provided information.",
            urgency: "routine",
            recommendations: [
              "Please consult with a healthcare professional for a proper evaluation",
              "Consider providing more detailed symptom information",
            ],
            whereToGo: "General Practitioner",
          },
        ],
        isInconclusive: true,
        disclaimer:
          "This tool provides preliminary analysis only. Always consult a licensed healthcare professional for medical advice.",
      };
    }

    // Safety check: if top diagnosis confidence < 60, force inconclusive
    if (parsed.diagnoses?.[0]?.confidence < 60) {
      parsed.isInconclusive = true;
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
