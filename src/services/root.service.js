const Router = require("express");

const RootRoute = Router();

RootRoute.use("/test", (req, res) => {
    res.send("Test route");
});

RootRoute.use("/user", require("./user.service"));
RootRoute.use("/glucose", require("./glucose.service"));

module.exports = RootRoute;