import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const dayReadingSchema = z.object({
  book: z.string(),
  chapter: z.string(),
  startVerse: z.number().optional(),
  endVerse: z.number().optional(),
});

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    days: z
      .object({
        monday: z.array(dayReadingSchema),
        tuesday: z.array(dayReadingSchema),
        wednesday: z.array(dayReadingSchema),
        thursday: z.array(dayReadingSchema),
        friday: z.array(dayReadingSchema),
        saturday: z.array(dayReadingSchema),
        sunday: z.array(dayReadingSchema),
      })
      .optional(),
  }),
});

export const collections = { blog };
