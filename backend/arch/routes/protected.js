const express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken')

module.exports = () => {
    const router = express.Router();

    router.get('/', verifyToken, (req, res) => {
        res.json({ message: `Welcome, ${req.user.username}!`, user: req.user });
    });

    return router;
};
