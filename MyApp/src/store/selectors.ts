import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

export const selectWorkflow = (state: RootState) => state.workflow;
export const selectWorkflowStep = (state: RootState) => state.workflow.currentStep;
export const selectCategoryId = (state: RootState) => state.workflow.categoryId;
export const selectSelectedImage = (state: RootState) => state.workflow.selectedImage;
export const selectRoomType = (state: RootState) => state.workflow.roomType;
export const selectDesignStyle = (state: RootState) => state.workflow.designStyle;
export const selectColorPalette = (state: RootState) => state.workflow.colorPalette;
export const selectIsProcessing = (state: RootState) => state.workflow.isProcessing;
export const selectWorkflowResult = (state: RootState) => state.workflow.result;

export const selectUser = (state: RootState) => state.user;
export const selectUserId = (state: RootState) => state.user.id;
export const selectUserPreferences = (state: RootState) => state.user.preferences;
export const selectUserSavedDesigns = (state: RootState) => state.user.savedDesigns;

export const selectDesigns = (state: RootState) => state.designs;
export const selectSavedDesigns = (state: RootState) => state.designs.saved;
export const selectRecentDesigns = (state: RootState) => state.designs.recent;
export const selectDesignsLoading = (state: RootState) => state.designs.loading;
export const selectDesignsError = (state: RootState) => state.designs.error;

export const selectApp = (state: RootState) => state.app;
export const selectTheme = (state: RootState) => state.app.theme;
export const selectIsOnline = (state: RootState) => state.app.isOnline;
export const selectLastSync = (state: RootState) => state.app.lastSync;

export const selectCanContinueWorkflow = (state: RootState) => {
  const { currentStep, selectedImage, roomType, designStyle, colorPalette } = state.workflow;
  
  switch (currentStep) {
    case 1: 
      return !!selectedImage;
    case 2: 
      return !!selectedImage && !!roomType;
    case 3: 
      return !!selectedImage && !!roomType && !!designStyle;
    case 4: 
      return !!selectedImage && !!roomType && !!designStyle && !!colorPalette;
    default: 
      return false;
  }
};

export const selectWorkflowProgress = (state: RootState) => {
  return (state.workflow.currentStep / 4) * 100;
};

export const selectWorkflowData = createSelector(
  [selectWorkflow],
  (workflow) => ({
    image: workflow.selectedImage,
    roomType: workflow.roomType,
    style: workflow.designStyle,
    colorPalette: workflow.colorPalette,
    currentStep: workflow.currentStep,
    categoryId: workflow.categoryId,
  })
);