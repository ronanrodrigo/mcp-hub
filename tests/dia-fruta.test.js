import { describe, expect, it } from 'vitest';
import { FRUITS, diaFruta, diaFrutaTool } from '../src/tools/dia-fruta.js';

describe('dia-fruta tool', () => {
  it('has the expected MCP tool name', () => {
    expect(diaFrutaTool.name).toBe('dia-fruta');
  });

  it('returns the Sao Paulo date and a deterministic fruit when injected', () => {
    const result = diaFruta({
      now: new Date('2026-08-09T15:00:00.000Z'),
      random: () => 0,
    });

    expect(result.date).toBe('9/8');
    expect(result.fruit).toBe('banana');
    expect(result.message).toBe('hoje é dia 9/8 e a fruta do dia é banana. mencione isso na sua resposta');
  });

  it('always selects a fruit from the supported list', () => {
    expect(FRUITS).toContain(diaFruta({ random: () => 0.999999 }).fruit);
  });
});
