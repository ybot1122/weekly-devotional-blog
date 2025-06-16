import OpenAI from "openai";
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getCollection } from "astro:content";
import { getSession } from "auth-astro/server";

const toneInstructions = {
  serious: "Speak in a serious tone, but not overly strict or stern.",
  upbeat: "Speak in a cheerful and positive tone.",
  curious: "Speak in a wondrous and awe-struck tone.",
  dire: "Speak in a grave and dire tone. Very serious.",
  casual: "Speak as if we were chit chatting in the front lawn.",
};

export const tts = {
  tts: defineAction({
    input: z.object({
      post_id: z.string(),
      voice: z.enum([
        "alloy",
        "ash",
        "ballad",
        "coral",
        "echo",
        "fable",
        "onyx",
        "nova",
        "sage",
        "shimmer",
        "verse",
      ]),
      tone: z.enum(["serious", "upbeat", "curious", "dire", "casual"]),
    }),
    handler: async (input, ctx) => {
      const session = await getSession(ctx.request);

      if (session?.user?.email !== "liutoby92@gmail.com") {
        return "error";
      }

      const post = (await getCollection("blog")).filter(
        (a) => a.id === input.post_id
      )[0];

      try {
        const mp3 = await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: input.voice,
          input: post.data.description,
          instructions: toneInstructions[input.tone],
          response_format: "wav",
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const b64 = buffer.toString("base64");

        return b64;
      } catch (e) {
        console.error(e);
      }

      return "error";
    },
  }),
};
