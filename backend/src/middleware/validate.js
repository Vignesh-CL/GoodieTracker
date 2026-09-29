import { validationResult } from "express-validator";

export function validate(request, response, next) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(400).json({ message: "Validation failed", details: errors.array().map(({ msg }) => msg) });
  next();
}
