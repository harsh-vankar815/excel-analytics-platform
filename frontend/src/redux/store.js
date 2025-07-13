import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import fileReducer from './file/fileSlice';
import chartReducer from './chart/chartSlice';
import uiReducer from './ui/uiSlice';
import adminReducer from './admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    file: fileReducer,
    chart: chartReducer,
    ui: uiReducer,
    admin: adminReducer,
    users: adminReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store; 