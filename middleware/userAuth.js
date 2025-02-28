const jwt = require('jsonwebtoken');
const usermodel = require("../model/userModel");

const secretKey = "secretkey";

async function verification(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, authData) => {
            console.log("token value",token)
            if (err) {
                console.log("Token verification failed:", err);
                return resolve(0);
            }
            if (authData && authData.data && authData.data.id) {
                console.log("here is checked the condition")
                console.log(authData)
                return resolve(authData);
            } else {
                console.log("Invalid token structure");
                return resolve(0);
            }
        });
    });
}

module.exports = {
    verifyToken: async (req, res, next) => {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            console.log("Token is provided...");
            const bearer = bearerHeader.split(" ");
            const token = bearer[1];
            req.token = token;

            try {
                const userId = await verification(token);
                if (userId === 0) {
                    return res.status(403).json({
                        responseCode: 403,
                        responseMessage: "Invalid token",
                    });
                }
                req.user = userId; 
                
                console.log(userId)
                next();
            } catch (error) {
                console.error("Token verification error:", error);
                return res.status(500).json({
                    responseCode: 500,
                    responseMessage: "Internal server error",
                });
            }
        } else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: 'Token cannot be empty',
            });
        }
    }
};
