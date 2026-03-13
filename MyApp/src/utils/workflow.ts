import { WorkflowState, RoomType, DesignStyle, ColorPalette } from '../types';
import { WORKFLOW_STEPS } from '../constants/app';

export const validateWorkflowStep = (
  step: number,
  state: WorkflowState
): boolean => {
  switch (step) {
    case WORKFLOW_STEPS.PHOTO_UPLOAD:
      return !!state.selectedImage;
    case WORKFLOW_STEPS.ROOM_TYPE:
      return !!state.selectedImage && !!state.roomType;
    case WORKFLOW_STEPS.STYLE_SELECTION:
      return !!state.selectedImage && !!state.roomType && !!state.designStyle;
    case WORKFLOW_STEPS.COLOR_PALETTE:
      return (
        !!state.selectedImage &&
        !!state.roomType &&
        !!state.designStyle &&
        !!state.colorPalette
      );
    default:
      return false;
  }
};

export const canProceedToNextStep = (
  currentStep: number,
  state: WorkflowState
): boolean => {
  return validateWorkflowStep(currentStep, state);
};

export const getWorkflowCompletion = (state: WorkflowState): number => {
  let completedSteps = 0;
  
  if (state.selectedImage) completedSteps++;
  if (state.roomType) completedSteps++;
  if (state.designStyle) completedSteps++;
  if (state.colorPalette) completedSteps++;
  
  return (completedSteps / WORKFLOW_STEPS.TOTAL_STEPS) * 100;
};

export const isWorkflowComplete = (state: WorkflowState): boolean => {
  return !!(
    state.selectedImage &&
    state.roomType &&
    state.designStyle &&
    state.colorPalette
  );
};

export const getStepTitle = (step: number): string => {
  switch (step) {
    case WORKFLOW_STEPS.PHOTO_UPLOAD:
      return 'Upload Photo';
    case WORKFLOW_STEPS.ROOM_TYPE:
      return 'Select Room Type';
    case WORKFLOW_STEPS.STYLE_SELECTION:
      return 'Choose Style';
    case WORKFLOW_STEPS.COLOR_PALETTE:
      return 'Pick Colors';
    default:
      return 'Unknown Step';
  }
};

export const getStepDescription = (step: number): string => {
  switch (step) {
    case WORKFLOW_STEPS.PHOTO_UPLOAD:
      return 'Take or choose a photo of your space';
    case WORKFLOW_STEPS.ROOM_TYPE:
      return 'What type of room is this?';
    case WORKFLOW_STEPS.STYLE_SELECTION:
      return 'What design style do you prefer?';
    case WORKFLOW_STEPS.COLOR_PALETTE:
      return 'Choose your color palette';
    default:
      return '';
  }
};