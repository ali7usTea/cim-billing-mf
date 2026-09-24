jest.mock('axios', () => {
    const mockAxiosInstance = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    };
    return {
        __esModule: true,
        default: {
            create: jest.fn(() => mockAxiosInstance),
        },
    };
});

describe('axiosClient', () => {
    it('creates an axios instance with correct baseURL', () => {
        // Re-import to trigger module execution
        jest.isolateModules(() => {
            const axiosMod = require('axios');
            require('../../src/utils/axios');
            expect(axiosMod.default.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'http://localhost:3000',
                    withCredentials: true,
                })
            );
        });
    });

    it('sets up a response interceptor', () => {
        jest.isolateModules(() => {
            const axiosMod = require('axios');
            const mockInstance = axiosMod.default.create();
            require('../../src/utils/axios');
            expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
        });
    });
});
