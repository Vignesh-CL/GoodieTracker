export function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

export function errorHandler(error, _request, response, _next) {
  console.error(error);
  if (error.code === 11000) return response.status(409).json({ message: "A record with that value already exists" });
  if (error.name === "ValidationError") return response.status(400).json({ message: "Validation failed", details: Object.values(error.errors).map(({ message }) => message) });
  response.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
}
