import { isValidApiKey } from "../../src/auth.js";

export default function handler(req, res) {
  if (!isValidApiKey(req.headers["x-api-key"])) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({
    success: true,
    message: "Hello World"
  });
}
