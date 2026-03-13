import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkflowState, RoomType, DesignStyle, ColorPalette, DesignResult } from '../../types';
import { WORKFLOW_STEPS } from '../../constants/app';

const initialState: WorkflowState = {
  currentStep: WORKFLOW_STEPS.PHOTO_UPLOAD,
  categoryId: undefined,
  selectedImage: undefined,
  roomType: undefined,
  designStyle: undefined,
  colorPalette: undefined,
  customPrompt: undefined,
  transformedImage: undefined,
  isProcessing: false,
  result: undefined,
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < WORKFLOW_STEPS.TOTAL_STEPS) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    setCategoryId: (state, action: PayloadAction<string>) => {
      state.categoryId = action.payload;
    },
    setSelectedImage: (state, action: PayloadAction<string>) => {
      state.selectedImage = action.payload;
    },
    setRoomType: (state, action: PayloadAction<RoomType>) => {
      state.roomType = action.payload;
    },
    setDesignStyle: (state, action: PayloadAction<DesignStyle>) => {
      state.designStyle = action.payload;
    },
    setColorPalette: (state, action: PayloadAction<ColorPalette>) => {
      state.colorPalette = action.payload;
    },
    setCustomPrompt: (state, action: PayloadAction<string>) => {
      state.customPrompt = action.payload;
    },
    setTransformedImage: (state, action: PayloadAction<string>) => {
      state.transformedImage = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setResult: (state, action: PayloadAction<DesignResult>) => {
      state.result = action.payload;
      state.isProcessing = false;
    },
    resetWorkflow: (state) => {
      return {
        ...initialState,
        currentStep: WORKFLOW_STEPS.PHOTO_UPLOAD,
      };
    },
    clearResult: (state) => {
      state.result = undefined;
      state.isProcessing = false;
    },
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  setCategoryId,
  setSelectedImage,
  setRoomType,
  setDesignStyle,
  setColorPalette,
  setCustomPrompt,
  setTransformedImage,
  setProcessing,
  setResult,
  resetWorkflow,
  clearResult,
} = workflowSlice.actions;

export default workflowSlice.reducer;