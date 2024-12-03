// middlewares/checkAdmin.js
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Admins only' });
    }
};

module.exports = checkAdmin;
