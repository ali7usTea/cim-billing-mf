import { createSlice } from "@reduxjs/toolkit";
import { fetchApiSMSShortCodeDetailsTabData } from "./AsyncActions";
import { ShortCodeDetails } from "../../interfaces/interfaces";

// Inteface follow similar naming conventions to those used for classes
export interface SMSShortCodeDetailsTabInterface {}
interface SMSShortCodeDetailsTabState {
  details: ShortCodeDetails[];
}
const initialState: SMSShortCodeDetailsTabState = {
  details: []
};

const Agentslice = createSlice({
  name: "SMSShortCodeDetailsTab",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(
      fetchApiSMSShortCodeDetailsTabData.fulfilled,
      (state, action) => {
        state.details = action.payload;
      }
    );
    builder.addCase(fetchApiSMSShortCodeDetailsTabData.rejected, () => {
      console.log("action rejected");
      // here i want to dispatch setErrorText with the error
    });
  }
});

export const {} = Agentslice.actions;
export default Agentslice.reducer;
