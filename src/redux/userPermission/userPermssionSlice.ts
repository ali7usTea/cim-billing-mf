import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Inteface follow similar naming conventions to those used for classes
export interface UserPermission {
  name: string;
  advance: string;
  description: string;
}

export interface GroupPermission {
  label: string;
  uiId: string;
  groupExpression?: string;
}

interface UserState {
  roles: string[];
  permissionDtoMap: Record<string, UserPermission>;
}
const initialState: UserState = {
  roles: [],
  permissionDtoMap: {}
};

export const fetchApiUserPermssion = createAsyncThunk(
  "UserPermssion/fetchUserPermssion",
  async ({ jwtToken, ntLogin }: { jwtToken: string; ntLogin: string }) => {
    try {
      const url = `${import.meta.env.VITE_PUBLIC_USER_PERMISSIONS_URL}`;
      const result = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          ntLogin: ntLogin,
          "Content-Type": "application/json",
          category: "OTHERS"
        },
        cache: "no-store"
      });

      if (!result.ok) {
        throw new Error("Failed to fetch User permission  ");
      }

      const data = await result.json();
      // Return the data as-is from backend
      return {
        roles: data.roles || [],
        permissionDtoMap: data.permissionDtoMap || {}
      };
    } catch (error) {
      console.log(
        "Error :: userPermisionSlice::fetchApiUserPermssion: " + error
      );
      return {
        roles: [],
        permissionDtoMap: {}
      };
    }
  }
);

const UserPermisionslice = createSlice({
  name: "UserPermision",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchApiUserPermssion.fulfilled, (state, action) => {
      state.roles = action.payload.roles;
      state.permissionDtoMap = action.payload.permissionDtoMap;
    });
  }
});

export default UserPermisionslice.reducer;
