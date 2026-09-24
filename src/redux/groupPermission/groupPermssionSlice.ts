import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Inteface follow similar naming conventions to those used for classes
export interface GroupPermission {
  label: string;
  uiId: string;
  groupExpression?: string;
}
interface TabState {
  groupPermissionMap: Record<string, GroupPermission>;
  AllGroupPermissionMap: Record<string, GroupPermission>;
}
const initialState: TabState = {
  groupPermissionMap: {},
  AllGroupPermissionMap: {}
};

export const fetchAllGroupPermssion = createAsyncThunk(
  "GroupPermssion/fetchAllGroupPermssion",
  async ({ jwtToken, ntLogin }: { jwtToken: string; ntLogin: string }) => {
    const groupPermissionMap: Record<string, GroupPermission> = {};
    try {
      const url = `${import.meta.env.VITE_PUBLIC_ALL_GROUPS_URL}`;
      const result = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          ntLogin: ntLogin,
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });

      if (!result.ok) {
        throw new Error("Failed to fetch Tab permission  ");
      }

      const data = await result.json();

      const permissionDtoMapArray = data.groupDtoMap;

      Object.keys(permissionDtoMapArray).forEach((key) => {
        groupPermissionMap[key] = permissionDtoMapArray[key] as GroupPermission;
        // Assuming permissionDtoMap[key] is of type GroupPermission
      });
    } catch (error) {
      console.log(
        "Error: GroupPermissionSlice::fetchApiGroupPermssion ",
        error
      );
    }

    return groupPermissionMap;
  }
);
export const fetchApiGroupPermssion = createAsyncThunk(
  "GroupPermssion/fetchGroupPermssion",
  async ({ jwtToken, ntLogin }: { jwtToken: string; ntLogin: string }) => {
    const groupPermissionMap: Record<string, GroupPermission> = {};
    try {
      const url = `${import.meta.env.VITE_PUBLIC_PERMISSION_GROUP_URL}`;
      const result = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          ntLogin: ntLogin,
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });

      if (!result.ok) {
        throw new Error("Failed to fetch Tab permission  ");
      }

      const data = await result.json();

      const permissionDtoMapArray = data.groupDtoMap;

      Object.keys(permissionDtoMapArray).forEach((key) => {
        groupPermissionMap[key] = permissionDtoMapArray[key] as GroupPermission;
        // Assuming permissionDtoMap[key] is of type GroupPermission
      });
    } catch (error) {
      console.log(
        "Error: GroupPermissionSlice::fetchApiGroupPermssion ",
        error
      );
    }

    return groupPermissionMap;
  }
);

const GroupPermisionslice = createSlice({
  name: "GroupPermission",
  initialState,
  reducers: {
    getGrouppermission: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      const tabPermission = state.groupPermissionMap[key];
      // You can handle what to do if setting is not found// For example, you can throw an error or log a message
      if (tabPermission) {
        console.log(tabPermission);
      } else {
        console.log(`Setting with key ${key} not found.`);
      }
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchApiGroupPermssion.fulfilled, (state, action) => {
      state.groupPermissionMap = action.payload;
    });
    builder.addCase(fetchAllGroupPermssion.fulfilled, (state, action) => {
      state.AllGroupPermissionMap = action.payload;
    });
  }
});

export const { getGrouppermission } = GroupPermisionslice.actions;
export default GroupPermisionslice.reducer;
