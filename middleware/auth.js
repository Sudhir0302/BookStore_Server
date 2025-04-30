const jwt = require("jsonwebtoken");
require('dotenv').config();

const auth = (req, res, next) => {

    const token=req.cookies.token;  

    // console.log('Token received:', token);

    if (!token) {
        return res.status(401).send({ message: "Token missing" }); 
    }

    try {
        const decoded = jwt.verify(token, process.env.secret_key);
        req.user = decoded;
        next(); 
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(400).send({ message: "Invalid token or token expired" });
    }
};

module.exports = auth;
