const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
    try {
        const {id} = req.userData;
        
        const isExist = await User.findById({_id:id}).select("+role");

        if (!isExist) {
            return res.status(400).json({ message: "User does not exist" });
        }

        if (isExist.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized, only admin allowed" });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = adminMiddleware;