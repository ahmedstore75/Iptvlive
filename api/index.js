export default async function handler(req, res) {
  // 1️⃣ CORS Headers (সব প্লেয়ার ও ব্রাউজারে চালুর জন্য)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Pre-flight request হ্যান্ডেল করা
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id, token } = req.query;

  // 2️⃣ Token এবং ID ভ্যালিডেশন
  if (!token) {
    return res.status(403).send("Access Denied: Token Missing");
  }
  if (!id) {
    return res.status(400).send("Error: Stream ID Missing");
  }

  try {
    // 3️⃣ Encoded URL ডিকোড করা
    const targetUrl = decodeURIComponent(id);

    // 4️⃣ Direct 302 Redirect (ডিফল্ট প্লেয়ারগুলোকে সরাসরি স্ট্রিমে পাঠাতে)
    if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
      return res.redirect(302, targetUrl);
    } else {
      return res.status(400).send("Invalid Stream URL format");
    }

  } catch (error) {
    return res.status(500).send("Server Error: " + error.message);
  }
}
