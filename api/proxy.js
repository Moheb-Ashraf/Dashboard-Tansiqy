/* global Buffer */
import axios from "axios";

const API_BASE = "https://tansiqy.runasp.net";

export const config = {
    api: {
        bodyParser: false,
    },
};

function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

function sendProxyResponse(res, response) {
    const status = response.status;

    if (status === 204 || response.data === "" || response.data == null) {
        return res.status(status).end();
    }

    const contentType = response.headers?.["content-type"] || "";

    if (contentType.includes("application/json") || typeof response.data === "object") {
        return res.status(status).json(response.data);
    }

    return res.status(status).send(response.data);
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const pathParam = req.query.path;
    if (!pathParam || Array.isArray(pathParam)) {
        return res.status(400).json({ error: "Missing or invalid path parameter" });
    }

    const apiPath = String(pathParam).replace(/^\//, "");
    const targetUrl = `${API_BASE}/${apiPath}`;

    try {
        const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"];
        let rawBody = Buffer.alloc(0);

        if (methodsWithBody.includes(req.method)) {
            const contentLength = parseInt(req.headers["content-length"] || "0", 10);
            if (contentLength > 0) {
                rawBody = await getRawBody(req);
            }
        }

        const requestHeaders = {
            Authorization: req.headers.authorization || "",
            Accept: req.headers.accept || "application/json",
            "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        };

        if (req.headers["content-type"]) {
            requestHeaders["Content-Type"] = req.headers["content-type"];
        }

        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: rawBody.length > 0 ? rawBody : undefined,
            headers: requestHeaders,
            validateStatus: () => true,
            transformRequest: [(data) => data],
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        return sendProxyResponse(res, response);
    } catch (err) {
        console.error("PROXY_ERROR:", err.message);
        return res.status(500).json({
            error: "Proxy internal error",
            message: err.message,
        });
    }
}
