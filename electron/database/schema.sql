-- ============================================================================
-- CSSF Supplier Outsourcing Register - SQLite Schema
-- Maps 1:1 to TypeScript types in lib/types/supplier.ts
-- ============================================================================

-- Main suppliers table
-- Combines MandatoryOutsourcingFields (Point 54) and CriticalOutsourcingFields (Point 55)
CREATE TABLE IF NOT EXISTS suppliers (
  -- Primary key
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- ========================================================================
  -- MANDATORY FIELDS (Point 54)
  -- ========================================================================

  -- 54.a - Reference Number (unique identifier)
  reference_number TEXT NOT NULL UNIQUE,

  -- 53 - Status of outsourcing arrangement
  status TEXT NOT NULL CHECK(status IN ('Draft', 'Active', 'Not Yet Active', 'Terminated')),

  -- 54.d - Category of outsourcing
  category TEXT NOT NULL,

  -- 54.b - Dates (all mandatory per CSSF Point 54.b)
  start_date TEXT NOT NULL,                    -- ISO 8601 date string
  next_renewal_date TEXT NOT NULL,             -- ISO 8601 date string
  end_date TEXT NOT NULL,                      -- ISO 8601 date string
  service_provider_notice_period TEXT NOT NULL,
  entity_notice_period TEXT NOT NULL,

  -- 54.c - Function Description
  function_name TEXT NOT NULL,
  function_description TEXT NOT NULL,
  data_description TEXT NOT NULL,
  personal_data_involved INTEGER NOT NULL CHECK(personal_data_involved IN (0, 1)), -- Boolean
  personal_data_transferred INTEGER NOT NULL CHECK(personal_data_transferred IN (0, 1)), -- Boolean

  -- 54.e - Service Provider Information
  provider_name TEXT NOT NULL,
  corporate_registration_number TEXT NOT NULL,
  legal_entity_identifier TEXT,                -- Optional: "if any" per CSSF
  registered_address TEXT NOT NULL,
  contact_details TEXT NOT NULL,
  parent_company TEXT,                         -- Optional: "if any" per CSSF

  -- 54.f - Location Information (stored as JSON arrays)
  service_performance_countries TEXT NOT NULL, -- JSON array: ["Luxembourg", "France"]
  data_location_country TEXT NOT NULL,         -- JSON array: ["Luxembourg"]
  other_data_location_info TEXT NOT NULL,

  -- 54.g - Criticality Assessment
  is_critical INTEGER NOT NULL CHECK(is_critical IN (0, 1)), -- Boolean
  criticality_reasons TEXT NOT NULL,

  -- 54.i - Criticality Assessment Date
  criticality_assessment_date TEXT NOT NULL,   -- ISO 8601 date string

  -- ========================================================================
  -- CLOUD SERVICE FIELDS (Point 54.h) - Conditional: only when category = "Cloud"
  -- ========================================================================

  cloud_service_model TEXT,                    -- Nullable: CloudServiceModel enum
  cloud_deployment_model TEXT,                 -- Nullable: DeploymentModel enum
  cloud_data_nature TEXT,                      -- Nullable
  cloud_storage_locations TEXT,                -- Nullable JSON array: ["EU-West-1"]
  cloud_officer TEXT,                          -- Nullable (optional within cloud section)
  cloud_resource_operator TEXT,                -- Nullable (optional within cloud section)
  cloud_other_information TEXT,                -- Nullable: Other relevant cloud information

  -- ========================================================================
  -- CRITICAL FIELDS (Point 55) - Conditional: only when is_critical = true
  -- Stored as JSON blob for simplicity (entire CriticalOutsourcingFields object)
  -- ========================================================================

  critical_fields TEXT,                        -- Nullable JSON object

  -- Alternative: Store critical fields as individual columns (more normalized)
  -- Uncomment if you prefer normalized structure:
  /*
  -- 55.a - Entities Using
  entities_using TEXT,                         -- JSON array: ["Entity1", "Entity2"]

  -- 55.b - Group Relationship
  is_part_of_group INTEGER,                    -- Boolean
  is_owned_by_group INTEGER,                   -- Boolean

  -- 55.c - Risk Assessment
  risk_level TEXT,                             -- RiskLevel enum: Low/Medium/High
  last_assessment_date TEXT,                   -- ISO 8601 date
  risk_main_results TEXT,

  -- 55.d - Approval
  approver_name TEXT,
  approver_role TEXT,

  -- 55.e - Governing Law
  governing_law TEXT,

  -- 55.f - Audit Information
  last_audit_date TEXT,                        -- ISO 8601 date
  next_scheduled_audit TEXT,                   -- ISO 8601 date

  -- 55.g - Sub-Outsourcing (stored as JSON for complex nested structure)
  sub_outsourcing TEXT,                        -- JSON object with hasSubOutsourcing + subContractors array

  -- 55.h - Substitutability
  substitutability_outcome TEXT,               -- SubstitutabilityOutcome enum
  reintegration_assessment TEXT,
  discontinuation_impact TEXT,

  -- 55.i - Alternative Providers
  alternative_providers TEXT,                  -- JSON array: ["Provider A", "Provider B"]

  -- 55.j - Time Criticality
  is_time_critical INTEGER,                    -- Boolean

  -- 55.k - Cost Information
  estimated_annual_cost REAL,
  cost_comments TEXT,

  -- 55.l - Regulatory Notification
  notification_date TEXT,                      -- ISO 8601 date
  */

  -- ========================================================================
  -- TRACKING FIELDS
  -- ========================================================================

  -- Incomplete fields tracking - array of field paths
  -- Example: ["dates.startDate", "serviceProvider.name"]
  incomplete_fields TEXT,                      -- JSON array (optional)

  -- Pending fields tracking - array of field paths marked as "to be completed later"
  -- Example: ["referenceNumber", "criticalFields.riskAssessment.risk"]
  pending_fields TEXT,                         -- JSON array (optional)

  -- ========================================================================
  -- METADATA
  -- ========================================================================

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- INDEXES for query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_critical ON suppliers(is_critical);
CREATE INDEX IF NOT EXISTS idx_suppliers_provider_name ON suppliers(provider_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at);

-- ============================================================================
-- TRIGGER to auto-update updated_at timestamp
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS update_suppliers_timestamp
AFTER UPDATE ON suppliers
FOR EACH ROW
BEGIN
  UPDATE suppliers SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- NOTES ON DATA TYPES
-- ============================================================================

-- TEXT: SQLite's native text type (UTF-8)
-- INTEGER: Used for numbers and booleans (0 = false, 1 = true)
-- REAL: Used for floating-point numbers (e.g., costs)
-- JSON Arrays/Objects: Stored as TEXT, parsed in application code

-- SQLite date format: ISO 8601 strings (e.g., "2024-12-02T10:30:00Z")
-- SQLite supports JSON functions: json_extract(), json_array(), etc.

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

-- Schema version table (for future migrations)
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert initial schema version
INSERT OR IGNORE INTO schema_version (version) VALUES (1);

-- ============================================================================
-- CRITICAL OUTSOURCING MONITOR TABLE
-- Stores user-input fields for critical active suppliers
-- ============================================================================

CREATE TABLE IF NOT EXISTS critical_monitor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_reference_number TEXT NOT NULL UNIQUE,
  contract TEXT,
  suitability_assessment_date TEXT,
  audit_reports TEXT,
  co_ro_assessment_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (supplier_reference_number) REFERENCES suppliers(reference_number) ON DELETE CASCADE
);

-- Trigger to auto-update updated_at timestamp for critical_monitor
CREATE TRIGGER IF NOT EXISTS update_critical_monitor_timestamp
AFTER UPDATE ON critical_monitor
FOR EACH ROW
BEGIN
  UPDATE critical_monitor SET updated_at = datetime('now') WHERE id = NEW.id;
END;
