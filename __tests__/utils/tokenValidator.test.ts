jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));

import { tokenValidate } from '../../src/utils/tokenValidator';
import { jwtDecode } from 'jwt-decode';

const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe('tokenValidator', () => {
    beforeEach(() => {
        mockJwtDecode.mockReset();
    });

    it('returns false for empty token', () => {
        expect(tokenValidate('')).toBe(false);
    });

    it('returns false for null/undefined token', () => {
        expect(tokenValidate(null as any)).toBe(false);
        expect(tokenValidate(undefined as any)).toBe(false);
    });

    it('returns false for invalid format (not 3 parts)', () => {
        expect(tokenValidate('invalid.token')).toBe(false);
        expect(tokenValidate('onlyonepart')).toBe(false);
    });

    it('returns true for valid non-expired token', () => {
        const futureTime = (Date.now() / 1000) + 3600; // 1 hour from now
        mockJwtDecode.mockReturnValue({ exp: futureTime } as any);
        expect(tokenValidate('header.payload.signature')).toBe(true);
    });

    it('returns false for expired token', () => {
        const pastTime = (Date.now() / 1000) - 3600; // 1 hour ago
        mockJwtDecode.mockReturnValue({ exp: pastTime } as any);
        expect(tokenValidate('header.payload.signature')).toBe(false);
    });

    it('returns false when jwtDecode throws', () => {
        mockJwtDecode.mockImplementation(() => { throw new Error('Invalid token'); });
        expect(tokenValidate('header.payload.signature')).toBe(false);
    });

    it('returns false when token has no exp field', () => {
        mockJwtDecode.mockReturnValue({} as any);
        expect(tokenValidate('header.payload.signature')).toBe(false);
    });
});
