import { expect, test } from 'vitest';
import { calculateTotal } from './cart';

test('Total calculation: 100k x 3 products should equal 300k', () => {
  const result = calculateTotal(100000, 3);
  expect(result).toBe(300000);
});
