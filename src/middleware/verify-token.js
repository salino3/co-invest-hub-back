const jwt = require("jsonwebtoken");
// node-mysql-jsonwebtoken-02
const verifyJWT = (key = "") => {
  return (req, res, next) => {
    const endToken = req.headers["end_token"];

    if (!endToken) {
      return res
        .status(400)
        .send({ message: "Numbers (cookie identifier) is missing." });
    }

    const cookieName = `auth_token_${endToken}`;

    const cookieValue = req.cookies[cookieName];
    if (!cookieValue) {
      return res.status(400).send({ message: `Cookie end code is missing.` });
    }

    try {
      const decoded = jwt.verify(cookieValue, process.env.SECRET_KEY);
      if (key) {
        // Verification IDs

        const paramsId = req.params[key];
        if (decoded.id != paramsId) {
          return res.status(401).send({ message: "Unauthorized." });
        }
        req[key] = decoded[key];
        next();
      } else {
        if (decoded) {
          const userId = req.params.userId;
          const comapnyId = req.params.comapnyId;
          if (userId == decoded?.id || comapnyId == decoded?.id) {
            next();
          } else {
            return res
              .status(403)
              .send({ message: "Forbidden: Invalid token." });
          }
          //
        } else {
          return res.status(403).send({ message: "Forbidden: Invalid token." });
        }
      }
    } catch (error) {
      return res.status(403).send({ message: "Forbidden: Invalid token." });
    }
  };
};

module.exports = { verifyJWT };
