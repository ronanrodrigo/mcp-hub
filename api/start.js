import { requireApiKey } from '../src/auth.js';
import { createHub } from '../src/hub.js';

export default async function handler(request, response) {
  if (!requireApiKey(request, response)) return;
  if (!['GET', 'POST'].includes(request.method)) {
    response.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  const hub = await createHub();
  response.status(200).json(await hub.callTool('discovery'));
}
