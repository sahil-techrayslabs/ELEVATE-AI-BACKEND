import { check, validationResult } from "express-validator";

export const validateUserRegistration = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be 6 or more characters").isLength({
    min: 6,
  }),
];

export const validateUserLogin = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
