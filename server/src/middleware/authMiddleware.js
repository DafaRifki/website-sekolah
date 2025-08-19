import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  // ambil token dari cookie ATAU header
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: "Token tidak ada, silakan login" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ error: "Token tidak valid atau sudah kadaluarsa" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) === true) {
      return res.status(403).json({ error: "Akses ditolak" });
    }
    next();
  };
};
