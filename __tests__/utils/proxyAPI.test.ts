jest.mock('axios', () => ({
    __esModule: true,
    default: {
        create: jest.fn(() => ({})),
    },
}));

describe('proxyAPI', () => {
    it('exports proxyURL from environment', () => {
        jest.isolateModules(() => {
            const { proxyURL } = require('../../src/utils/lib/proxyAPI');
            expect(proxyURL).toBe('http://localhost:3000/api');
        });
    });

    it('exports imageURL from environment', () => {
        jest.isolateModules(() => {
            const { imageURL } = require('../../src/utils/lib/proxyAPI');
            expect(imageURL).toBe('http://localhost:3000/images');
        });
    });

    it('exports complaintURL from environment', () => {
        jest.isolateModules(() => {
            const { complaintURL } = require('../../src/utils/lib/proxyAPI');
            expect(complaintURL).toBe('http://localhost:3000/complaint');
        });
    });

    it('exports debugReportURL from environment', () => {
        jest.isolateModules(() => {
            const { debugReportURL } = require('../../src/utils/lib/proxyAPI');
            expect(debugReportURL).toBe('http://localhost:3000/debug-report');
        });
    });
});
