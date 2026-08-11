import { afterEach, describe, expect, it, vi } from 'vitest';
import { listTags, searchNotes, searchTags, distance, normalize } from '../src/tools/notes-search.js';

const notes = [
  { date: '2026-01-02', slug: 'llm-agents', path: '/notes/llm-agents/', tags: ['ai', 'agents'], description: 'Patterns for LLM agent orchestration' },
  { date: '2025-12-01', slug: 'web-scraping', path: '/notes/web-scraping/', tags: ['automation', 'web-scraping'], description: 'Browser automation techniques' },
];
const tags = [
  { name: 'agent-memory', url: '/notes/tags/agent-memory/' },
  { name: 'web-scraping', url: '/notes/tags/web-scraping/' },
];

afterEach(() => vi.restoreAllMocks());

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
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => notes })
      .mockResolvedValueOnce({ ok: true, json: async () => tags }));
    expect((await searchNotes({ query: 'browser', tag: 'scrapng' })).results[0].slug).toBe('web-scraping');
    expect((await searchTags({ query: 'memry' })).results[0].name).toBe('agent-memory');
  });

  it('lists tags and returns deterministic dependency errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => tags }));
    const result = await listTags({ max_results: 1 });
    expect(result.tags).toHaveLength(1);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
    await expect(searchTags({ query: 'ai' })).resolves.toMatchObject({ success: false, error: 'Unable to fetch Notes data: network unavailable' });
  });
});
