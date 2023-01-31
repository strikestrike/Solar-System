const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, process.env.secretKey);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }

    if (req.params.userId) {
        if (req.user.role == constants.ROLE_CUSTOMER &&
            req.user.id != req.params.userId) {
            return res.status(403).send("Not authorized");
        }
        if (req.user.role == constants.ROLE_COMPANY_ADMIN) {
            const paramUser = await User.findByPk(req.params.userId);
            if (!paramUser || !paramUser.company) {
                return res.status(403).send("Not authorized");
            }
            if (req.user.company_id != paramUser.company_id) {
                return res.status(403).send("Not authorized");
            }
        }
    }

    if (req.params.companyId) {
        if ((req.user.role == constants.ROLE_COMPANY_ADMIN && req.user.company_id != req.params.companyId) ||
            req.user.role == constants.ROLE_CUSTOMER) {
            return res.status(403).send("Not authorized");
        }
    }

    if (req.params.converterId) {
        const paramConverter = await User.findByPk(req.params.converterId);
        if ((req.user.role == constants.ROLE_COMPANY_ADMIN && req.user.company_id != paramConverter.company_id) ||
            (req.user.role == constants.ROLE_CUSTOMER && req.user.id != paramConverter.user_id)) {
            return res.status(403).send("Not authorized");
        }
    }

    return next();
};

module.exports = verifyToken;