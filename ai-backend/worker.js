const allowedOrigins = new Set([
  "https://www.artisanmate.com",
  "https://artisanmate.com"
]);

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin)
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (origin && !allowedOrigins.has(origin)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "artisan-mate-ai",
        configured: Boolean(env.GEMINI_API_KEY)
      }, 200, origin);
    }

    if (origin && !allowedOrigins.has(origin)) {
      return json({ error: "Origin not allowed." }, 403, origin);
    }

    if (request.method !== "POST" || url.pathname !== "/generate-design") {
      return json({ error: "Not found." }, 404, origin);
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: "AI service is not configured yet." }, 503, origin);
    }

    try {
      const body = await request.json();

      if (!body.image || !body.mimeType || !body.prompt) {
        return json({ error: "Missing image or prompt." }, 400, origin);
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
        return json({
          error: "The image service returned an error.",
          detail: result?.error?.message || null
        }, 502, origin);
      }

      const image = result?.output_image?.data;

      if (!image) {
        console.error("No output image", result);
        return json({
          error: "No design image was returned."
        }, 502, origin);
      }

      return json({
        image: `data:image/jpeg;base64,${image}`
      }, 200, origin);
    } catch (error) {
      console.error("Worker error", error);
      return json({
        error: "Unable to generate the design right now."
      }, 500, origin);
    }
  }
};
