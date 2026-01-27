const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path" });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const response = await axios({
      method: req.method,
      url: `http://tansiqy.runasp.net/${path}`,
      data: body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      validateStatus: () => true 
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Proxy runtime error:", err);
    return res.status(500).json({
      message: "Proxy crashed",
      error: err.message,
    });
  }
};
