import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  modalType: 'medium', // small, medium, large
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Modal management
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalContent = action.payload.content;
      state.modalType = action.payload.type || 'medium';
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalContent = null;
    }
  }
});

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  openModal, 
  closeModal 
} = uiSlice.actions;

export default uiSlice.reducer; 