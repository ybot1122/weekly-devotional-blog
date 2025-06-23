import OpenAI from "openai";
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getCollection } from "astro:content";
import { getSession } from "auth-astro/server";

export const follow_ups = ["More Realistic", "More Detailed", "More Colorful"];

export const generate_image = {
  generateImage: defineAction({
    input: z.object({
      post_id: z.string().optional(),
      follow_up_id: z.number().optional(),
      previous_response_id: z.string().optional(),
    }),
    handler: async (input, ctx) => {
      const session = await getSession(ctx.request);

      if (
        !input.post_id &&
        !input.follow_up_id &&
        !input.previous_response_id
      ) {
        throw new Error(
          "post_id or follow_up_id+previous_response_id is required"
        );
      }

      if (session?.user?.email !== "liutoby92@gmail.com") {
        throw new Error("error");
      }

      let prompt = "";

      if (input.post_id) {
        const post = (await getCollection("blog")).filter(
          (a) => a.id === input.post_id
        )[0];
        prompt = `Genreate an image for this blog post: ${post.data.description}`;
      } else {
        prompt = `Now make it ${follow_ups[input.follow_up_id!]}`;
      }

      try {
        const response = await openai.responses.create({
          model: "gpt-4.1-mini",
          input: prompt,
          previous_response_id: input.previous_response_id,
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

          return { imageBase64, reponse_id: response.id };
        }
      } catch (e) {
        console.error(e);
        throw new Error("Failed to generate image");
      }
    },
  }),
};
