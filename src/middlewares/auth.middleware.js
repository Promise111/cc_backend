const jwt = require("jsonwebtoken");

const auth = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    res.status(400).send({ messsage: "no token provided" });
    return;
  }

  try {
    let authToken = token.trim().split(" ");
    if (authToken[0] !== "Bearer") {
      res.status(400).send({ messsage: "wrong auth type" });
    }

    const decoded = jwt.verify(authToken[1], process.env.CC_SECRET);
    if (decoded.isVerified) {
      req["user"] = decoded;
      next();
    } else {
      res.status(400).send({ messsage: "User not verified" });
    }
  } catch (err) {
    res.status(401).send({ messsage: "Invalid token provided" });
  }
};

module.exports = auth;
