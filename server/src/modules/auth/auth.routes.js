const express = require("express");

const {
    login,
    getProfile,
    addStaff,
} = require("./auth.controller");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticate, getProfile);

router.post(
    "/staff",
    authenticate,
    authorize("ADMIN"),
    addStaff
);

router.post(
    "/users",
    authenticate,
    authorize("ADMIN"),
    addStaff
);

module.exports = router;