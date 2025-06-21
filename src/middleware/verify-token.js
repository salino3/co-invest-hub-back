const jwt = require("jsonwebtoken");
// node-mysql-jsonwebtoken-02
const verifyJWT = (key = "", bodyParam = "") => {
  return (req, res, next) => {
    console.log("clog1", req.params);
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
        console.log("clog3", decoded);
        req[key] = decoded[key];
        next();
      } else if (bodyParam) {
        const paramsBody = req.body[bodyParam];
        console.log("clog2", paramsBody);
        if (decoded.id != paramsBody) {
          return res.status(401).send({ message: "Unauthorized." });
        }
        req[key] = decoded[key];
        next();
      } else {
        if (decoded) {
          const userId = req.params.userId;
          const comapanyId = req.params.comapanyId;
          if (userId == decoded?.id || comapanyId == decoded?.id) {
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
