import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, preferences } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's favorites and viewing history
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('property_id, properties(*)')
      .eq('user_id', userId);

    if (favError) {
      console.error("Error fetching favorites:", favError);
    }

    // Get all available properties
    const { data: allProperties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available');

    if (propError) {
      throw new Error(`Database error: ${propError.message}`);
    }

    // Extract user preferences from favorites
    const userFavorites = favorites?.map(f => f.properties) || [];
    
    const systemPrompt = `You are an AI real estate recommendation engine for a Vietnamese property website. Analyze the user's behavior and preferences to recommend properties.

User's favorite properties:
${JSON.stringify(userFavorites, null, 2)}

User preferences: ${JSON.stringify(preferences || {}, null, 2)}

All available properties:
${JSON.stringify(allProperties, null, 2)}

Task: Based on the user's favorites and preferences, recommend 8 properties that they might be interested in. Consider:
- Property types they've liked before
- Price ranges they prefer
- Locations they've shown interest in
- Amenities that appear in their favorites
- Property sizes (bedrooms, bathrooms, area)

Avoid recommending properties they've already favorited.

Return ONLY a JSON array of property IDs in order of recommendation strength.
Example: ["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8"]`;

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
          { role: "user", content: "Generate personalized property recommendations for this user." }
        ],
        temperature: 0.4,
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

    console.log("AI Recommendations Response:", aiContent);

    // Parse AI response to get property IDs
    let recommendedIds: string[] = [];
    try {
      const jsonMatch = aiContent.match(/\[.*\]/);
      if (jsonMatch) {
        recommendedIds = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: return random properties (excluding favorites)
      const favoriteIds = userFavorites.map(f => f.id);
      recommendedIds = allProperties
        .filter(p => !favoriteIds.includes(p.id))
        .slice(0, 8)
        .map(p => p.id);
    }

    // Get the recommended properties in order
    const recommendedProperties = recommendedIds
      .map(id => allProperties.find(p => p.id === id))
      .filter(p => p !== undefined)
      .slice(0, 8);

    // If we don't have enough results, add more properties
    if (recommendedProperties.length < 8) {
      const favoriteIds = userFavorites.map(f => f.id);
      const usedIds = recommendedProperties.map(p => p.id);
      const remainingProperties = allProperties
        .filter(p => !favoriteIds.includes(p.id) && !usedIds.includes(p.id))
        .slice(0, 8 - recommendedProperties.length);
      recommendedProperties.push(...remainingProperties);
    }

    return new Response(
      JSON.stringify({
        recommendations: recommendedProperties,
        total: recommendedProperties.length,
        basedOn: {
          favorites: userFavorites.length,
          preferences: Object.keys(preferences || {}).length
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in ai-recommendations function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});