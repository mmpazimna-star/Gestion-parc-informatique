const { verifyToken } = require('../auth');

exports.authenticate = verifyToken;

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès interdit' });
        }
        next();
    };
};