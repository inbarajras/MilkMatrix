# Database Field Mappings for MilkMatrix

This document provides mappings between UI field names and database column names to prevent confusion and errors.

## Milk Production Table

| UI Field Name        | Database Column Name | Data Type      | Notes                                   |
|----------------------|----------------------|----------------|------------------------------------------|
| `quantity`           | `amount`             | DECIMAL(10,2)  | Milk quantity in liters                  |
| `fatContent`         | `fat`                | DECIMAL(4,2)   | Fat content percentage                   |
| `proteinContent`     | `protein`            | DECIMAL(4,2)   | Protein content percentage               |
| `lactoseContent`     | `lactose`            | DECIMAL(4,2)   | Lactose content percentage              |
| `somaticCount`       | `somatic_cell_count` | INTEGER        | Somatic cell count (thousands/ml)        |
| `bacteriaCount`      | `bacteria_count`     | INTEGER        | Bacteria count (CFU/ml)                  |
| `collectionDate`     | `date`               | DATE           | Date of milk collection                  |
| `shift`              | `shift`              | VARCHAR        | Morning/Evening                          |
| `quality`            | `quality`            | VARCHAR        | Good/Fair/Poor quality rating            |
| `notes`              | `notes`              | TEXT           | Additional notes                         |
| n/a                  | `created_at`         | TIMESTAMP      | Record creation timestamp                |
| n/a                  | `cow_id`             | UUID           | Foreign key reference to cows table      |

## Health Events Table

| UI Field Name        | Database Column Name | Data Type      | Notes                                   |
|----------------------|----------------------|----------------|------------------------------------------|
| `eventType`          | `event_type`         | VARCHAR        | Type of health event                     |
| `eventDate`          | `event_date`         | DATE           | Date of the health event                 |
| `description`        | `description`        | TEXT           | Detailed description                     |
| `treatment`          | `medications`        | JSONB          | Treatment stored as medications array    |
| `performedBy`        | `performed_by`       | VARCHAR        | Person who performed the health event    |
| `followUpDate`       | `follow_up`          | DATE           | Follow-up date if needed                 |
| `status`             | `status`             | VARCHAR        | Status: pending/completed/urgent/cancelled |
| `notes`              | `notes`              | TEXT           | Additional notes                         |
| n/a                  | `created_at`         | TIMESTAMP      | Record creation timestamp                |
| n/a                  | `cow_id`             | UUID           | Foreign key reference to cows table      |

## Cows Table

| UI Field Name    | Database Column Name | Data Type      | Notes                                   |
|------------------|----------------------|----------------|------------------------------------------|
| `tagNumber`      | `tag_number`         | VARCHAR        | Unique identifier tag number             |
| `name`           | `name`               | VARCHAR        | Cow's name                               |
| `breed`          | `breed`              | VARCHAR        | Breed of the cow                         |
| `dateOfBirth`    | `date_of_birth`      | DATE           | Birth date                               |
| `status`         | `status`             | VARCHAR        | Current status (active, sold, etc.)      |
| `healthStatus`   | `health_status`      | VARCHAR        | Current health status                    |
| `owner`          | `owner`              | VARCHAR        | Owner name                               |
| `lastHealthCheck`| `last_health_check`  | DATE           | Date of last health check                |
| `vaccinationStatus` | `vaccination_status` | VARCHAR     | Current vaccination status               |
| `alerts`         | `alerts`             | JSONB          | JSON array of alerts                     |
| `imageUrl`       | `image_url`          | VARCHAR        | URL to cow's image                       |
| n/a              | `created_at`         | TIMESTAMP      | Record creation timestamp                |
| n/a              | `updated_at`         | TIMESTAMP      | Record update timestamp                  |
