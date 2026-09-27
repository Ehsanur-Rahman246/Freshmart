import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.userId && !decoded.purpose) {
        req.user = { userId: decoded.userId, role: decoded.role };
      }
    }
  } catch {
    // invalid token = treated as a guest
  }

  next();
};

export default optionalAuth;
