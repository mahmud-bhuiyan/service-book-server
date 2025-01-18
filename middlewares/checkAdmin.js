import { createCustomError } from "../errors/customError.js";

const checkAdmin = (req, res, next) => {
  const admin = req.user;

  if (admin.role !== "admin") {
    return next(createCustomError("You are not authorized!", 403));
  }

  next();
};

export default checkAdmin;
