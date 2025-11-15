import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const assistantSchema = z.object({
      type: z.enum(['generate_description', 'price_estimate', 'investment_advice']),
      data: z.object({
        title: z.string().max(200).optional(),
        description: z.string().max(5000).optional(),
        price: z.number().min(0).max(1000000000000).optional(),
        location: z.string().max(200).optional(),
        area: z.number().min(0).max(100000).optional(),
        bedrooms: z.number().min(0).max(50).optional(),
        bathrooms: z.number().min(0).max(50).optional(),
        property_type: z.string().max(50).optional(),
        amenities: z.array(z.string().max(100)).max(50).optional(),
        additional_info: z.string().max(1000).optional(),
        additional_context: z.string().max(1000).optional(),
        rental_estimate: z.number().min(0).max(1000000000000).optional(),
        market_context: z.string().max(500).optional(),
      }),
    });

    const body = await req.json();
    const validationResult = assistantSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, data } = validationResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "generate_description":
        systemPrompt = `You are a professional Vietnamese real estate copywriter. Create compelling, detailed property descriptions in Vietnamese that attract potential buyers/renters.

Guidelines:
- Write in professional but engaging Vietnamese
- Highlight key features and benefits
- Include information about location advantages
- Mention nearby amenities and conveniences
- Use persuasive but honest language
- Keep it between 100-300 words
- Focus on lifestyle benefits, not just specifications`;

        userPrompt = `Create a property description for:
Title: ${data.title}
Type: ${data.property_type}
Location: ${data.location}
Price: ${data.price} VND
Area: ${data.area} m²
Bedrooms: ${data.bedrooms}
Bathrooms: ${data.bathrooms}
Amenities: ${data.amenities?.join(', ') || 'None specified'}

Additional info: ${data.additional_info || 'None'}`;
        break;

      case "price_estimate":
        systemPrompt = `You are a Vietnamese real estate valuation expert. Provide price estimates and market analysis based on property details.

Guidelines:
- Consider location, property type, size, and amenities
- Provide price range in Vietnamese Dong
- Explain factors affecting the price
- Give market context for the area
- Be realistic and conservative in estimates
- Mention any limitations in your analysis`;

        userPrompt = `Estimate the market value for this property:
Type: ${data.property_type}
Location: ${data.location}
Area: ${data.area} m²
Bedrooms: ${data.bedrooms}
Bathrooms: ${data.bathrooms}
Current asking price: ${data.price} VND
Amenities: ${data.amenities?.join(', ') || 'Basic'}

Additional context: ${data.additional_context || 'None'}`;
        break;

      case "investment_advice":
        systemPrompt = `You are a Vietnamese real estate investment advisor. Provide investment analysis and advice for properties.

Guidelines:
- Analyze investment potential
- Consider rental yield, appreciation potential
- Discuss location advantages/disadvantages  
- Mention market trends
- Provide risk assessment
- Give actionable advice
- Write in Vietnamese`;

        userPrompt = `Analyze the investment potential of:
Type: ${data.property_type}
Location: ${data.location}
Price: ${data.price} VND
Area: ${data.area} m²
Rental potential: ${data.rental_estimate || 'Unknown'} VND/month

Market context: ${data.market_context || 'General market'}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid type. Supported types: generate_description, price_estimate, investment_advice" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No AI response content");
    }

    return new Response(
      JSON.stringify({
        type,
        result: content,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in ai-property-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});