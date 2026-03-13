/**
 * Quiz Service (Web Only)
 * Handles quiz data submission to Supabase
 */

import { supabase, isSupabaseConfigured } from '../config/supabase.web';

export interface QuizAnswers {
  // Basic info
  name?: string;

  // Design preferences
  livingSituation?: string;
  designGoal?: string;
  designChallenge?: string;
  stylePreference?: string;
  roomPriority?: string;
  colorPreference?: string;

  // Project details
  budget?: string;
  timeline?: string;
  experience?: string;
  desiredFeeling?: string;
  readiness?: string;

  // Analysis popup answers
  designApproach?: string;
  decisionStyle?: string;
  designPhilosophy?: string;

  // Image upload
  roomImageUrl?: string;

  // Email capture
  email?: string;
  emailConsent?: boolean;
}

export interface QuizEmailCapture {
  id: string;
  email: string;
  email_consent: boolean;
  name: string | null;
  living_situation: string | null;
  design_goal: string | null;
  design_challenge: string | null;
  style_preference: string | null;
  room_priority: string | null;
  color_preference: string | null;
  budget: string | null;
  timeline: string | null;
  experience: string | null;
  desired_feeling: string | null;
  readiness: string | null;
  design_approach: string | null;
  decision_style: string | null;
  design_philosophy: string | null;
  room_image_url: string | null;
  quiz_type: string;
  source: string;
  created_at: string;
  updated_at: string;
}

/**
 * Save quiz answers and email to database
 */
export const saveQuizEmailCapture = async (
  answers: QuizAnswers
): Promise<{ success: boolean; error?: string; data?: QuizEmailCapture }> => {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured. Quiz data not saved.');
      return {
        success: false,
        error: 'Database not configured',
      };
    }

    // Validate required fields
    if (!answers.email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }

    // Transform camelCase to snake_case for database
    const dbData = {
      email: answers.email.toLowerCase().trim(),
      email_consent: answers.emailConsent ?? true,
      name: answers.name || null,
      living_situation: answers.livingSituation || null,
      design_goal: answers.designGoal || null,
      design_challenge: answers.designChallenge || null,
      style_preference: answers.stylePreference || null,
      room_priority: answers.roomPriority || null,
      color_preference: answers.colorPreference || null,
      budget: answers.budget || null,
      timeline: answers.timeline || null,
      experience: answers.experience || null,
      desired_feeling: answers.desiredFeeling || null,
      readiness: answers.readiness || null,
      design_approach: answers.designApproach || null,
      decision_style: answers.decisionStyle || null,
      design_philosophy: answers.designPhilosophy || null,
      room_image_url: answers.roomImageUrl || null,
      quiz_type: 'interior-design',
      source: 'web-quiz',
    };

    console.log('📤 Saving quiz data to Supabase...', { email: dbData.email });

    // Insert into database
    const { data, error } = await supabase
      .from('quiz_email_captures')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving quiz data:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Quiz data saved successfully!', { id: data.id });

    return {
      success: true,
      data: data as QuizEmailCapture,
    };
  } catch (error: any) {
    console.error('❌ Exception while saving quiz data:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};

/**
 * Check if email already exists in database
 */
export const checkEmailExists = async (
  email: string
): Promise<{ exists: boolean; error?: string }> => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured.');
      return { exists: false };
    }

    const { data, error } = await supabase
      .from('quiz_email_captures')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error) {
      console.error('Error checking email:', error);
      return { exists: false, error: error.message };
    }

    return { exists: data && data.length > 0 };
  } catch (error: any) {
    console.error('Exception while checking email:', error);
    return { exists: false, error: error.message };
  }
};

/**
 * Get all quiz submissions (for admin/analytics)
 */
export const getAllQuizSubmissions = async (): Promise<{
  success: boolean;
  data?: QuizEmailCapture[];
  error?: string;
}> => {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database not configured' };
    }

    const { data, error } = await supabase
      .from('quiz_email_captures')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as QuizEmailCapture[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
