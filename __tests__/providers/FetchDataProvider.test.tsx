jest.mock('../../src/utils/axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import useFetchData from '../../src/providers/FetchDataProvider';
import axiosClient from '../../src/utils/axios';

const mockAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;

describe('useFetchData', () => {
    beforeEach(() => {
        (mockAxiosClient.get as jest.Mock).mockReset();
    });

    it('returns loading state initially', () => {
        (mockAxiosClient.get as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves
        const { result } = renderHook(() => useFetchData('/test'));
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('returns data on success', async () => {
        const mockData = { name: 'test' };
        (mockAxiosClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

        const { result } = renderHook(() => useFetchData('/test'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it('returns error on failure', async () => {
        (mockAxiosClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useFetchData('/test'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe('Network error');
    });

    it('calls axios with the provided endpoint', () => {
        (mockAxiosClient.get as jest.Mock).mockResolvedValueOnce({ data: {} });
        renderHook(() => useFetchData('/api/users'));
        expect(mockAxiosClient.get).toHaveBeenCalledWith('/api/users');
    });
});
