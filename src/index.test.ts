import { recordToObject } from './index';
import { recordToObject as recordToObjectUtils } from './utils';

describe(`luft`, () => {
  it('re-exports recordToObject from utils', () => {
    expect(recordToObject).toBe(recordToObjectUtils);
  });
});
