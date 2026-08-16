export default async function handler(req, res) {
  // 1️⃣ CORS Headers (সব ধরণের প্লেয়ার ও অ্যাপের পারমিশনের জন্য)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Pre-flight (OPTIONS) রিকোয়েস্ট হ্যান্ডেল
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2️⃣ Query Parameters গ্রহণ
  const { id, token } = req.query;

  // 3️⃣ Validation Check
  if (!token) {
    return res.status(403).send("Access Denied: Token Missing");
  }
  if (!id) {
    return res.status(400).send("Error: Stream ID Missing");
  }

  try {
    // 4️⃣ Encoded Stream Link ডিকোড করা
    const targetUrl = decodeURIComponent(id);

    // URL সঠিক কিনা যাচাই
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      return res.status(400).send("Invalid Stream URL Format");
    }

    // 5️⃣ Smart 302 Redirect (BDIX এবং স্থানীয় ISP নেটওয়ার্ক সমস্যার সমাধানের জন্য)
    res.writeHead(302, {
      "Location": targetUrl,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Access-Control-Allow-Origin": "*"
    });
    return res.end();

  } catch (error) {
    return res.status(500).send("Server Error: " + error.message);
  }
}
