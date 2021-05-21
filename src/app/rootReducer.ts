import {combineReducers} from '@reduxjs/toolkit';
import connectionReducer from '../navigation/connections/connectionsSlice';
import notificationReducer from '../navigation/notifications/notificationsSlice';

const rootReducer = combineReducers({
  connections: connectionReducer,
  notifications: notificationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
