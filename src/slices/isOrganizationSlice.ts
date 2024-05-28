// isOrganizationSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IsOrganizationState {
  isOrganizationName: string;
  isOrganizationData: any;
}

const initialState: IsOrganizationState = {
  isOrganizationName: '',
  isOrganizationData: {},
};

const isOrganizationSlice = createSlice({
  name: 'isOrganization',
  initialState,
  reducers: {
    setOrganizationName(state: IsOrganizationState, action: PayloadAction<string>): void {
      state.isOrganizationName = action.payload;
    },
    setOrganizationData(state: IsOrganizationState, action: PayloadAction<any>): void {
      state.isOrganizationData = action.payload;
    },
  },
});

export const { reducer: isOrganizationReducer, actions: isOrganizationActions } = isOrganizationSlice;


export type IsOrganizationActions = typeof isOrganizationActions;
