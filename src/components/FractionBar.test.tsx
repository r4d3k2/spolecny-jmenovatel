import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import FractionBar from './FractionBar';

describe('FractionBar', () => {
  it.each([
    { n: 1, d: 2, filled: 1 },
    { n: 3, d: 4, filled: 3 },
    { n: 5, d: 8, filled: 5 },
    { n: 7, d: 12, filled: 7 },
    { n: 13, d: 36, filled: 13 },
    { n: 5, d: 3, filled: 3 },
  ])('renders $n/$d as $d segments with $d filled', ({ n, d, filled }) => {
    const html = renderToStaticMarkup(
      <FractionBar fraction={{ n, d }} />,
    );

    expect(html).toContain('w-48');
    expect(html).toContain('shrink-0');

    const segmentCount = (html.match(/box-border/g) ?? []).length;
    expect(segmentCount).toBe(d);

    const filledCount = (html.match(/bg-\[#2F5FD0\]/g) ?? []).length;
    expect(filledCount).toBe(filled);

    const borderCount = (html.match(/border-r /g) ?? []).length;
    expect(borderCount).toBe(d - 1);
  });
});
