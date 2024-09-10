const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).json({ error: true, message: "Access denied." });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, cafeOwner) => {
        if (err) return res.status(403).json({ error: true, message: "Invalid token." });
        req.cafeOwner = cafeOwner;
        next();
    });
};
