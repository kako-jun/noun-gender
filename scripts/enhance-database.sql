-- Phase 2: Database Schema Enhancement
-- Add new columns to all language tables

-- French
ALTER TABLE translation_fr ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_fr ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_fr ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_fr ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_fr ADD COLUMN gender_reason_1 TEXT;

-- German  
ALTER TABLE translation_de ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_de ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_de ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_de ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_de ADD COLUMN gender_reason_1 TEXT;

-- Spanish
ALTER TABLE translation_es ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_es ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_es ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_es ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_es ADD COLUMN gender_reason_1 TEXT;

-- Italian
ALTER TABLE translation_it ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_it ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_it ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_it ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_it ADD COLUMN gender_reason_1 TEXT;

-- Portuguese
ALTER TABLE translation_pt ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_pt ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_pt ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_pt ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_pt ADD COLUMN gender_reason_1 TEXT;

-- Russian
ALTER TABLE translation_ru ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_ru ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_ru ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_ru ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_ru ADD COLUMN gender_reason_1 TEXT;

-- Arabic
ALTER TABLE translation_ar ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_ar ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_ar ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_ar ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_ar ADD COLUMN gender_reason_1 TEXT;

-- Hindi
ALTER TABLE translation_hi ADD COLUMN frequency_score INTEGER DEFAULT 0;
ALTER TABLE translation_hi ADD COLUMN example_native_1 TEXT;
ALTER TABLE translation_hi ADD COLUMN pronunciation_1 TEXT;
ALTER TABLE translation_hi ADD COLUMN usage_context_1 TEXT;
ALTER TABLE translation_hi ADD COLUMN gender_reason_1 TEXT;