import axios from "axios";

export default async function handler(req, res) {
    // 1. إعدادات CORS
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // 2. معالجة طلبات OPTIONS
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { path } = req.query;
    if (!path) {
        return res.status(400).json({ error: "Missing path parameter" });
    }

    try {
        const targetUrl = `http://tansiqy.runasp.net/${path}`;
        
        // 3. معالجة البيانات (Vercel يجهز الـ body تلقائياً)
        let bodyData = req.body;

        // 4. إرسال الطلب للسيرفر
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: bodyData,
            headers: {
                "Content-Type": "application/json",
                "Authorization": req.headers.authorization || "",
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0" 
            },
            validateStatus: () => true 
        });

        // 5. الرد للفرونت إند
        return res.status(response.status).json(response.data);

    } catch (err) {
        console.error("PROXY_ERROR:", err.message);
        return res.status(500).json({ 
            error: "Proxy internal error", 
            message: err.message 
        });
    }
}