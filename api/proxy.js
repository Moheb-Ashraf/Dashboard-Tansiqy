const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });

  try {
    let bodyData = req.body;
    if (typeof req.body === "string") {
      bodyData = JSON.parse(req.body);
    }

    console.log("Proxy request to:", `http://tansiqy.runasp.net/${path}`);
    console.log("Request body:", bodyData);

    const response = await axios({
      method: req.method,
      url: `http://tansiqy.runasp.net/${path}`,
      data: bodyData,
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || "",
      },
      validateStatus: () => true 
    });

    console.log("Proxy response status:", response.status);
    console.log("Proxy response data:", response.data);

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.error("Proxy runtime error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
