import { supabase } from '../services/supabase';

// Sample cow data for testing
const sampleCows = [
  {
    tag_number: '001',
    name: 'Bessie',
    breed: 'Holstein',
    date_of_birth: '2021-03-15',
    status: 'active',
    health_status: 'healthy',
    owner: 'Farm Manager',
    vaccination_status: 'up_to_date',
    notes: 'High milk producer, excellent health record'
  },
  {
    tag_number: '002', 
    name: 'Luna',
    breed: 'Jersey',
    date_of_birth: '2020-07-22',
    status: 'active',
    health_status: 'healthy',
    owner: 'Farm Manager',
    vaccination_status: 'up_to_date',
    notes: 'Gentle temperament, consistent milk quality'
  },
  {
    tag_number: '003',
    name: 'Maple',
    breed: 'Guernsey',
    date_of_birth: '2021-11-08',
    status: 'active',
    health_status: 'healthy',
    owner: 'Farm Manager',
    vaccination_status: 'up_to_date',
    notes: 'Young cow, good potential'
  },
  {
    tag_number: '004',
    name: 'Daisy',
    breed: 'Holstein',
    date_of_birth: '2019-12-03',
    status: 'active',
    health_status: 'healthy',
    owner: 'Farm Manager',
    vaccination_status: 'due_soon',
    notes: 'Experienced cow, reliable milk production'
  },
  {
    tag_number: '005',
    name: 'Rosie',
    breed: 'Jersey',
    date_of_birth: '2022-01-18',
    status: 'active',
    health_status: 'healthy',
    owner: 'Farm Manager',
    vaccination_status: 'up_to_date',
    notes: 'Young cow, recently started milking'
  }
];

// Sample milk production data
const generateSampleMilkData = (cowIds) => {
  const milkData = [];
  const today = new Date();
  
  // Generate milk records for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    cowIds.forEach((cowId, index) => {
      // Morning milking
      milkData.push({
        cow_id: cowId,
        date: dateStr,
        amount: (15 + Math.random() * 10).toFixed(2), // 15-25 liters
        shift: 'Morning',
        quality: ['Good', 'Excellent', 'Good', 'Good', 'Excellent'][Math.floor(Math.random() * 5)],
        notes: i === 0 ? 'Fresh morning milk' : null
      });
      
      // Evening milking
      milkData.push({
        cow_id: cowId,
        date: dateStr,
        amount: (12 + Math.random() * 8).toFixed(2), // 12-20 liters
        shift: 'Evening',
        quality: ['Good', 'Excellent', 'Good'][Math.floor(Math.random() * 3)],
        notes: null
      });
    });
  }
  
  return milkData;
};

// Sample health events
const generateSampleHealthEvents = (cowIds) => {
  const healthEvents = [];
  const today = new Date();
  
  // Add some recent health events
  cowIds.forEach((cowId, index) => {
    if (index % 2 === 0) { // Every other cow has a health event
      const eventDate = new Date(today);
      eventDate.setDate(eventDate.getDate() - (index + 1) * 5);
      
      healthEvents.push({
        cow_id: cowId,
        event_type: ['Vaccination', 'Health Check', 'Treatment'][index % 3],
        event_date: eventDate.toISOString().split('T')[0],
        description: [
          'Annual vaccination administered',
          'Routine health examination',
          'Minor cut treatment on leg'
        ][index % 3],
        performed_by: 'Dr. Smith',
        status: 'completed'
      });
    }
  });
  
  return healthEvents;
};

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Check if cows already exist
    const { data: existingCows, error: checkError } = await supabase
      .from('cows')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing cows:', checkError);
      throw checkError;
    }
    
    if (existingCows && existingCows.length > 0) {
      console.log('Database already has cow data, showing existing cows...');
      
      // Get existing cows for debugging
      const { data: allCows } = await supabase.from('cows').select('tag_number, name');
      console.log('Existing cows:', allCows);
      
      return { success: true, message: 'Database already seeded', data: allCows };
    }
    
    // Validate required fields before inserting
    const missingFields = [];
    sampleCows.forEach((cow, index) => {
      const requiredFields = ['tag_number', 'name', 'breed', 'date_of_birth', 'status', 'health_status', 'owner'];
      const missing = requiredFields.filter(field => !cow[field]);
      if (missing.length > 0) {
        missingFields.push(`Cow ${index} (${cow.tag_number || 'unknown'}) missing fields: ${missing.join(', ')}`);
      }
    });
    
    if (missingFields.length > 0) {
      const errorMessage = `Sample cow data missing required fields: ${missingFields.join('; ')}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }
    
    // Insert sample cows
    console.log('Inserting sample cows...');
    const { data: cowData, error: cowError } = await supabase
      .from('cows')
      .insert(sampleCows)
      .select('id');
    
    if (cowError) {
      console.error('Error inserting sample cows:', cowError);
      throw cowError;
    }
    
    console.log(`Inserted ${cowData.length} cows`);
    
    // Get cow IDs for related data
    const cowIds = cowData.map(cow => cow.id);
    
    // Insert sample milk production data
    console.log('Inserting sample milk production data...');
    const milkData = generateSampleMilkData(cowIds);
    const { error: milkError } = await supabase
      .from('milk_production')
      .insert(milkData);
    
    if (milkError) {
      throw milkError;
    }
    
    console.log(`Inserted ${milkData.length} milk production records`);
    
    // Insert sample health events
    console.log('Inserting sample health events...');
    const healthData = generateSampleHealthEvents(cowIds);
    const { error: healthError } = await supabase
      .from('health_events')
      .insert(healthData);
    
    if (healthError) {
      throw healthError;
    }
    
    console.log(`Inserted ${healthData.length} health events`);
    
    console.log('Database seeding completed successfully!');
    return { 
      success: true, 
      message: `Seeded ${cowData.length} cows, ${milkData.length} milk records, ${healthData.length} health events` 
    };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};

export const clearAllData = async () => {
  try {
    console.log('Clearing all data...');
    
    // Delete in order due to foreign key constraints
    await supabase.from('breeding_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('health_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('milk_production').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All data cleared');
    return { success: true, message: 'All data cleared successfully' };
  } catch (error) {
    console.error('Error clearing data:', error);
    return { success: false, error: error.message };
  }
};
