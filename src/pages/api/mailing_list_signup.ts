export const prerender = false; // Not needed in 'server' mode

import type { APIRoute } from "astro";
import { sendTransactionalEmail } from "@ybot1122/toby-ui/Sdk/Brevo/sendTransactionalEmail";

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get("name")?.toString();
  const email = data.get("email")?.toString();

  const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    return new Response(
      JSON.stringify({
        message: "Missing API key",
      }),
      { status: 500 }
    );
  }

  if (!name || !email) {
    return new Response(
      JSON.stringify({
        message: "Missing required fields",
      }),
      { status: 400 }
    );
  }

  const res = await sendTransactionalEmail({
    senderName: name,
    senderEmail: email,
    recipientEmail: "ybotuil2211@gmail.com",
    recipientName: "Toby",
    subject: `New mailing list signup from ${name}`,
    brevoApiKey: BREVO_API_KEY,
    htmlContent: `
      <p>You have a new mailing list signup!</p>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
    `,
  });

  console.log(res);

  if (!res) {
    return new Response(
      JSON.stringify({
        message: "Something went wrong",
      }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Success!",
    }),
    { status: 200 }
  );
};
