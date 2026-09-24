import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionReportInterface } from '../../interfaces/interfaces';
import axios from 'axios';

export const cancelAllParkedRequests = createAsyncThunk<ActionReportInterface, { accountnumber: string; CancellationType: string }>('mixed/cancelAllParkedRequests', async ({ accountnumber, CancellationType }) => {
    const url = `/CancelParkingRequest`;
    const { data } = await axios.get<ActionReportInterface>(`${import.meta.env.VITE_PUBLIC_API_PROXY}${url}?accountnumber=${accountnumber}&CancellationType=${CancellationType}`);
    return data;
});
