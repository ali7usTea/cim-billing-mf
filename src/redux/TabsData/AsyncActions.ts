import { createAsyncThunk } from "@reduxjs/toolkit";
import { setError } from "../notifications";
import { proxyURL } from "../../utils/lib/proxyAPI";

import {
  ActionReportResponseInterface,
  ActionReportType,
  ShortCodeDetails
} from "../../interfaces/interfaces";
import axios from "axios";

export const fetchApiSMSShortCodeDetailsTabData = createAsyncThunk<
  ShortCodeDetails[]
>(
  "SMSShortCodeDetailsTab/fetchSMSShortCodeDetails",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.get<ShortCodeDetails[]>(
        `${proxyURL}/GetShortCodeDetailsByAccountId`
      );
      console.log("Info: fetchApiSMSShortCodeDetailsTabData-data: ", data);
      return data;
    } catch (error) {
      /* Handle the error and dispatch the setErrorText action */
      let errorMessage =
        "Failed to fetch data for GetShortCodeDetailsByAccountId";
      dispatch(
        setError({
          notificationHeader: "error",
          infoText: errorMessage,
          notificationType: "error"
        })
      );
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchApiGetSMSShortCodeName = createAsyncThunk<ShortCodeDetails[]>(
  "GetSMSShortCodeName",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.get<ShortCodeDetails[]>(
        `${proxyURL}/GetSMSShortCodeName`
      );
      console.log("Info: fetchApiGetSMSShortCodeName-data: ", data);
      return data;
    } catch (error) {
      /* Handle the error and dispatch the setErrorText action */
      let errorMessage = "Failed to fetch data for GetSMSShortCodeName";
      dispatch(
        setError({
          notificationHeader: "error",
          infoText: errorMessage,
          notificationType: "info"
        })
      );
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchApiGetMailBoxDetails = createAsyncThunk<ShortCodeDetails[]>(
  "GetMailBoxDetails",
  async () => {
    const { data } = await axios.get<ShortCodeDetails[]>(
      `${proxyURL}/GetMailBoxDetails`
    );
    console.log("fetchApiGetMailBoxDetails-data: ", data);
    return data;
  }
);

export const fetchApiGetCMSAccountDetails = createAsyncThunk<
  ShortCodeDetails[]
>("GetCMSAccountDetails", async () => {
  const { data } = await axios.get<ShortCodeDetails[]>(
    `${proxyURL}/GetCMSAccountDetails`
  );
  console.log("fetchApiGetCMSAccountDetails-data: ", data);
  return data;
});

export const fetchApiGetIOTAssetDetails = createAsyncThunk<ShortCodeDetails[]>(
  "GetIOTAssetDetails",
  async () => {
    const { data } = await axios.get<ShortCodeDetails[]>(
      `${proxyURL}/GetIOTAssetDetails`
    );
    console.log("fetchApiGetIOTAssetDetails-data: ", data);
    return data;
  }
);

export const fetchApiGetActionReport = createAsyncThunk<
  ActionReportResponseInterface,
  string
>("GetActionReport", async (prams) => {
  const { data } = await axios.get<ActionReportResponseInterface>(
    `${proxyURL}/actionReport/${prams}`
  );
  return data;
});

export const fetchApiGetSMSAccountDetails = createAsyncThunk<
  ActionReportType,
  string
>("fetchApiGetSMSAccountDetails", async () => {
  const { data } = await axios.get<ActionReportType>(
    `${proxyURL}/GetSMPDetails?accountId=900300249263&noOfRecords=0&isDebugMode=true&actionCode=GetSMPDetails&action=GetSMPDetails`
  );
  console.log("fetchApiGetActionReport-data: ", data);
  return data;
});
