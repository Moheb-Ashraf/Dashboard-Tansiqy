const axios = require("axios");

module.exports = async (req, res) => {
  // 1. إعدادات CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 2. معالجة طلبات OPTIONS (Pre-flight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });

  try {
    // 3. تحديد الرابط المستهدف (تأكد إذا كان السيرفر يدعم https جرب تغييره لاحقاً)
    const targetUrl = `http://tansiqy.runasp.net/${path}`;

    // 4. تجهيز البيانات (في Vercel الـ req.body غالباً يأتي كـ Object جاهز)
    const bodyData = req.body;

    console.log(`Proxying ${req.method} request to: ${targetUrl}`);

    // 5. إرسال الطلب للسيرفر الحقيقي
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: bodyData,
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || "",
        "User-Agent": "Mozilla/5.0 (Vercel Serverless Function)" // إضافة User-Agent مهمة أحياناً
      },
      // هذا السطر يمنع axios من إلقاء خطأ لو السيرفر رد بـ 401 أو 400
      validateStatus: () => true 
    });

    // 6. إعادة الرد كما هو للفرونت إند
    return res.status(response.status).json(response.data);

  } catch (err) {
    console.error("Proxy Logic Error:", err.message);
    return res.status(500).json({ 
      error: "Internal Proxy Error", 
      details: err.message 
    });
  }
};