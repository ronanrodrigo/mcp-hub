import { requireApiKey } from '../../src/auth.js';

export default function handler(request, response) {
  if (!requireApiKey(request, response)) return;
  if (request.method !== 'GET') {
    response.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  response.status(200).json({ success: true, message: 'Hello World' });
}
