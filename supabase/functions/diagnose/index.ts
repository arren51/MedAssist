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
    const { symptomSummary, iteration = 0, previousDiagnoses, images } = await req.json();

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

    const systemPrompt = `You are an expert medical triage assistant AI performing a thorough diagnostic consultation. Your job is to analyze patient symptoms and iteratively narrow down to a SINGLE diagnosis through exhaustive follow-up questioning — like a real doctor would.

This is iteration ${iteration} of the diagnostic process.
${previousDiagnoses ? `\nPrevious differential diagnoses were:\n${JSON.stringify(previousDiagnoses, null, 2)}\n\nThe patient has now answered additional questions. Re-evaluate with ALL information and narrow down further.` : ""}

${images && images.length > 0 ? `\nThe patient has uploaded ${images.length} photo(s) of their symptoms. Analyze these images carefully for visual signs such as rashes, swelling, discoloration, wounds, skin conditions, eye redness, etc. Incorporate your visual analysis into the differential diagnosis.\n` : ""}

CRITICAL RULES:
1. Analyze ALL symptoms holistically and provide ranked possible diagnoses with confidence percentages.
2. If you can confidently narrow to 1 diagnosis (top confidence >= 75% AND gap to 2nd place >= 20%), set "isNarrowed" to true. Do NOT generate follow-up questions.
3. If multiple diagnoses remain plausible, you MUST generate 3-5 highly targeted follow-up questions designed to DIFFERENTIATE between the top 2-3 candidates. Be thorough — ask about EVERYTHING.
4. Only set "cannotNarrow" to true after iteration 6+ AND you genuinely cannot distinguish further.
5. If the highest confidence is below 45%, set isInconclusive to true.
6. Always recommend seeing a healthcare professional.
7. For each diagnosis, provide "whereToGo" guidance and urgency level.
8. Be conservative. Patient safety is paramount.

EXHAUSTIVE FOLLOW-UP GUIDELINES — ask about:
- EXACT body location (left/right, front/back, upper/lower, specific area)
- Character (sharp, dull, burning, aching, throbbing, cramping, shooting)
- Aggravating factors (movement, eating, breathing, position, time of day)
- Relieving factors (rest, heat, cold, medication, position change)
- Associated symptoms the patient may not have mentioned
- Radiation (does it spread? where?)
- Onset details (what were you doing when it started?)
- Red-flag symptoms specific to the conditions you're considering
- Home tests ("does pressing firmly on [area] reproduce the pain?")
- Recent changes (diet, activity, stress, medications, environment)
- Family history of conditions you're considering
- Whether this has happened before
- Severity compared to previous episodes if recurring

FOLLOW-UP QUESTION FORMAT:
Each question must have:
- id: unique string (e.g., "followup_${iteration}_1")
- question: clear, patient-friendly text (no medical jargon)
- description: WHY you're asking this (e.g., "This helps us tell the difference between X and Y")
- type: ALWAYS "multi" (users can select multiple options)
- options: 4-6 options per question, each with {id, label, description?}. Always include an "Other / None of the above" option.

You MUST respond with valid JSON:
{
  "diagnoses": [
    {
      "condition": "string",
      "confidence": number 0-100,
      "description": "string - brief plain-language explanation",
      "urgency": "emergency" | "urgent" | "routine" | "self-care",
      "recommendations": ["string array"],
      "whereToGo": "string"
    }
  ],
  "isNarrowed": boolean,
  "cannotNarrow": boolean,
  "isInconclusive": boolean,
  "followUpQuestions": [
    {
      "id": "string",
      "question": "string",
      "description": "string",
      "type": "multi",
      "options": [{"id": "string", "label": "string", "description": "string"}]
    }
  ],
  "narrowingReason": "string - brief explanation of what you're trying to differentiate",
  "disclaimer": "string"
}

Provide 1-5 possible diagnoses ranked by likelihood. Include followUpQuestions ONLY when isNarrowed is false and cannotNarrow is false.`;

    // Build messages array — support multimodal if images provided
    const userContent: any[] = [];
    
    userContent.push({
      type: "text",
      text: `Analyze these patient-reported symptoms and ${iteration === 0 ? "provide initial differential diagnoses" : "narrow down the diagnosis based on the new information"}:\n\n${symptomSummary}`,
    });

    // Add images as base64 for multimodal analysis
    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images.slice(0, 4)) {
        // img is a data URL like "data:image/jpeg;base64,..."
        if (typeof img === "string" && img.startsWith("data:")) {
          const [meta, base64] = img.split(",");
          const mimeMatch = meta.match(/data:(.*?);/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          userContent.push({
            type: "image_url",
            image_url: { url: img },
          });
        }
      }
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: images && images.length > 0 ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: userContent.length === 1 ? userContent[0].text : userContent,
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

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = {
        diagnoses: [
          {
            condition: "Assessment Incomplete",
            confidence: 20,
            description: "We were unable to generate a reliable analysis from the provided information.",
            urgency: "routine",
            recommendations: ["Please consult with a healthcare professional for a proper evaluation"],
            whereToGo: "General Practitioner",
          },
        ],
        isNarrowed: false,
        cannotNarrow: true,
        isInconclusive: true,
        followUpQuestions: [],
        disclaimer: "This tool provides preliminary analysis only. Always consult a licensed healthcare professional.",
      };
    }

    // Safety: if top confidence < 50, force inconclusive
    if (parsed.diagnoses?.[0]?.confidence < 50) {
      parsed.isInconclusive = true;
    }

    // Ensure fields exist
    parsed.isNarrowed = parsed.isNarrowed ?? false;
    parsed.cannotNarrow = parsed.cannotNarrow ?? false;
    parsed.isInconclusive = parsed.isInconclusive ?? false;
    parsed.followUpQuestions = parsed.followUpQuestions ?? [];

    // Force all follow-up questions to be multi-select
    for (const q of parsed.followUpQuestions) {
      q.type = "multi";
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
