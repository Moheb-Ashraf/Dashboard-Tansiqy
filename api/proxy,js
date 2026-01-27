const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { path } = req.query;

    try {
        const response = await axios({
            method: req.method,
            url: `http://tansiqy.runasp.net/${path}`,
            data: req.body,
            headers: { 
                'Authorization': req.headers.authorization || '',
                'Content-Type': 'application/json'
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Vercel Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed" });
    }
};