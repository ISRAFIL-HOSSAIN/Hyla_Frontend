// userPermissionAction.ts

import { AppThunk } from '../store';
import { isUserPermissionActions } from '../slices/userPermissionSlice';

export const setPermissionsData = (data: any): AppThunk => (dispatch) => {
  dispatch(isUserPermissionActions.setPermissionsData(data));
};
