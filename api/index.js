import { getHubMetadata } from "../src/hub.js";
import { isValidApiKey } from "../src/auth.js";

export default async function handler(req, res) {
  if (!isValidApiKey(req.headers["x-api-key"])) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const metadata = await getHubMetadata();
  return res.status(200).json(metadata);
}
