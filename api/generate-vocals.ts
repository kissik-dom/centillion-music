export const config = { runtime: "edge" };

// Bark speaker presets mapped to voice types
const VOICE_PRESETS: Record<string, string[]> = {
  male: [
    "v2/en_speaker_6",
    "v2/en_speaker_7",
    "v2/en_speaker_8",
    "v2/en_speaker_0",
  ],
  female: [
    "v2/en_speaker_1",
    "v2/en_speaker_2",
    "v2/en_speaker_3",
    "v2/en_speaker_9",
  ],
};

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
      text,
      voiceType = "male",
      voiceIndex = 0,
      textTemp = 0.7,
      waveformTemp = 0.7,
    } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text/lyrics are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "no_api_key",
          message:
            "Set REPLICATE_API_TOKEN in Vercel environment variables for vocal generation.",
          demo: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Select speaker preset
    const presets = VOICE_PRESETS[voiceType] || VOICE_PRESETS.male;
    const speaker = presets[voiceIndex % presets.length];

    const input: Record<string, unknown> = {
      prompt: text.slice(0, 1000), // Bark has ~13s limit, keep text reasonable
      text_temp: textTemp,
      waveform_temp: waveformTemp,
      output_full: false,
      history_prompt: speaker,
    };

    const response = await fetch(
      "https://api.replicate.com/v1/models/suno-ai/bark/predictions",
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
      console.error("Replicate Bark error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Vocal generation failed",
          details: `API error (${response.status})`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const prediction = await response.json();

    if (prediction.status === "succeeded" && prediction.output) {
      return new Response(
        JSON.stringify({
          status: "succeeded",
          predictionId: prediction.id,
          audioUrl: prediction.output.audio_out || prediction.output,
          metrics: prediction.metrics,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: prediction.status,
        predictionId: prediction.id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate vocals error:", msg);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
