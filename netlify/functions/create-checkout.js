const ANNUAL_PRICE_ID = "price_1TZgGGKTZAkGckxSjprtDoXq";

export default async (req) => {
  const { priceId, email } = await req.json();

  const isSubscription = priceId === ANNUAL_PRICE_ID;

  const params = new URLSearchParams({
    "mode": isSubscription ? "subscription" : "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "success_url": "https://app.snapprotein.com/?paid=true",
    "cancel_url": "https://app.snapprotein.com/",
  });

  if (email) {
    params.set("customer_email", email);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = await response.json();

  return new Response(JSON.stringify({ url: session.url }), {
    status: response.ok ? 200 : 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/create-checkout" };