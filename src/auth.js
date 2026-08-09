export function isValidApiKey(apiKey) {
  const validKey = process.env.API_KEY || "fixed-secret-key";
  return typeof apiKey === "string" && apiKey === validKey;
}
