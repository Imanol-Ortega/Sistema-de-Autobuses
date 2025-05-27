import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './modalSlice';
import loaderReducer from './loaderSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    loader: loaderReducer,
    user: userReducer,
  },
});
