# Comprehensive Field Mapping for MilkMatrix

This document provides a complete mapping of all UI fields to database columns for both milk production and health event recording.

## Milk Production Record Creation

### Required Fields (*)
- **Collection Date*** → `date` (DATE)
- **Shift*** → `shift` (VARCHAR) - Options: Morning, Evening
- **Total Quantity (L)*** → `amount` (DECIMAL(10,2))

### Quality Assessment
- **Quality** → `quality` (VARCHAR) - Options: Good, Fair, Poor

### Quality Parameters (Optional)
- **Fat (%)** → `fat` (DECIMAL(4,2))
- **Protein (%)** → `protein` (DECIMAL(4,2)) 
- **Lactose (%)** → `lactose` (DECIMAL(4,2))
- **Somatic Cell Count (thousands/ml)** → `somatic_cell_count` (INTEGER)
- **Bacteria Count (CFU/ml)** → `bacteria_count` (INTEGER)

### Additional Information
- **Notes** → `notes` (TEXT)

### Auto-Generated Fields
- **Cow ID** → `cow_id` (UUID) - From QR scan or selection
- **Created At** → `created_at` (TIMESTAMP) - Auto-generated

## Health Event Record Creation

### Required Fields (*)
- **Event Type*** → `event_type` (VARCHAR)
  - Options: Vaccination, Illness, Injury, Pregnancy Check, Breeding, Treatment, Routine Check, Other
- **Event Date*** → `event_date` (DATE)
- **Description*** → `description` (TEXT)

### Status and Follow-up
- **Status** → `status` (VARCHAR) - Options: pending, completed, urgent, cancelled
- **Follow-up Date** → `follow_up` (DATE) - Optional

### Treatment Information
- **Treatment/Medication** → `medications` (JSONB) - Stored as array of medication objects
- **Performed By** → `performed_by` (VARCHAR)

### Additional Information
- **Notes** → `notes` (TEXT)

### Auto-Generated Fields
- **Cow ID** → `cow_id` (UUID) - From QR scan or selection
- **Created At** → `created_at` (TIMESTAMP) - Auto-generated

## Data Validation Rules

### Milk Production
1. Collection date cannot be in the future
2. Quantity must be a positive number
3. Quality parameters (fat, protein, lactose) must be between 0-100%
4. Cell counts must be positive integers
5. Shift must be either "Morning" or "Evening"

### Health Events
1. Event date cannot be in the future
2. Event type must be selected from predefined list
3. Description is required and cannot be empty
4. Follow-up date must be after event date
5. Status must be one of: pending, completed, urgent, cancelled

## Field Mapping Implementation Status

### ✅ Completed
- Milk production basic fields (quantity, fat, protein)
- Health event basic fields (type, description, treatment)
- QR code cow selection
- Form validation
- Database field mapping corrections

### 🔄 Enhanced (This Update)
- Added collection date and shift for milk production
- Added quality assessment options
- Added lactose, somatic cell count, bacteria count for milk quality
- Added event date, performed by, follow-up date for health events
- Enhanced form validation
- Updated database schema

### 📝 Notes
- All percentage fields are stored as DECIMAL(4,2) allowing values like 3.45%
- Cell counts are stored as INTEGER values
- JSONB fields (medications) allow for flexible medication tracking
- All date fields use ISO date format (YYYY-MM-DD)
- Follow-up dates are optional but must be validated if provided

## Database Schema Updates Required

The following columns were added to support the enhanced field mapping:

```sql
-- Milk Production Table Updates
ALTER TABLE milk_production ADD COLUMN fat DECIMAL(4,2);
ALTER TABLE milk_production ADD COLUMN protein DECIMAL(4,2);
ALTER TABLE milk_production ADD COLUMN lactose DECIMAL(4,2);
ALTER TABLE milk_production ADD COLUMN somatic_cell_count INTEGER;
ALTER TABLE milk_production ADD COLUMN bacteria_count INTEGER;

-- Health Events Table (already supports all required fields)
-- No additional columns needed
```
