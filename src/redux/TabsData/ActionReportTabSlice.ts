import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchApiGetActionReport } from "./AsyncActions";
import {
  ActionReportInterface,
  ActionReportResponseInterface
} from "../../interfaces/interfaces";

const initialState: ActionReportInterface = {
  details: [] /* Initialize correctly */
};

const ActionReportAgentslice = createSlice({
  name: "SMSShortCodeDetailsTab",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchApiGetActionReport.fulfilled,
      (state, action: PayloadAction<ActionReportResponseInterface>) => {
        state.details =
          action.payload ?? []; /* Fix: Assign `details` from API response */
      }
    );
  }
});

export default ActionReportAgentslice.reducer;
