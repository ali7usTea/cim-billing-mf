import { DEFAULT_INTERVAL_BETWEEN_DATES } from '../../src/utils/const';

describe('const', () => {
    it('DEFAULT_INTERVAL_BETWEEN_DATES should be 30', () => {
        expect(DEFAULT_INTERVAL_BETWEEN_DATES).toBe(30);
    });
});
