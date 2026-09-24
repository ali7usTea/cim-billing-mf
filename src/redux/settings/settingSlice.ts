import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { proxyURL } from "../../utils/lib/proxyAPI";

// Settings is an object with key-value pairs
export interface Settings {
  [key: string]: any;
}

export interface SettingState {
  settings: Settings;
}

const initialState: SettingState = {
  settings: {}
};

export const fetchApiSettings = createAsyncThunk(
  "settings/fetchSettings",
  async () => {
    const result = await fetch(`${proxyURL}/settings`);
    if (!result.ok) {
      throw new Error("Failed to fetch settings");
    }

    const data = await result.json();
    return data as Settings;
  }
);

const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchApiSettings.fulfilled, (state, action) => {
      state.settings = action.payload;
    });
  }
});

export const {} = settingSlice.actions;
export default settingSlice.reducer;
