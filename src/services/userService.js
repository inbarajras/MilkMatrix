import { supabase } from './supabase';

export const userService = {
  /**
   * Get user profile information including display name
   * @param {string} userId - The user ID from auth
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, email, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error in getUserProfile:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get user display name for use in records
   * @param {string} userId - The user ID from auth
   * @returns {string} User display name or fallback
   */
  async getUserDisplayName(userId) {
    try {
      const { data, error } = await this.getUserProfile(userId);
      
      if (error || !data) {
        console.warn('Could not fetch user profile, using fallback name');
        return 'Mobile App User'; // Fallback if profile fetch fails
      }

      // Use display_name if available, otherwise construct from first/last name
      if (data.display_name && data.display_name.trim()) {
        return data.display_name.trim();
      }

      // Construct name from first_name and last_name
      const firstName = data.first_name ? data.first_name.trim() : '';
      const lastName = data.last_name ? data.last_name.trim() : '';
      
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }

      // If no name components available, use email prefix
      if (data.email) {
        const emailPrefix = data.email.split('@')[0];
        return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }

      // Final fallback
      return 'Mobile App User';
    } catch (err) {
      console.error('Error getting user display name:', err);
      return 'Mobile App User'; // Fallback on any error
    }
  },

  /**
   * Update user profile information
   * @param {string} userId - The user ID from auth
   * @param {Object} updates - Profile updates
   * @returns {Object} Updated profile data
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error in updateUserProfile:', err);
      return { data: null, error: err };
    }
  }
};
