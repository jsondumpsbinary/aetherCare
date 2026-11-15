
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource.",
            });
        }

        next();
    };
}

function authorizeMethods(methodRoles) {
    return (req, res, next) => {
        const allowedRoles =
            methodRoles[req.method] ||
            (req.method === "HEAD" ? methodRoles.GET : undefined) ||
            [];

        return authorize(...allowedRoles)(req, res, next);
    };
}

module.exports = authorize;
module.exports.authorizeMethods = authorizeMethods;
