import { API_KEY } from './constants.js';

export function isAuthorized(request) {
  return request?.headers?.['x-api-key'] === API_KEY ||
    request?.headers?.get?.('x-api-key') === API_KEY;
}

export function requireApiKey(request, response) {
  if (isAuthorized(request)) return true;
  response.status(401).json({ success: false, error: 'Unauthorized' });
  return false;
}
