const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth.middleware");
const userRouter = Router();

userRouter.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields: name, email and password" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (role && role !== "user" && role !== "admin") {
            return res.status(400).json({ message: "Invalid role" });
        }

        // check if user exists

        const isExist = await User.findOne({ email });

        if (isExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // encrypt password 
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // create user
        const user = {
            name,
            email,
            password: hashedPassword,
            role: role || "user",
        }

        // save user

        const newUser = new User(user);
        await newUser.save();

        if(newUser) {
            return res.status(201).json({ message: "User created successfully" });
        }

        return res.status(500).json({ message: "Unable to create user" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Missing required fields: email and password" });
        }

        // check if user exists
        const isExist = await User.findOne({ email });

        if (!isExist) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // check if password is correct

        const isPasswordCorrect = bcrypt.compareSync(password, isExist.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // create token
        const token = jwt.sign({ id: isExist._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // return token
        return res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRouter.get("/profile", authMiddleware, async (req, res) => {
    try {
        const { id } = req.userData;

        const user = await User.findById({_id:id}).select("-password -__v");

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = userRouter;