import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const searchSchema = z.object({
      query: z.string().min(1).max(500),
      location: z.string().max(200).optional(),
      budget: z.number().min(0).max(1000000000000).optional(),
      propertyType: z.enum(['apartment', 'house', 'villa', 'townhouse', 'land', 'penthouse', 'office', 'shop']).optional(),
    });

    const body = await req.json();
    const validationResult = searchSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, location, budget, propertyType } = validationResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all available properties
    const { data: properties, error: dbError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available');

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Use AI to understand the search query and find matching properties
    const systemPrompt = `You are a Vietnamese real estate search assistant. Your task is to analyze a user's search query and return the most relevant properties from the available properties database.

User's search query: "${query}"
Additional filters: Location: ${location || 'any'}, Budget: ${budget || 'any'}, Property Type: ${propertyType || 'any'}

Available properties data:
${JSON.stringify(properties, null, 2)}

Instructions:
- Analyze the user's natural language query to understand their needs
- Consider location preferences, budget, property type, amenities, and other requirements
- Rank properties by relevance to the user's query
- Return the top 6 most relevant property IDs
- Consider Vietnamese language nuances and location names
- If user mentions specific neighborhoods or areas, prioritize those
- If user mentions amenities or features, match those to the properties' amenities arrays

Return ONLY a JSON array of property IDs in order of relevance (most relevant first).
Example: ["id1", "id2", "id3"]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Find properties matching: ${query}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No AI response content");
    }

    console.log("AI Response:", aiContent);

    // Parse AI response to get property IDs
    let propertyIds: string[] = [];
    try {
      // Extract JSON array from AI response
      const jsonMatch = aiContent.match(/\[.*\]/);
      if (jsonMatch) {
        propertyIds = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: return first 6 properties
      propertyIds = properties.slice(0, 6).map(p => p.id);
    }

    // Get the recommended properties in order
    const recommendedProperties = propertyIds
      .map(id => properties.find(p => p.id === id))
      .filter(p => p !== undefined)
      .slice(0, 6); // Limit to 6 results

    // If we don't have enough results, add more properties
    if (recommendedProperties.length < 6) {
      const remainingProperties = properties
        .filter(p => !propertyIds.includes(p.id))
        .slice(0, 6 - recommendedProperties.length);
      recommendedProperties.push(...remainingProperties);
    }

    return new Response(
      JSON.stringify({
        properties: recommendedProperties,
        query: query,
        total: recommendedProperties.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in ai-search function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});