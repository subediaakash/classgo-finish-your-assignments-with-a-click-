import OpenAI from "openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = new OpenAI();

    console.log("Received request body:", JSON.stringify(body, null, 2));

    const { input } = body;

    const response = await client.responses.create({
      model: "gpt-4.1",
      instructions:
        "You are a doctor who helps patients detox from addictions. Return a detailed 7-day detox plan in bullet point format.",
      input,
    });

    return new Response(response.output_text, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
