import { createSlice } from '@reduxjs/toolkit';

const loaderSlice = createSlice({
  name: 'loader',
  initialState: { loading: false },
  reducers: {
    showLoader: state => {
      state.loading = true;
    },
    hideLoader: state => {
      state.loading = false;
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
