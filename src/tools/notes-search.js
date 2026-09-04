const NOTES_INDEX_URL = 'https://ronanrodrigo.dev/notes/index.json';
const TAGS_INDEX_URL = 'https://ronanrodrigo.dev/notes/list-tags.json';
const DEFAULT_LIMIT = 10;
const MAX_MARKDOWN_CHARS = 40000;

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function tokens(value) {
  return normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 1);
}

function distance(left, right) {
  const a = normalize(left); const b = normalize(right);
  if (a === b) return 0;
  if (!a.length || !b.length) return Math.max(a.length, b.length);
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[b.length];
}

function similarity(left, right) {
  const a = normalize(left); const b = normalize(right);
  return !a || !b ? 0 : 1 - distance(a, b) / Math.max(a.length, b.length);
}

function score(item, query) {
  const haystack = normalize(JSON.stringify(item)); const queryText = normalize(query);
  if (!queryText) return 0;
  const candidates = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  let result = haystack.includes(queryText) ? 10 : 0;
  for (const token of tokens(queryText)) {
    if (haystack.includes(token)) result += 4;
    const best = candidates.reduce((highest, candidate) => Math.max(highest, similarity(token, candidate)), 0);
    if (best >= 0.45) result += best * 3;
  }
  return result;
}

function extractSlug(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  if (!trimmed.includes('/')) return trimmed;
  const withoutQuery = trimmed.split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  if (!segments.length) return trimmed;
  let last = segments[segments.length - 1];
  if (/\.md$/i.test(last) && segments.length > 1) last = segments[segments.length - 2];
  return last;
}

async function fetchText(url) {
  let response;
  try {
    response = await fetch(url, { headers: { accept: 'text/markdown, text/plain' }, signal: AbortSignal.timeout(8000) });
  } catch (error) {
    throw new Error(`Unable to fetch note markdown: ${error.message}`);
  }
  if (!response.ok) throw new Error(`Note markdown request failed with HTTP ${response.status}`);
  try { return await response.text(); } catch { throw new Error('Note markdown endpoint returned an unreadable body'); }
}

function limit(value, fallback = DEFAULT_LIMIT, maximum = 50) {
  const number = Number.isInteger(value) ? value : fallback;
  return Math.min(Math.max(number, 1), maximum);
}

function failure(error) {
  return { success: false, error: error instanceof Error ? error.message : String(error) };
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  } catch (error) {
    throw new Error(`Unable to fetch Notes data: ${error.message}`);
  }
  if (!response.ok) throw new Error(`Notes data request failed with HTTP ${response.status}`);
  let data;
  try { data = await response.json(); } catch { throw new Error('Notes endpoint returned invalid JSON'); }
  if (!Array.isArray(data)) throw new Error('Notes endpoint returned an unexpected JSON shape');
  return data;
}

function ranked(items, query, maxResults) {
  return items.map((item, index) => ({ item, index, relevance: query ? score(item, query) : 0 }))
    .filter(({ relevance }) => !query || relevance > 0)
    .sort((left, right) => right.relevance - left.relevance || left.index - right.index)
    .slice(0, maxResults)
    .map(({ item, relevance }) => ({ ...item, ...(query ? { relevance: Number(relevance.toFixed(3)) } : {}) }));
}

export async function searchNotes({ query, tag, max_results = DEFAULT_LIMIT } = {}) {
  if (!String(query || '').trim()) return failure('query is required');
  try {
    let notes = await fetchJson(NOTES_INDEX_URL);
    if (tag) notes = notes.filter((note) => score(note.tags ?? note, tag) > 0);
    return { success: true, query, tag: tag || null, results: ranked(notes, query, limit(max_results)), total: notes.length, source: NOTES_INDEX_URL };
  } catch (error) { return failure(error); }
}

export async function searchTags({ query, max_results = DEFAULT_LIMIT } = {}) {
  if (!String(query || '').trim()) return failure('query is required');
  try {
    const tags = await fetchJson(TAGS_INDEX_URL);
    return { success: true, query, results: ranked(tags, query, limit(max_results)), total: tags.length, source: TAGS_INDEX_URL };
  } catch (error) { return failure(error); }
}

export async function listTags({ query = '', max_results = 200 } = {}) {
  try {
    const tags = await fetchJson(TAGS_INDEX_URL);
    return { success: true, query: query || null, tags: ranked(tags, query, limit(max_results, 200, 200)), total: tags.length, source: TAGS_INDEX_URL };
  } catch (error) { return failure(error); }
}

export async function getNote({ slug } = {}) {
  const raw = String(slug ?? '').trim();
  if (!raw) return failure('slug is required');
  const wanted = extractSlug(raw);
  let notes;
  try {
    notes = await fetchJson(NOTES_INDEX_URL);
  } catch (error) { return failure(error); }
  const entry = notes.find((note) => note.slug === wanted || note.slug === raw || note.url === raw || note.markdown_url === raw);
  if (!entry) return failure(`note not found for slug: ${wanted}`);
  if (!entry.markdown_url) return failure(`note has no markdown_url for slug: ${wanted}`);
  try {
    const markdown = await fetchText(entry.markdown_url);
    const truncated = markdown.length > MAX_MARKDOWN_CHARS;
    return { success: true, slug: entry.slug, title: entry.title ?? null, url: entry.url ?? null, markdown: truncated ? markdown.slice(0, MAX_MARKDOWN_CHARS) : markdown, truncated };
  } catch (error) { return failure(error); }
}

export const notesSearchHandlers = { searchNotes, searchTags, listTags, getNote };
export { distance, normalize, score };
