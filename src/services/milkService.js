import { supabase } from './supabase';

export const milkService = {
  // Check for existing milk record with same cow, date, and shift
  async checkDuplicateRecord(cowId, date, shift) {
    try {
      const { data, error } = await supabase
        .from('milk_production')
        .select('id, amount, shift')
        .eq('cow_id', cowId)
        .eq('date', date)
        .eq('shift', shift)
        .maybeSingle();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error checking for duplicate record:', error);
      return { data: null, error };
    }
  },

  // Create a new milk record
  async createMilkRecord(milkData) {
    try {
      // Check for duplicate record first
      const { data: existingRecord, error: duplicateError } = await this.checkDuplicateRecord(
        milkData.cow_id,
        milkData.date,
        milkData.shift
      );
      
      if (duplicateError) {
        return { data: null, error: duplicateError };
      }
      
      if (existingRecord) {
        return { 
          data: null, 
          error: { 
            message: `A milk record already exists for this cow on ${milkData.date} during ${milkData.shift} shift. Please edit the existing record instead.`,
            code: 'DUPLICATE_RECORD',
            existingRecord
          } 
        };
      }

      const { data, error } = await supabase
        .from('milk_production')
        .insert([milkData])
        .select();
      
      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error creating milk record:', error);
      return { data: null, error };
    }
  },

  // Get milk records for a specific cow
  async getMilkRecordsByCow(cowId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('milk_production')
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
      console.error('Error fetching milk records:', error);
      return { data: null, error };
    }
  },

  // Get today's milk records
  async getTodayMilkRecords() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('milk_production')
        .select(`
          *,
          cows (
            tag_number,
            name
          )
        `)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching today\'s milk records:', error);
      return { data: null, error };
    }
  },

  // Update a milk record
  async updateMilkRecord(id, updates) {
    try {
      const { data, error } = await supabase
        .from('milk_production')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { 
          data: null, 
          error: { 
            message: `No milk record found with ID: ${id}`,
            code: 'RECORD_NOT_FOUND'
          } 
        };
      }
      
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error updating milk record:', error);
      return { data: null, error };
    }
  },

  // Delete a milk record
  async deleteMilkRecord(id) {
    try {
      const { data, error } = await supabase
        .from('milk_production')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { 
          data: null, 
          error: { 
            message: `No milk record found with ID: ${id}`,
            code: 'RECORD_NOT_FOUND'
          } 
        };
      }
      
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error deleting milk record:', error);
      return { data: null, error };
    }
  },

  // Get milk production summary
  async getMilkProductionSummary(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('milk_production')
        .select('amount, fat, protein, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      // Calculate summary statistics
      const summary = {
        totalQuantity: data.reduce((sum, record) => sum + (record.amount || 0), 0),
        averageFat: data.length > 0 ? data.reduce((sum, record) => sum + (record.fat || 0), 0) / data.length : 0,
        averageProtein: data.length > 0 ? data.reduce((sum, record) => sum + (record.protein || 0), 0) / data.length : 0,
        recordCount: data.length,
      };
      
      return { data: summary, error: null };
    } catch (error) {
      console.error('Error fetching milk production summary:', error);
      return { data: null, error };
    }
  },

  // Enhanced milk record creation with quality assessment
  async createMilkRecordWithQuality(milkData) {
    try {
      // Prepare record data first
      const date = milkData.date || new Date().toISOString().split('T')[0];
      const shift = milkData.shift || 'Morning';
      
      // Check for duplicate record first
      const { data: existingRecord, error: duplicateError } = await this.checkDuplicateRecord(
        milkData.cow_id,
        date,
        shift
      );
      
      if (duplicateError) {
        return { data: null, error: duplicateError };
      }
      
      if (existingRecord) {
        return { 
          data: null, 
          error: { 
            message: `A milk record already exists for this cow on ${date} during ${shift} shift. Please edit the existing record instead.`,
            code: 'DUPLICATE_RECORD',
            existingRecord
          } 
        };
      }

      // Calculate quality grade if quality parameters are provided
      let qualityGrade = 'Good'; // default
      if (milkData.fat || milkData.protein || milkData.somatic || milkData.bacteria) {
        qualityGrade = this.determineQualityGrade({
          fat: milkData.fat,
          protein: milkData.protein,
          somatic: milkData.somatic,
          bacteria: milkData.bacteria
        });
      }

      const recordData = {
        cow_id: milkData.cow_id,
        date: date,
        amount: parseFloat(milkData.amount),
        shift: shift,
        quality: milkData.quality || 'Good',
        notes: milkData.notes || null,
        fat: milkData.fat ? parseFloat(milkData.fat) : null,
        protein: milkData.protein ? parseFloat(milkData.protein) : null,
        lactose: milkData.lactose ? parseFloat(milkData.lactose) : null,
        somatic_cell_count: milkData.somatic ? parseInt(milkData.somatic) : null,
        bacteria_count: milkData.bacteria ? parseInt(milkData.bacteria) : null,
        quality_grade: qualityGrade
      };

      const { data, error } = await supabase
        .from('milk_production')
        .insert([recordData])
        .select(`
          *,
          cows (
            tag_number,
            name,
            breed
          )
        `);
      
      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error creating milk record with quality:', error);
      return { data: null, error };
    }
  },

  // Quality grade determination helper
  determineQualityGrade(params) {
    // Default to "Good" if parameters are missing
    if (!params.fat && !params.protein && !params.somatic && !params.bacteria) {
      return "Good";
    }
    
    // Get quality standards
    const standards = {
      fat: { min: 3.5, target: 3.8, max: 4.2 },
      protein: { min: 3.0, target: 3.3, max: 3.6 },
      somatic: { max: 200 }, // thousands/ml
      bacteria: { max: 20000 } // CFU/ml
    };
    
    // Score each parameter (0-5 scale)
    let scores = [];
    
    if (params.fat) {
      if (params.fat >= standards.fat.target - 0.1 && params.fat <= standards.fat.target + 0.1) {
        scores.push(5); // Excellent
      } else if (params.fat >= standards.fat.min && params.fat <= standards.fat.max) {
        scores.push(4); // Good
      } else if (params.fat >= standards.fat.min - 0.3 || params.fat <= standards.fat.max + 0.3) {
        scores.push(3); // Average
      } else {
        scores.push(2); // Poor
      }
    }
    
    if (params.protein) {
      if (params.protein >= standards.protein.target - 0.1 && params.protein <= standards.protein.target + 0.1) {
        scores.push(5); // Excellent
      } else if (params.protein >= standards.protein.min && params.protein <= standards.protein.max) {
        scores.push(4); // Good
      } else if (params.protein >= standards.protein.min - 0.3 || params.protein <= standards.protein.max + 0.3) {
        scores.push(3); // Average
      } else {
        scores.push(2); // Poor
      }
    }
    
    if (params.somatic) {
      if (params.somatic < standards.somatic.max * 0.6) {
        scores.push(5); // Excellent
      } else if (params.somatic < standards.somatic.max * 0.8) {
        scores.push(4); // Good
      } else if (params.somatic < standards.somatic.max) {
        scores.push(3); // Average
      } else {
        scores.push(2); // Poor
      }
    }
    
    if (params.bacteria) {
      if (params.bacteria < standards.bacteria.max * 0.6) {
        scores.push(5); // Excellent
      } else if (params.bacteria < standards.bacteria.max * 0.8) {
        scores.push(4); // Good
      } else if (params.bacteria < standards.bacteria.max) {
        scores.push(3); // Average
      } else {
        scores.push(2); // Poor
      }
    }
    
    // Calculate average score
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Determine grade based on average score
    if (avgScore >= 4.5) return "Excellent";
    if (avgScore >= 3.5) return "Good";
    if (avgScore >= 2.5) return "Average";
    return "Poor";
  },

  // Get quality standards
  getQualityStandards() {
    return {
      fat: { min: 3.5, target: 3.8, max: 4.2 },
      protein: { min: 3.0, target: 3.3, max: 3.6 },
      lactose: { min: 4.5, target: 4.8, max: 5.0 },
      somatic: { max: 200 },
      bacteria: { max: 20000 }
    };
  },
};
