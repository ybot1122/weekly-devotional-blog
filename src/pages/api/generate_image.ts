import OpenAI from "openai";
export const prerender = false; // Not needed in 'server' mode
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;

import type { APIRoute } from "astro";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const GET: APIRoute = async ({ request }) => {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input:
      "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{ type: "image_generation" }],
  });

  const imageData = response.output
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (imageData.length > 0) {
    const imageBase64 = imageData[0];

    return new Response(
      JSON.stringify({
        payload: imageBase64,
      })
    );
  }
  return new Response(
    JSON.stringify({
      message: "Something went wrong",
    }),
    { status: 500 }
  );
};
