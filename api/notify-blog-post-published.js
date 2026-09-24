export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const webhookUrl = process.env.MAKE_FACEBOOK_WEBHOOK_URL;
  const webhookApiKey = process.env.MAKE_FACEBOOK_WEBHOOK_APIKEY;

  if (!webhookUrl || !webhookApiKey) {
    res.status(200).json({ success: false, error: "Webhook not configured" });
    return;
  }

  try {
    const { title, url, image, excerpt } = req.body ?? {};

    const makeResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-make-apikey": webhookApiKey,
      },
      body: JSON.stringify({ title, url, image: image ?? null, excerpt: excerpt ?? null }),
    });

    if (!makeResponse.ok) {
      res.status(200).json({ success: false, error: `Make webhook returned ${makeResponse.status}` });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false, error: String(err) });
  }
}
