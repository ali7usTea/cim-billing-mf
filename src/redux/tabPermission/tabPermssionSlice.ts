import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Inteface follow similar naming conventions to those used for classes
export interface TabPermission {
  label: string;
  uiId: string;
  tabExpression?: string;
}
export interface GroupPermission {
  label: string;
  uiId: string;
  groupExpression?: string;
}
interface TabState {
  tabPermissionMap: Record<string, TabPermission>;
  AllTabPermissionMap: Record<string, TabPermission>;
}
const initialState: TabState = {
  tabPermissionMap: {},
  AllTabPermissionMap: {}
};

export const fetchAllTabPermssion = createAsyncThunk(
  "TabPermssion/fetchAllTabsPermssion",
  async ({ jwtToken, ntLogin }: { jwtToken: string; ntLogin: string }) => {
    const permissionsMap: Record<string, TabPermission> = {};

    try {
      const url = `${import.meta.env.VITE_PUBLIC_ALL_TABS_URL}`;
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

      const permissionDtoMapArray = data.tabDtoMap;

      Object.keys(permissionDtoMapArray).forEach((key) => {
        permissionsMap[key] = permissionDtoMapArray[key] as TabPermission;
      });
    } catch (error) {
      console.log("Error :: tabPermisionSlice::fetchApiTabPermssion: " + error);
    }

    return permissionsMap;
  }
);
export const fetchApiTabPermssion = createAsyncThunk(
  "TabPermssion/fetchTabPermssion",
  async ({ jwtToken, ntLogin }: { jwtToken: string; ntLogin: string }) => {
    const permissionsMap: Record<string, TabPermission> = {};

    try {
      const url = `${import.meta.env.VITE_PUBLIC_PERMISSION_URL}`;
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

      const permissionDtoMapArray = data.tabDtoMap;

      Object.keys(permissionDtoMapArray).forEach((key) => {
        permissionsMap[key] = permissionDtoMapArray[key] as TabPermission;
      });
    } catch (error) {
      console.log("Error :: tabPermisionSlice::fetchApiTabPermssion: " + error);
    }

    return permissionsMap;
  }
);

const TabPermisionslice = createSlice({
  name: "TabPermision",
  initialState,
  reducers: {
    addTabPermssion: (state, action: PayloadAction<TabPermission>) => {
      const { uiId } = action.payload;
      state.tabPermissionMap[uiId] = action.payload;
    },
    updateTabPermission: (state, action: PayloadAction<TabPermission>) => {
      const { uiId, label } = action.payload;

      if (state.tabPermissionMap[uiId]) {
        state.tabPermissionMap[uiId].label = label;
      }
    },
    // Action to delete data
    deleteTabPermssion: (state, action: PayloadAction<TabPermission>) => {
      const { uiId } = action.payload;
      delete state.tabPermissionMap[uiId];
    },
    getTabpermission: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      const tabPermission = state.tabPermissionMap[key];
      // You can handle what to do if setting is not found// For example, you can throw an error or log a message
      if (tabPermission) {
        console.log(tabPermission);
      } else {
        console.log(`Setting with key ${key} not found.`);
      }
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchApiTabPermssion.fulfilled, (state, action) => {
      state.tabPermissionMap = action.payload;
    });
    builder.addCase(fetchAllTabPermssion.fulfilled, (state, action) => {
      state.AllTabPermissionMap = action.payload;
    });
  }
});

export const {
  addTabPermssion,
  updateTabPermission,
  deleteTabPermssion,
  getTabpermission
} = TabPermisionslice.actions;
export default TabPermisionslice.reducer;
