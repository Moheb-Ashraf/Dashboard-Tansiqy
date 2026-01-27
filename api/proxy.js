const axios = require("axios");

module.exports = async (req, res) => {
    // إعدادات الـ CORS
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { path } = req.query;
    if (!path) {
        return res.status(400).json({ error: "Missing path parameter" });
    }

    try {
        const targetUrl = `http://tansiqy.runasp.net/${path}`;
        
        // --- الحل الأهم لخطأ 500 ---
        // تأكد من أن bodyData هو Object دائماً
        let bodyData = req.body;
        if (typeof bodyData === 'string' && bodyData.length > 0) {
            try {
                bodyData = JSON.parse(bodyData);
            } catch (e) {
                console.error("Failed to parse body string");
            }
        }

        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: bodyData,
            headers: {
                "Content-Type": "application/json",
                "Authorization": req.headers.authorization || "",
                "Accept": "application/json"
            },
            validateStatus: () => true 
        });

        return res.status(response.status).json(response.data);

    } catch (err) {
        // طباعة الخطأ في Vercel Logs لنعرف السبب الحقيقي
        console.error("PROXY_ERROR:", err.message);
        return res.status(500).json({ 
            error: "Proxy error", 
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};