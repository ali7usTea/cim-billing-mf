import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CookiesInterface {
  myCookieValue: string;
}

interface CookieState {
  CookieMap: { [key: string]: string };
}

const initialState: CookieState = {
  CookieMap: {}
};

const CookieSlice = createSlice({
  name: "cookie",
  initialState,
  reducers: {
    addCookieValue: (
      state,
      action: PayloadAction<{ key: string; CookiesInterface: string }>
    ) => {
      const { key, CookiesInterface } = action.payload;
      state.CookieMap[key] = CookiesInterface;
    },
    updateCookieValue: (
      state,
      action: PayloadAction<{ key: string; CookiesInterface: string }>
    ) => {
      const { CookiesInterface } = action.payload;
      if (state.CookieMap[CookiesInterface]) {
        state.CookieMap[CookiesInterface] = CookiesInterface;
      }
    },
    deleteCookieValue: (state, action: PayloadAction<CookiesInterface>) => {
      const { myCookieValue } = action.payload;
      delete state.CookieMap[myCookieValue];
    },
    getCookieValue: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      const cookie = state.CookieMap[key];
      if (cookie) {
        console.log("cookieSlice:: cookie value: ", cookie);
      } else {
        console.log("cookieSlice:: cookie values NOT found: ", cookie);
      }
    }
  }
});

export const {
  addCookieValue,
  getCookieValue,
  updateCookieValue,
  deleteCookieValue
} = CookieSlice.actions;
export default CookieSlice.reducer;
