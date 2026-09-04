import { afterEach, describe, expect, it, vi } from 'vitest';
import { listTags, searchNotes, searchTags, getNote, distance, normalize } from '../src/tools/notes-search.js';

const notes = [
  { title: 'LLM Agents', date: '2026-01-02', slug: 'llm-agents', url: 'https://ronanrodrigo.dev/notes/llm-agents/', markdown_url: 'https://ronanrodrigo.dev/notes/llm-agents/index.md', path: '/notes/llm-agents/', tags: ['ai', 'agents'], description: 'Patterns for LLM agent orchestration' },
  { date: '2025-12-01', slug: 'web-scraping', path: '/notes/web-scraping/', tags: ['automation', 'web-scraping'], description: 'Browser automation techniques' },
];
const tags = [{ name: 'agent-memory', url: '/notes/tags/agent-memory/' }, { name: 'web-scraping', url: '/notes/tags/web-scraping/' }];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Notes search tools', () => {
  it('normalizes accents and computes edit distance', () => {
    expect(normalize('Agêntes')).toBe('agentes');
    expect(distance('agent', 'agnt')).toBe(1);
  });

  it('searches notes by fuzzy and partial content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => notes }));
    const result = await searchNotes({ query: 'orchestraton', max_results: 5 });
    expect(result.success).toBe(true);
    expect(result.results[0].slug).toBe('llm-agents');
  });

  it('supports tag filtering and searches the tag index', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: async () => notes }).mockResolvedValueOnce({ ok: true, json: async () => tags }));
    expect((await searchNotes({ query: 'browser', tag: 'scrapng' })).results[0].slug).toBe('web-scraping');
    expect((await searchTags({ query: 'memry' })).results[0].name).toBe('agent-memory');
  });

  it('lists tags and returns dependency errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => tags }));
    expect((await listTags({ max_results: 1 }).then((result) => result.tags))).toHaveLength(1);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
    await expect(searchTags({ query: 'ai' })).resolves.toMatchObject({ success: false, error: 'Unable to fetch Notes data: network unavailable' });
  });

  it('gets a note by slug with markdown content', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => notes })
      .mockResolvedValueOnce({ ok: true, text: async () => '# LLM Agents\nFull content here' }));
    const result = await getNote({ slug: 'llm-agents' });
    expect(result).toMatchObject({ success: true, slug: 'llm-agents', title: 'LLM Agents', truncated: false });
    expect(result.markdown).toContain('Full content here');
  });

  it('gets a note by full post URL or markdown_url', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => notes })
      .mockResolvedValueOnce({ ok: true, text: async () => '# LLM Agents' })
      .mockResolvedValueOnce({ ok: true, json: async () => notes })
      .mockResolvedValueOnce({ ok: true, text: async () => '# LLM Agents' });
    vi.stubGlobal('fetch', mockFetch);
    await expect(getNote({ slug: 'https://ronanrodrigo.dev/notes/llm-agents/' })).resolves.toMatchObject({ success: true, slug: 'llm-agents' });
    await expect(getNote({ slug: 'https://ronanrodrigo.dev/notes/llm-agents/index.md' })).resolves.toMatchObject({ success: true, slug: 'llm-agents' });
  });

  it('rejects unknown and missing slugs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => notes }));
    await expect(getNote({ slug: 'no-such-note' })).resolves.toMatchObject({ success: false });
    await expect(getNote({ slug: '' })).resolves.toMatchObject({ success: false, error: 'slug is required' });
    await expect(getNote({})).resolves.toMatchObject({ success: false, error: 'slug is required' });
  });

  it('returns index and markdown fetch errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
    await expect(getNote({ slug: 'llm-agents' })).resolves.toMatchObject({ success: false, error: 'Unable to fetch Notes data: network unavailable' });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => notes })
      .mockRejectedValueOnce(new Error('markdown down')));
    await expect(getNote({ slug: 'llm-agents' })).resolves.toMatchObject({ success: false, error: 'Unable to fetch note markdown: markdown down' });
  });
});
