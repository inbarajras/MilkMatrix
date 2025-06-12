import { supabase } from './supabase';

export const healthService = {
  // Create a new health record
  async createHealthRecord(healthData) {
    try {
      const { data, error } = await supabase
        .from('health_events')
        .insert([healthData])
        .select();
      
      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error creating health record:', error);
      return { data: null, error };
    }
  },

  // Get health records for a specific cow
  async getHealthRecordsByCow(cowId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('health_events')
        .select(`
          *,
          cows (
            tag_number,
            name
          )
        `)
        .eq('cow_id', cowId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching health records:', error);
      return { data: null, error };
    }
  },

  // Get recent health events
  async getRecentHealthEvents(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('health_events')
        .select(`
          *,
          cows (
            tag_number,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching recent health events:', error);
      return { data: null, error };
    }
  },

  // Update a health record
  async updateHealthRecord(id, updates) {
    try {
      const { data, error } = await supabase
        .from('health_events')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { 
          data: null, 
          error: { 
            message: `No health record found with ID: ${id}`,
            code: 'RECORD_NOT_FOUND'
          } 
        };
      }
      
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error updating health record:', error);
      return { data: null, error };
    }
  },

  // Delete a health record
  async deleteHealthRecord(id) {
    try {
      const { data, error } = await supabase
        .from('health_events')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { 
          data: null, 
          error: { 
            message: `No health record found with ID: ${id}`,
            code: 'RECORD_NOT_FOUND'
          } 
        };
      }
      
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error deleting health record:', error);
      return { data: null, error };
    }
  },

  // Get health alerts (pending or urgent health issues)
  async getHealthAlerts() {
    try {
      const { data, error } = await supabase
        .from('health_events')
        .select(`
          *,
          cows (
            tag_number,
            name
          )
        `)
        .in('status', ['pending', 'urgent'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching health alerts:', error);
      return { data: null, error };
    }
  }
};
