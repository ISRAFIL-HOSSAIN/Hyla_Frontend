import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface IsUserPermissionState {
  permissions: any;
}

const initialState: IsUserPermissionState = {
  permissions: {},
};

const isUserPermissionSlice = createSlice({
  name: 'isPermissions',
  initialState,
  reducers: {
    setPermissionsData(state: IsUserPermissionState, action: PayloadAction<any>): void {
      state.permissions = action.payload;
    },
  },
});

export const { reducer: isUserPermissionReducer, actions: isUserPermissionActions } = isUserPermissionSlice;


export type isUserPermissionActions = typeof isUserPermissionActions;
