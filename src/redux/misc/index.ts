import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cancelAllParkedRequests } from "./AsyncActions";

// Inteface follow similar naming conventions to those used for classes 
export interface MiscSliceInterface {
    message: string | null
}
const initialState: MiscSliceInterface = {
    message: ""
};

const MiscSlice = createSlice({
    name: "misc",
    initialState,
    reducers: {
        clearStateMessages: (state, action: PayloadAction) => {
            state.message = null
        }
    },
    extraReducers(builder) {
        builder.addCase(cancelAllParkedRequests.fulfilled, (state, action) => {
            //@ts-ignore
            state.message = action.payload.responseMessage;
        });
    },
})

export const { clearStateMessages } = MiscSlice.actions
export default MiscSlice.reducer;