import { supabase } from '../services/supabase';

/**
 * Creates a test cow with the given tag number
 * This is useful for testing the QR scanning feature when the scanned tag doesn't exist yet
 */
export const createTestCow = async (tagNumber) => {
  try {
    // Normalize the tag number
    const normalizedTag = String(tagNumber).trim();
    
    console.log('Creating test cow with tag number:', normalizedTag);
    
    // Check if a cow with this tag already exists
    const { data: existingCow, error: checkError } = await supabase
      .from('cows')
      .select('id')
      .eq('tag_number', normalizedTag)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing cow:', checkError);
      throw checkError;
    }
    
    // If cow already exists, just return it
    if (existingCow) {
      console.log('Cow already exists with tag:', normalizedTag);
      
      const { data: fullCow } = await supabase
        .from('cows')
        .select('*')
        .eq('tag_number', normalizedTag)
        .maybeSingle();
      
      return { 
        data: fullCow, 
        success: true, 
        message: 'Cow already exists', 
        isNew: false 
      };
    }
    
    // Create a new test cow
    const cowData = {
      tag_number: normalizedTag,
      name: `Test Cow ${normalizedTag}`,
      breed: 'Test Breed',
      date_of_birth: new Date().toISOString().split('T')[0], // Today
      status: 'active',
      health_status: 'healthy',
      owner: 'Test Owner',
      notes: 'Auto-created test cow'
    };
    
    const { data: newCow, error: createError } = await supabase
      .from('cows')
      .insert([cowData])
      .select();
    
    if (createError) {
      console.error('Error creating test cow:', createError);
      throw createError;
    }
    
    console.log('Test cow created successfully:', newCow);
    
    return { 
      data: newCow[0], 
      success: true, 
      message: 'Test cow created', 
      isNew: true 
    };
    
  } catch (error) {
    console.error('Error in createTestCow:', error);
    return { 
      data: null, 
      success: false, 
      error: error.message || 'Unknown error creating test cow' 
    };
  }
};

/**
 * Helper function to validate required fields for the cows table
 */
export const validateCowData = (cowData) => {
  const requiredFields = [
    'tag_number',
    'name',
    'breed',
    'date_of_birth',
    'status',
    'health_status',
    'owner'
  ];
  
  const missingFields = requiredFields.filter(field => !cowData[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      missingFields,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { valid: true };
};
