import { supabase } from './supabase';

export const cowService = {
  // Get cow by tag number (for QR scanning)
  async getCowByTagNumber(tagNumber) {
    try {
      // Fallback for null/undefined values
      if (!tagNumber) {
        return { 
          data: null, 
          error: { 
            message: 'Invalid QR code: no tag number provided',
            code: 'INVALID_QR'
          } 
        };
      }
      
      // Convert to string and trim in case we get a number or whitespace
      const normalizedTag = String(tagNumber).trim();
      
      const { data, error } = await supabase
        .from('cows')
        .select('*')
        .eq('tag_number', normalizedTag);
      
      if (error) throw error;
      
      // Check if cow was found
      if (!data || data.length === 0) {
        return { 
          data: null, 
          error: { 
            message: `No cow found with tag number: ${tagNumber}`,
            code: 'COW_NOT_FOUND'
          } 
        };
      }
      
      // Return the first (and should be only) cow found
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error fetching cow by tag number:', error);
      return { data: null, error };
    }
  },

  // Get all cows
  async getAllCows() {
    try {
      const { data, error } = await supabase
        .from('cows')
        .select('*')
        .order('tag_number');
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all cows:', error);
      return { data: null, error };
    }
  },

  // Get cow by ID (primary key, used for QR scanning)
  async getCowById(id) {
    try {
      // Fallback for null/undefined values
      if (!id) {
        return { 
          data: null, 
          error: { 
            message: 'Invalid QR code: no cow ID provided',
            code: 'INVALID_QR'
          } 
        };
      }
      
      try {
        // Use single() to get exactly one row since we're querying by primary key
        const { data, error } = await supabase
          .from('cows')
          .select(`
            *,
            milk_production (
              count
            ),
            health_events (
              count
            )
          `)
          .eq('id', id)
          .maybeSingle(); // use maybeSingle() instead of single() to avoid PGRST116 error
        
        if (error) throw error;
        
        // Check if cow was found
        if (!data) {
          return { 
            data: null, 
            error: { 
              message: `No cow found with ID: ${id}`,
              code: 'COW_NOT_FOUND'
            } 
          };
        }
        
        return { data, error: null };
      } catch (error) {
        // Handle specific PostgreSQL errors
        if (error.code === 'PGRST116') {
          return { 
            data: null, 
            error: { 
              message: `No cow found with ID: ${id}`,
              code: 'COW_NOT_FOUND'
            } 
          };
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching cow by ID:', error);
      return { data: null, error };
    }
  },

  // Search cows by name or tag number
  async searchCows(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('cows')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,tag_number.ilike.%${searchTerm}%`)
        .order('tag_number');
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching cows:', error);
      return { data: null, error };
    }
  },

  // Get cow with recent records
  async getCowWithRecentRecords(cowId) {
    try {
      // Get cow details
      const { data: cowData, error: cowError } = await supabase
        .from('cows')
        .select('*')
        .eq('id', cowId);
      
      if (cowError) throw cowError;
      
      // Check if cow was found
      if (!cowData || cowData.length === 0) {
        return { 
          data: null, 
          error: { 
            message: `No cow found with ID: ${cowId}`,
            code: 'COW_NOT_FOUND'
          } 
        };
      }
      
      const cow = cowData[0];

      // Get recent milk records
      const { data: milkRecords, error: milkError } = await supabase
        .from('milk_production')
        .select('*')
        .eq('cow_id', cowId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent health records
      const { data: healthRecords, error: healthError } = await supabase
        .from('health_events')
        .select('*')
        .eq('cow_id', cowId)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        data: {
          cow,
          milkRecords: milkRecords || [],
          healthRecords: healthRecords || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching cow with recent records:', error);
      return { data: null, error };
    }
  }
};
