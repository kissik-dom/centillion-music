export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(request.url);
    const predictionId = url.searchParams.get("id");

    if (!predictionId) {
      return new Response(
        JSON.stringify({ error: "Prediction ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "API token not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch prediction status" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const prediction = await response.json();

    return new Response(
      JSON.stringify({
        status: prediction.status,
        output: prediction.output,
        error: prediction.error,
        metrics: prediction.metrics,
        logs: prediction.logs?.slice(-500),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
