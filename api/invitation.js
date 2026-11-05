
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const code = (req.query.code || "").trim().toUpperCase();

  if (!/^[A-Z0-9]+$/.test(code)) {
    return res.status(400).json({ error: "Invalid classroom code." });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: "Server configuration is missing." });
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/rpc/get_public_classroom_invitation`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code_input: code })
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Could not check this invitation." });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Invitation not found or expired." });
    }

    return res.status(200).json(data[0]);

  } catch (error) {
    return res.status(500).json({ error: "Unable to connect to the database." });
  }
}
