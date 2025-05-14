-- Update updated_at column in all tables that inherit from BaseModel
ALTER TABLE users 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE publishers 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE authors 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE categories 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE tags 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE documents 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE document_access 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE access_logs 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE comments 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE ratings 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE favorites 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE user_sessions 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE notifications 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE slideshows 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE website_links 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE system_settings 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE feedback 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE file_types 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE languages 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE document_chapters 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE document_audio 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE document_qa 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE reading_progress 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE document_sections 
    ALTER COLUMN updated_at DROP DEFAULT,
    ALTER COLUMN updated_at DROP NOT NULL;

-- Update existing records to set updated_at to NULL where it equals created_at
UPDATE users SET updated_at = NULL WHERE updated_at = created_at;
UPDATE publishers SET updated_at = NULL WHERE updated_at = created_at;
UPDATE authors SET updated_at = NULL WHERE updated_at = created_at;
UPDATE categories SET updated_at = NULL WHERE updated_at = created_at;
UPDATE tags SET updated_at = NULL WHERE updated_at = created_at;
UPDATE documents SET updated_at = NULL WHERE updated_at = created_at;
UPDATE document_access SET updated_at = NULL WHERE updated_at = created_at;
UPDATE access_logs SET updated_at = NULL WHERE updated_at = created_at;
UPDATE comments SET updated_at = NULL WHERE updated_at = created_at;
UPDATE ratings SET updated_at = NULL WHERE updated_at = created_at;
UPDATE favorites SET updated_at = NULL WHERE updated_at = created_at;
UPDATE user_sessions SET updated_at = NULL WHERE updated_at = created_at;
UPDATE notifications SET updated_at = NULL WHERE updated_at = created_at;
UPDATE slideshows SET updated_at = NULL WHERE updated_at = created_at;
UPDATE website_links SET updated_at = NULL WHERE updated_at = created_at;
UPDATE system_settings SET updated_at = NULL WHERE updated_at = created_at;
UPDATE feedback SET updated_at = NULL WHERE updated_at = created_at;
UPDATE file_types SET updated_at = NULL WHERE updated_at = created_at;
UPDATE languages SET updated_at = NULL WHERE updated_at = created_at;
UPDATE document_chapters SET updated_at = NULL WHERE updated_at = created_at;
UPDATE document_audio SET updated_at = NULL WHERE updated_at = created_at;
UPDATE document_qa SET updated_at = NULL WHERE updated_at = created_at;
UPDATE reading_progress SET updated_at = NULL WHERE updated_at = created_at;
UPDATE document_sections SET updated_at = NULL WHERE updated_at = created_at; 