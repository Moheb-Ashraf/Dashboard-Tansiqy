import axios from "axios";

export const config = {
    api: {
        bodyParser: false, // إيقاف الـ body parser عشان نتحكم فيه بنفسنا
    },
};

// Helper لقراءة الـ raw body كـ Buffer
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

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
        // استخدام https مش http
        const targetUrl = `https://tansiqy.runasp.net/${path}`;

        // قراءة الـ raw body بدون أي تعديل
        const rawBody = await getRawBody(req);

        const requestHeaders = {
            Authorization: req.headers.authorization || "",
            Accept: req.headers.accept || "application/json",
            "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        };

        // تمرير الـ Content-Type كما هو (مع الـ boundary الخاص بـ multipart)
        if (req.headers["content-type"]) {
            requestHeaders["Content-Type"] = req.headers["content-type"];
        }

        const response = await axios({
            method: req.method,
            url: targetUrl,
            // تمرير الـ Buffer مباشرة بدون تحويل
            data: rawBody.length > 0 ? rawBody : undefined,
            headers: requestHeaders,
            validateStatus: () => true,
            // منع axios من تحويل البيانات
            transformRequest: [(data) => data],
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        // الرد للفرونت إند
        return res.status(response.status).json(response.data);

    } catch (err) {
        console.error("PROXY_ERROR:", err.message);
        return res.status(500).json({
            error: "Proxy internal error",
            message: err.message
        });
    }
}