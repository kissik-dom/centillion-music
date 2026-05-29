export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const {
      prompt,
      duration = 15,
      inputAudio,
      modelVersion = "stereo-melody-large",
      temperature = 1.0,
      topK = 250,
      topP = 0.0,
      outputFormat = "mp3",
    } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "no_api_key",
          message:
            "Set REPLICATE_API_TOKEN in Vercel environment variables. Get a token at replicate.com/account/api-tokens",
          demo: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build MusicGen input
    const input: Record<string, unknown> = {
      prompt,
      model_version: modelVersion,
      duration: Math.min(Math.max(duration, 1), 300),
      temperature,
      top_k: topK,
      top_p: topP,
      output_format: outputFormat,
      normalization_strategy: "loudness",
    };

    // If user uploaded a beat/melody for conditioning
    if (inputAudio) {
      input.input_audio = inputAudio;
      input.continuation = false;
    }

    // Create prediction via Replicate
    const response = await fetch(
      "https://api.replicate.com/v1/models/meta/musicgen/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({ input }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Music generation failed",
          details:
            response.status === 422
              ? "Invalid parameters"
              : `API error (${response.status})`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const prediction = await response.json();

    // If using Prefer: wait, the prediction may already be complete
    if (prediction.status === "succeeded" && prediction.output) {
      return new Response(
        JSON.stringify({
          status: "succeeded",
          predictionId: prediction.id,
          audioUrl: prediction.output,
          metrics: prediction.metrics,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Otherwise return prediction ID for polling
    return new Response(
      JSON.stringify({
        status: prediction.status,
        predictionId: prediction.id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate music error:", msg);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
