const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.artisanmate.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const origin = request.headers.get("Origin");
    if (origin !== "https://www.artisanmate.com") {
      return json({ error: "Origin not allowed." }, 403);
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/generate-design") {
      return json({ error: "Not found." }, 404);
    }

    try {
      const body = await request.json();
      if (!body.image || !body.mimeType || !body.prompt) {
        return json({ error: "Missing image or prompt." }, 400);
      }

      const input = [
        { type: "text", text: body.prompt },
        {
          type: "image",
          mime_type: body.mimeType,
          data: body.image
        }
      ];

      const googleResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            model: "gemini-3.1-flash-image",
            input,
            response_format: {
              type: "image",
              mime_type: "image/jpeg",
              aspect_ratio: "4:3",
              image_size: "1K"
            }
          })
        }
      );

      const result = await googleResponse.json();

      if (!googleResponse.ok) {
        console.error("Gemini error", result);
        return json({ error: "The image service returned an error. Please try again." }, 502);
      }

      const image = result?.output_image?.data;
      if (!image) {
        console.error("No output image", result);
        return json({ error: "No design image was returned. Please try again." }, 502);
      }

      return json({ image: `data:image/jpeg;base64,${image}` });
    } catch (error) {
      console.error("Worker error", error);
      return json({ error: "Unable to generate the design right now." }, 500);
    }
  }
};
