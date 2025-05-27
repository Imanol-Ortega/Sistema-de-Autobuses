import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
  name: 'modal',
  initialState: { visible: false, content: null },
  reducers: {
    showModal: (state, action) => {
      state.visible = true;
      state.content = action.payload;
    },
    hideModal: state => {
      state.visible = false;
      state.content = null;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export default modalSlice.reducer;
