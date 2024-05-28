// isOrganizationActions.ts

import { AppThunk } from '../store';
import { isOrganizationActions } from '../slices/isOrganizationSlice';

export const setOrganizationData = (name: string, data: any): AppThunk => (dispatch) => {
  dispatch(isOrganizationActions.setOrganizationName(name));
  dispatch(isOrganizationActions.setOrganizationData(data));
};
