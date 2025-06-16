import OpenAI from "openai";
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getCollection } from "astro:content";
import { getSession } from "auth-astro/server";

export const generate_image = {
  generateImage: defineAction({
    input: z.object({
      post_id: z.string(),
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
        const response = await openai.responses.create({
          model: "gpt-4.1-mini",
          input: `Generate an image for this blog post: ${post.data.description}`,
          tools: [
            {
              type: "image_generation",
              quality: "low",
              output_format: "jpeg",
              output_compression: 100,
            },
          ],
        });
        const imageData = response.output
          .filter((output) => output.type === "image_generation_call")
          .map((output) => output.result);

        if (imageData.length > 0) {
          const imageBase64 = imageData[0];

          return imageBase64;
        }
      } catch (e) {
        console.error(e);
      }

      return "error";
    },
  }),
};
