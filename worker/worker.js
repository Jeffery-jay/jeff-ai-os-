const ALLOWED_ORIGIN = "https://jeffery-jay.github.io";
const MODEL = "gemini-3.6-flash";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin"
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin)
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // Handle browser CORS preflight requests.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    // Basic health check.
    if (request.method === "GET") {
      return jsonResponse({
        agent: "JEFF AI - Agent 001",
        status: "alive",
        message: "JEFF AI is alive 🤖"
      }, 200, origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({
        error: "Method not allowed"
      }, 405, origin);
    }

    // Do not allow browser requests from unknown websites.
    if (origin && origin !== ALLOWED_ORIGIN) {
      return jsonResponse({
        error: "Origin not allowed"
      }, 403, origin);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({
        error: "The Gemini API key is not configured in Cloudflare."
      }, 500, origin);
    }

    try {
      const body = await request.json();
      const message =
        typeof body.message === "string" ? body.message.trim() : "";

      if (!message) {
        return jsonResponse({
          error: "Please enter a message."
        }, 400, origin);
      }

      if (message.length > 10000) {
        return jsonResponse({
          error: "Your message is too long. Please shorten it."
        }, 413, origin);
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: message }]
            }]
          })
        }
      );

      const result = await geminiResponse.json();

      if (!geminiResponse.ok) {
        console.error("Gemini API error:", geminiResponse.status, result);

        return jsonResponse({
          error: "Gemini could not complete the request.",
          status: geminiResponse.status
        }, 502, origin);
      }

      const answer = result.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

      if (!answer) {
        console.error("Unexpected Gemini response:", result);

        return jsonResponse({
          error: "Gemini returned no text. Please try again."
        }, 502, origin);
      }

      return jsonResponse({
        agent: "JEFF AI - Agent 001",
        response: answer
      }, 200, origin);

    } catch (error) {
      console.error("JEFF Worker error:", error);

      return jsonResponse({
        error: "JEFF could not process the request. Check the Worker logs."
      }, 500, origin);
    }
  }
};
