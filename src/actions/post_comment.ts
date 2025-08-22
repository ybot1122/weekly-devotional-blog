import { neon } from "@neondatabase/serverless";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getCollection } from "astro:content";

const sql = neon(import.meta.env.DATABASE_URL);

const pages = await getCollection("blog");
const valid_ids = pages.map((page) => page.data.id);

export const post_comment = {
  postComment: defineAction({
    input: z.object({
      article_id: z.string(),
      comment: z.string(),
      author: z.string(),
      token: z.string(),
    }),
    handler: async (input, ctx) => {
      const article_id = input.article_id;
      if (!valid_ids.includes(article_id)) {
        throw new Error("Invalid article_id");
      }

      // Validate the token with Google reCAPTCHA API
      const recaptchaRes = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: import.meta.env.RECAPTCHA_SECRET_KEY,
            response: input.token,
          }),
        }
      );
      const recaptchaData = await recaptchaRes.json();
      if (!recaptchaData.success) {
        throw new Error("reCAPTCHA validation failed");
      }

      // Insert the new comment
      await sql`
        INSERT INTO comments (article_id, content, author)
        VALUES (${article_id}::uuid, ${input.comment}, ${input.author})
      `;

      return "success";
    },
  }),
};
