import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationType = "success" | "info" | "warn" | "error";

interface NotificationState {
  infoText: string | null;
  notificationType: NotificationType;
  notificationHeader: string | null;
}

const initialState: NotificationState = {
  notificationType: "info",
  infoText: null,
  notificationHeader: null
};

const NotificationSlice = createSlice({
  name: "NotificationSlice",
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<NotificationState>) => {
      state.notificationType = action.payload?.notificationType;
      state.infoText = action.payload.infoText;
      state.notificationHeader = action.payload.notificationHeader;
    }
  }
});

// Exporting actions to use them in components or middleware
export const { setError } = NotificationSlice.actions;
export default NotificationSlice.reducer;
