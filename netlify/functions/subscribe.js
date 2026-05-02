export default async (req) => {
  const { email, name, groupId } = await req.json();

  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.VITE_MAILERLITE_API_KEY}`,
    },
    body: JSON.stringify({
      email,
      fields: { name },
      groups: [groupId],
    }),
  });

  return new Response(JSON.stringify({ ok: response.ok }), {
    status: response.ok ? 200 : 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/subscribe" };