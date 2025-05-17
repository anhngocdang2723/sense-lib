--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: access_log_action; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.access_log_action AS ENUM (
    'view',
    'download',
    'print',
    'share',
    'comment',
    'rate'
);


ALTER TYPE public.access_log_action OWNER TO postgres;

--
-- Name: accesslogaction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accesslogaction AS ENUM (
    'VIEW',
    'DOWNLOAD',
    'PRINT',
    'SHARE',
    'COMMENT',
    'RATE'
);


ALTER TYPE public.accesslogaction OWNER TO postgres;

--
-- Name: author_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.author_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.author_status OWNER TO postgres;

--
-- Name: authorstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.authorstatus AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.authorstatus OWNER TO postgres;

--
-- Name: category_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.category_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.category_status OWNER TO postgres;

--
-- Name: categorystatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.categorystatus AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.categorystatus OWNER TO postgres;

--
-- Name: comment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.comment_status AS ENUM (
    'active',
    'hidden',
    'deleted'
);


ALTER TYPE public.comment_status OWNER TO postgres;

--
-- Name: commentstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.commentstatus AS ENUM (
    'ACTIVE',
    'HIDDEN',
    'DELETED'
);


ALTER TYPE public.commentstatus OWNER TO postgres;

--
-- Name: conflict_resolution; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conflict_resolution AS ENUM (
    'latest',
    'merge',
    'manual'
);


ALTER TYPE public.conflict_resolution OWNER TO postgres;

--
-- Name: conflict_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conflict_status AS ENUM (
    'pending',
    'resolved'
);


ALTER TYPE public.conflict_status OWNER TO postgres;

--
-- Name: conflictresolution; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conflictresolution AS ENUM (
    'LATEST',
    'MERGE',
    'MANUAL'
);


ALTER TYPE public.conflictresolution OWNER TO postgres;

--
-- Name: conflictstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conflictstatus AS ENUM (
    'PENDING',
    'RESOLVED'
);


ALTER TYPE public.conflictstatus OWNER TO postgres;

--
-- Name: document_access_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_access_level AS ENUM (
    'public',
    'restricted',
    'private'
);


ALTER TYPE public.document_access_level OWNER TO postgres;

--
-- Name: document_access_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_access_status AS ENUM (
    'active',
    'expired',
    'revoked'
);


ALTER TYPE public.document_access_status OWNER TO postgres;

--
-- Name: document_audio_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_audio_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE public.document_audio_status OWNER TO postgres;

--
-- Name: document_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_status AS ENUM (
    'available',
    'restricted',
    'maintenance',
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.document_status OWNER TO postgres;

--
-- Name: documentaccesslevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.documentaccesslevel AS ENUM (
    'PUBLIC',
    'RESTRICTED',
    'PRIVATE'
);


ALTER TYPE public.documentaccesslevel OWNER TO postgres;

--
-- Name: documentaccessstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.documentaccessstatus AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'REVOKED'
);


ALTER TYPE public.documentaccessstatus OWNER TO postgres;

--
-- Name: documentaudiostatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.documentaudiostatus AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.documentaudiostatus OWNER TO postgres;

--
-- Name: documentstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.documentstatus AS ENUM (
    'AVAILABLE',
    'RESTRICTED',
    'MAINTENANCE',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.documentstatus OWNER TO postgres;

--
-- Name: feedback_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.feedback_status AS ENUM (
    'pending',
    'in_progress',
    'resolved',
    'closed'
);


ALTER TYPE public.feedback_status OWNER TO postgres;

--
-- Name: feedbackstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.feedbackstatus AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public.feedbackstatus OWNER TO postgres;

--
-- Name: notification_related_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_related_type AS ENUM (
    'comment',
    'document',
    'rating',
    'access',
    'system',
    'feedback'
);


ALTER TYPE public.notification_related_type OWNER TO postgres;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'system',
    'comment',
    'rating',
    'document',
    'access'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- Name: notificationrelatedtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notificationrelatedtype AS ENUM (
    'COMMENT',
    'DOCUMENT',
    'RATING',
    'ACCESS',
    'SYSTEM',
    'FEEDBACK'
);


ALTER TYPE public.notificationrelatedtype OWNER TO postgres;

--
-- Name: notificationtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notificationtype AS ENUM (
    'SYSTEM',
    'COMMENT',
    'RATING',
    'DOCUMENT',
    'ACCESS'
);


ALTER TYPE public.notificationtype OWNER TO postgres;

--
-- Name: publisher_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.publisher_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.publisher_status OWNER TO postgres;

--
-- Name: publisherstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.publisherstatus AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.publisherstatus OWNER TO postgres;

--
-- Name: reading_progress_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reading_progress_status AS ENUM (
    'reading',
    'completed',
    'paused'
);


ALTER TYPE public.reading_progress_status OWNER TO postgres;

--
-- Name: reading_progress_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reading_progress_type AS ENUM (
    'page',
    'percentage',
    'position',
    'time',
    'section'
);


ALTER TYPE public.reading_progress_type OWNER TO postgres;

--
-- Name: readingprogressstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.readingprogressstatus AS ENUM (
    'READING',
    'COMPLETED',
    'PAUSED'
);


ALTER TYPE public.readingprogressstatus OWNER TO postgres;

--
-- Name: readingprogresstype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.readingprogresstype AS ENUM (
    'PAGE',
    'PERCENTAGE',
    'POSITION',
    'TIME',
    'SECTION'
);


ALTER TYPE public.readingprogresstype OWNER TO postgres;

--
-- Name: setting_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.setting_type AS ENUM (
    'string',
    'integer',
    'boolean',
    'json',
    'array',
    'float'
);


ALTER TYPE public.setting_type OWNER TO postgres;

--
-- Name: settingtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.settingtype AS ENUM (
    'STRING',
    'INTEGER',
    'BOOLEAN',
    'JSON',
    'ARRAY',
    'FLOAT'
);


ALTER TYPE public.settingtype OWNER TO postgres;

--
-- Name: static_page_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.static_page_status AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE public.static_page_status OWNER TO postgres;

--
-- Name: tag_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tag_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.tag_status OWNER TO postgres;

--
-- Name: tagstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tagstatus AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.tagstatus OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'member'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'MEMBER'
);


ALTER TYPE public.userrole OWNER TO postgres;

--
-- Name: voice_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.voice_gender AS ENUM (
    'male',
    'female',
    'neutral'
);


ALTER TYPE public.voice_gender OWNER TO postgres;

--
-- Name: voicegender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.voicegender AS ENUM (
    'MALE',
    'FEMALE',
    'NEUTRAL'
);


ALTER TYPE public.voicegender OWNER TO postgres;

--
-- Name: website_link_position; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.website_link_position AS ENUM (
    'header',
    'footer',
    'sidebar',
    'main_menu',
    'quick_links'
);


ALTER TYPE public.website_link_position OWNER TO postgres;

--
-- Name: website_link_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.website_link_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.website_link_status OWNER TO postgres;

--
-- Name: websitelinkposition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.websitelinkposition AS ENUM (
    'HEADER',
    'FOOTER',
    'SIDEBAR',
    'MAIN_MENU',
    'QUICK_LINKS'
);


ALTER TYPE public.websitelinkposition OWNER TO postgres;

--
-- Name: websitelinkstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.websitelinkstatus AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.websitelinkstatus OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access_logs (
    access_id uuid,
    user_id uuid NOT NULL,
    document_id uuid NOT NULL,
    action public.accesslogaction NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    ip_address character varying,
    user_agent character varying,
    session_id uuid,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.access_logs OWNER TO postgres;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authors (
    name character varying NOT NULL,
    bio text,
    email character varying,
    website character varying,
    birth_date date,
    death_date date,
    nationality character varying,
    status public.authorstatus,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    slug character varying,
    CONSTRAINT check_author_dates CHECK (((birth_date IS NULL) OR (death_date IS NULL) OR (birth_date < death_date))),
    CONSTRAINT check_author_email CHECK (((email IS NULL) OR ((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    CONSTRAINT check_author_name CHECK ((length((name)::text) >= 2))
);


ALTER TABLE public.authors OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    name character varying NOT NULL,
    description text,
    parent_id uuid,
    slug character varying,
    icon character varying,
    status public.categorystatus,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_category_name CHECK ((length((name)::text) >= 2))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    content text NOT NULL,
    status public.commentstatus,
    is_edited boolean,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_comment_content CHECK ((length(content) > 0))
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: document_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_access (
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    granted_at timestamp with time zone DEFAULT now(),
    expiry_date timestamp with time zone,
    status public.documentaccessstatus,
    access_count integer,
    last_accessed timestamp with time zone,
    extension_count integer,
    revoked_at timestamp with time zone,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_access_count CHECK ((access_count >= 0)),
    CONSTRAINT check_extension_count CHECK ((extension_count >= 0))
);


ALTER TABLE public.document_access OWNER TO postgres;

--
-- Name: document_audio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_audio (
    document_id uuid NOT NULL,
    chapter_id uuid,
    section_id uuid,
    language character varying NOT NULL,
    voice_id character varying NOT NULL,
    file_url character varying NOT NULL,
    duration_seconds integer NOT NULL,
    file_size integer NOT NULL,
    status public.documentaudiostatus,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_audio_context CHECK ((document_id IS NOT NULL)),
    CONSTRAINT check_audio_duration CHECK ((duration_seconds > 0)),
    CONSTRAINT check_audio_size CHECK ((file_size > 0))
);


ALTER TABLE public.document_audio OWNER TO postgres;

--
-- Name: document_author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_author (
    document_id uuid NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp with time zone,
    id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_author OWNER TO postgres;

--
-- Name: document_chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_chapters (
    document_id uuid NOT NULL,
    title character varying NOT NULL,
    chapter_number integer NOT NULL,
    start_position double precision,
    end_position double precision,
    ai_summary text,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_chapter_number CHECK ((chapter_number > 0)),
    CONSTRAINT check_chapter_positions CHECK (((start_position IS NULL) OR (end_position IS NULL) OR (start_position < end_position)))
);


ALTER TABLE public.document_chapters OWNER TO postgres;

--
-- Name: COLUMN document_chapters.start_position; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_chapters.start_position IS 'Starting position (e.g., percentage or page)';


--
-- Name: COLUMN document_chapters.end_position; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_chapters.end_position IS 'Ending position';


--
-- Name: COLUMN document_chapters.ai_summary; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_chapters.ai_summary IS 'AI-generated chapter summary';


--
-- Name: document_qa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_qa (
    document_id uuid NOT NULL,
    chapter_id uuid,
    section_id uuid,
    question text NOT NULL,
    answer text NOT NULL,
    context text,
    language character varying NOT NULL,
    usage_count integer,
    last_used timestamp with time zone,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_qa_content CHECK (((length(question) > 0) AND (length(answer) > 0))),
    CONSTRAINT check_qa_context CHECK ((((chapter_id IS NULL) AND (section_id IS NULL)) OR (context IS NOT NULL)))
);


ALTER TABLE public.document_qa OWNER TO postgres;

--
-- Name: document_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_sections (
    document_id uuid NOT NULL,
    chapter_id uuid,
    title character varying NOT NULL,
    section_number integer NOT NULL,
    start_position double precision,
    end_position double precision,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_section_number CHECK ((section_number > 0)),
    CONSTRAINT check_section_positions CHECK (((start_position IS NULL) OR (end_position IS NULL) OR (start_position < end_position)))
);


ALTER TABLE public.document_sections OWNER TO postgres;

--
-- Name: document_tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_tag (
    document_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_tag OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    title character varying NOT NULL,
    description text,
    publisher_id uuid,
    publication_year integer,
    isbn character varying,
    file_name character varying NOT NULL,
    file_hash character varying,
    file_type uuid NOT NULL,
    file_size integer NOT NULL,
    status public.documentstatus,
    category_id uuid NOT NULL,
    access_level public.documentaccesslevel,
    language character varying,
    version character varying,
    download_count integer,
    view_count integer,
    is_featured boolean,
    ai_summary text,
    added_by uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    image_url character varying,
    CONSTRAINT check_file_size CHECK ((file_size > 0)),
    CONSTRAINT check_isbn CHECK (((isbn IS NULL) OR ((isbn)::text ~ '^(?:[0-9]{10}|[0-9]{13}|[0-9]{3}-[0-9]{1,5}-[0-9]{1,7}-[0-9]{1,6}-[0-9])$'::text))),
    CONSTRAINT check_publication_year CHECK (((publication_year >= 1800) AND ((publication_year)::numeric <= EXTRACT(year FROM CURRENT_DATE)))),
    CONSTRAINT check_version_format CHECK (((version)::text ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$'::text))
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    user_id uuid NOT NULL,
    document_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    id uuid NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    user_id uuid,
    name character varying NOT NULL,
    email character varying NOT NULL,
    subject character varying NOT NULL,
    message text NOT NULL,
    status public.feedbackstatus,
    response text,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_feedback_email CHECK (((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT check_feedback_message CHECK ((length(message) > 0))
);


ALTER TABLE public.feedback OWNER TO postgres;

--
-- Name: file_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_types (
    extension character varying NOT NULL,
    mime_type character varying NOT NULL,
    description text,
    is_allowed boolean,
    max_size_mb integer,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_extension CHECK (((extension)::text ~ '^[a-zA-Z0-9]+$'::text)),
    CONSTRAINT check_max_size CHECK (((max_size_mb IS NULL) OR (max_size_mb > 0)))
);


ALTER TABLE public.file_types OWNER TO postgres;

--
-- Name: languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.languages (
    code character varying NOT NULL,
    name character varying NOT NULL,
    native_name character varying,
    is_active boolean,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_language_code CHECK (((code)::text ~ '^[a-z]{2}$'::text))
);


ALTER TABLE public.languages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    user_id uuid NOT NULL,
    type public.notificationtype NOT NULL,
    content text NOT NULL,
    related_id uuid,
    related_type public.notificationrelatedtype,
    is_read boolean,
    created_at timestamp with time zone DEFAULT now(),
    id uuid NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: publishers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publishers (
    name character varying NOT NULL,
    description text,
    website character varying,
    email character varying,
    phone character varying,
    address text,
    status public.publisherstatus,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_publisher_email CHECK (((email IS NULL) OR ((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    CONSTRAINT check_publisher_name CHECK ((length((name)::text) >= 2)),
    CONSTRAINT check_publisher_phone CHECK (((phone IS NULL) OR ((phone)::text ~ '^\+?[0-9\s-()]{8,20}$'::text)))
);


ALTER TABLE public.publishers OWNER TO postgres;

--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_rating_range CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- Name: reading_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reading_progress (
    user_id uuid NOT NULL,
    document_id uuid NOT NULL,
    chapter_id uuid,
    progress_type public.readingprogresstype NOT NULL,
    progress_value double precision NOT NULL,
    status public.readingprogressstatus,
    last_read_at timestamp with time zone DEFAULT now(),
    total_read_time integer,
    session_read_time integer,
    last_position jsonb,
    device_id character varying,
    session_id uuid,
    synced_at timestamp with time zone,
    ai_recommendation_trigger boolean,
    section_id uuid,
    conflict_resolution public.conflictresolution,
    last_sync_device character varying,
    sync_version integer,
    conflict_status public.conflictstatus,
    merged_progress jsonb,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_conflict_status CHECK (((((conflict_resolution)::text = 'manual'::text) AND (conflict_status IS NOT NULL)) OR ((conflict_resolution)::text <> 'manual'::text))),
    CONSTRAINT check_last_position CHECK (((last_position IS NULL) OR ((last_position)::text <> '{}'::text))),
    CONSTRAINT check_progress_value_page CHECK (((((progress_type)::text = 'page'::text) AND (progress_value >= (0)::double precision) AND (progress_value = floor(progress_value))) OR ((progress_type)::text <> 'page'::text))),
    CONSTRAINT check_progress_value_percentage CHECK (((((progress_type)::text = 'percentage'::text) AND (progress_value >= (0)::double precision) AND (progress_value <= (100)::double precision)) OR ((progress_type)::text <> 'percentage'::text))),
    CONSTRAINT check_progress_value_position CHECK (((((progress_type)::text = 'position'::text) AND (progress_value >= (0)::double precision)) OR ((progress_type)::text <> 'position'::text))),
    CONSTRAINT check_progress_value_time CHECK (((((progress_type)::text = 'time'::text) AND (progress_value >= (0)::double precision)) OR ((progress_type)::text <> 'time'::text))),
    CONSTRAINT check_session_read_time CHECK ((session_read_time >= 0)),
    CONSTRAINT check_sync_version CHECK ((sync_version > 0)),
    CONSTRAINT check_total_read_time CHECK ((total_read_time >= 0))
);


ALTER TABLE public.reading_progress OWNER TO postgres;

--
-- Name: COLUMN reading_progress.total_read_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reading_progress.total_read_time IS 'Total reading time in seconds';


--
-- Name: COLUMN reading_progress.session_read_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reading_progress.session_read_time IS 'Reading time for current session in seconds';


--
-- Name: COLUMN reading_progress.last_position; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reading_progress.last_position IS 'Additional position data like scroll position, zoom level, etc.';


--
-- Name: COLUMN reading_progress.device_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reading_progress.device_id IS 'Identifier for the device updating progress';


--
-- Name: COLUMN reading_progress.synced_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reading_progress.synced_at IS 'Last sync time for offline progress';


--
-- Name: COLUMN reading_progress.ai_recommendation_trigger; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reading_progress.ai_recommendation_trigger IS 'Flag for AI recommendation triggers';


--
-- Name: COLUMN reading_progress.merged_progress; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reading_progress.merged_progress IS 'Stores progress data from other devices when merging';


--
-- Name: slideshows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slideshows (
    title character varying NOT NULL,
    description text,
    image_url character varying NOT NULL,
    link_url character varying,
    display_order integer,
    status public.categorystatus,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_display_order CHECK ((display_order >= 0))
);


ALTER TABLE public.slideshows OWNER TO postgres;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    key character varying NOT NULL,
    value text NOT NULL,
    description text,
    type public.settingtype,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_setting_key CHECK ((length((key)::text) > 0)),
    CONSTRAINT check_setting_value CHECK ((length(value) > 0))
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    name character varying NOT NULL,
    description text,
    status public.tagstatus,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    slug character varying,
    CONSTRAINT check_tag_name CHECK ((length((name)::text) >= 2))
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    user_id uuid NOT NULL,
    token character varying NOT NULL,
    ip_address character varying,
    user_agent character varying,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    id uuid NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_session_expiry CHECK ((expires_at > created_at))
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    email character varying NOT NULL,
    username character varying NOT NULL,
    hashed_password character varying NOT NULL,
    full_name character varying NOT NULL,
    role public.userrole,
    is_active boolean,
    is_verified boolean,
    verification_code character varying,
    verification_code_expires timestamp with time zone,
    failed_login_attempts integer,
    lockout_until timestamp with time zone,
    phone_number character varying,
    address character varying,
    avatar_url character varying,
    last_login timestamp with time zone,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_email_format CHECK (((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT check_email_length CHECK ((length((email)::text) >= 5)),
    CONSTRAINT check_failed_attempts CHECK ((failed_login_attempts >= 0)),
    CONSTRAINT check_username_length CHECK ((length((username)::text) >= 3))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: voices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voices (
    id character varying NOT NULL,
    name character varying NOT NULL,
    language character varying NOT NULL,
    gender public.voicegender,
    provider character varying NOT NULL,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_voice_id CHECK (((id)::text ~ '^[a-zA-Z0-9_-]+$'::text))
);


ALTER TABLE public.voices OWNER TO postgres;

--
-- Name: website_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.website_links (
    title character varying NOT NULL,
    url character varying NOT NULL,
    description text,
    "position" public.websitelinkposition NOT NULL,
    display_order integer,
    status public.websitelinkstatus,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT check_display_order CHECK ((display_order >= 0)),
    CONSTRAINT check_url_format CHECK (((url)::text ~ '^https?://[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$'::text))
);


ALTER TABLE public.website_links OWNER TO postgres;

--
-- Data for Name: access_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.access_logs (access_id, user_id, document_id, action, "timestamp", ip_address, user_agent, session_id, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
\.


--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authors (name, bio, email, website, birth_date, death_date, nationality, status, id, created_at, updated_at, slug) FROM stdin;
Nguy?n Nh?t ?nh	Nh? v?n n?i ti?ng v?i c?c t?c ph?m vi?t cho thanh thi?u ni?n	nguyennhatanh@example.com	https://nguyennhatanh.com	1955-05-07	\N	Vi?t Nam	ACTIVE	8d5e570d-3271-4fa9-8c85-482beda2b892	2025-05-14 06:19:44.347957+00	\N	nguyen-nhat-anh
J.K. Rowling	T?c gi? c?a series Harry Potter	jkrowling@example.com	https://jkrowling.com	1965-07-31	\N	Anh	ACTIVE	e6deb969-001c-4786-b884-aeefdf20e0ce	2025-05-14 06:19:50.861892+00	\N	jk-rowling
William Shakespeare	Nh? th?, nh? vi?t k?ch v? ??i ng??i Anh	\N	\N	1564-04-23	1616-04-23	Anh	ACTIVE	5f0d2110-8bba-4d80-b614-d32ec0aa3eb9	2025-05-14 06:19:56.943839+00	\N	william-shakespeare
Ng? B?o Ch?u	Gi?o s? to?n h?c, ng??i Vi?t Nam ??u ti?n ?o?t gi?i Fields	ngobaochau@example.com	https://ngobaochau.org	1972-06-28	\N	Vi?t Nam	ACTIVE	48ad2827-a538-4cf4-aa85-550e0038f012	2025-05-14 06:20:03.46305+00	\N	ngo-bao-chau
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (name, description, parent_id, slug, icon, status, id, created_at, updated_at) FROM stdin;
S?ch	T?t c? c?c lo?i s?ch trong th? vi?n	\N	sach	book	ACTIVE	6f487384-1e01-458d-8c86-d9bfcec3525b	2025-05-14 02:26:14.35285+00	\N
S?ch Khoa H?c	C?c lo?i s?ch v? khoa h?c ph?n 2	4d4397c6-8380-4848-89b1-03324bc5d826	sach-khoa-hoc-2	flask	ACTIVE	4d4397c6-8380-4848-89b1-03324bc5d826	2025-05-14 02:39:18.531997+00	2025-05-14 03:38:16.681139+00
S?ch Khoa H?c	C?c lo?i s?ch v? khoa h?c ph?n 0	4d4397c6-8380-4848-89b1-03324bc5d826	sach-khoa-hoc	\N	ACTIVE	22c94574-73ae-42fc-94f2-855ebcf94064	2025-05-14 03:53:29.36575+00	\N
S?ch Khoa H?c	C?c lo?i s?ch v? khoa h?c ph?n 1	4d4397c6-8380-4848-89b1-03324bc5d826	sach-khoa-hoc-1	null	ACTIVE	41b789da-62fe-4d83-b68b-157b01bcc590	2025-05-14 02:40:29.38287+00	2025-05-14 04:01:39.811494+00
Kỹ năng sống	Kỹ năng sống	6f487384-1e01-458d-8c86-d9bfcec3525b	ky-nang-song	string	ACTIVE	7bc26412-d096-4bdc-a8b7-8c4407a5e845	2025-05-16 08:57:49.052978+00	\N
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (document_id, user_id, parent_id, content, status, is_edited, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_access (document_id, user_id, granted_at, expiry_date, status, access_count, last_accessed, extension_count, revoked_at, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_audio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_audio (document_id, chapter_id, section_id, language, voice_id, file_url, duration_seconds, file_size, status, id, created_at, updated_at) FROM stdin;
ae1a745c-d568-4912-9cb6-2f6b3ff677e6	\N	\N	vi	vi-VN-Standard-A	/audio/1747420308_Tuổi trẻ đáng giá bao nhiêu.mp3	177	1228992	COMPLETED	8529acbc-f3bc-44a7-b455-40a73f1fee5e	2025-05-17 01:34:58.630141+00	2025-05-17 01:34:58.630141+00
2a6a85d2-e314-4acb-9e44-e7ec8a6d9e5d	\N	\N	vi	vi-VN-Standard-A	/audio/1747440431_cam-nang-cham-soc-tre.mp3	164	1202688	COMPLETED	8aebf7de-93d8-4d5e-9953-ed8c0d0cad4b	2025-05-17 07:10:39.673246+00	2025-05-17 07:10:39.673246+00
\.


--
-- Data for Name: document_author; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_author (document_id, author_id, created_at, id, updated_at) FROM stdin;
\.


--
-- Data for Name: document_chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_chapters (document_id, title, chapter_number, start_position, end_position, ai_summary, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_qa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_qa (document_id, chapter_id, section_id, question, answer, context, language, usage_count, last_used, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_sections (document_id, chapter_id, title, section_number, start_position, end_position, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_tag (document_id, tag_id, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (title, description, publisher_id, publication_year, isbn, file_name, file_hash, file_type, file_size, status, category_id, access_level, language, version, download_count, view_count, is_featured, ai_summary, added_by, id, created_at, updated_at, image_url) FROM stdin;
Test Document	Test Document	\N	2020	1234567890	1747188335_test document.txt	e5ad4e210e3f4ee04e035a42263c4a5c	40fdbd91-fe7c-430a-a1d7-6e2b7ca8d772	4039	PENDING	6f487384-1e01-458d-8c86-d9bfcec3525b	PUBLIC	vi	1.0	0	0	f	\N	f99fb4fe-b6ee-4f06-945c-852c9524c082	04397913-1f61-4159-bda4-75e6a4ac8e45	2025-05-14 09:05:35.209438+00	\N	\N
Test Document	Test Document	\N	2021	0123456789	1747262362_document01.txt	77716bb84b93b43d34d9437509528469	40fdbd91-fe7c-430a-a1d7-6e2b7ca8d772	4796	PENDING	6f487384-1e01-458d-8c86-d9bfcec3525b	PUBLIC	en	1.0	0	0	f	\N	f99fb4fe-b6ee-4f06-945c-852c9524c082	e10883e7-d0fe-403c-b495-ff9503dc018b	2025-05-15 05:39:22.20199+00	\N	\N
Test Document 02	Test Document 02	\N	2001	0919838199	1747268351_document02.txt	d75487fb972293552b8230f3d93dafc7	40fdbd91-fe7c-430a-a1d7-6e2b7ca8d772	2323	PENDING	6f487384-1e01-458d-8c86-d9bfcec3525b	PUBLIC	vi	1.0	0	0	f	\N	f99fb4fe-b6ee-4f06-945c-852c9524c082	437117d0-4524-471c-a3c6-7e04dd7e6352	2025-05-15 07:19:11.285443+00	\N	\N
Test Document 01	Test Document 01	\N	2000	0919838188	1747268663_document01 - Copy.txt	2d3c1cb48fdc2a663ad7a647c60b1033	40fdbd91-fe7c-430a-a1d7-6e2b7ca8d772	3478	PENDING	6f487384-1e01-458d-8c86-d9bfcec3525b	PUBLIC	vi	1.0	0	0	f	\N	f99fb4fe-b6ee-4f06-945c-852c9524c082	9838e346-b46a-47d7-a087-b915e803c91c	2025-05-15 07:24:23.892511+00	\N	\N
Test Document 03	Test Document 03	\N	2003	0919838103	1747269544_Document 03.txt	32613b3ddc4eb2e7a64534d6ffdb2766	40fdbd91-fe7c-430a-a1d7-6e2b7ca8d772	2819	AVAILABLE	6f487384-1e01-458d-8c86-d9bfcec3525b	PUBLIC	vi	1.0	0	0	f	\N	f99fb4fe-b6ee-4f06-945c-852c9524c082	346fab5f-7681-441c-a11e-72ccada48508	2025-05-15 07:39:04.079869+00	2025-05-15 07:39:12.299525+00	\N
Tuổi trẻ đáng giá bao nhiêu	Sách về Tuổi trẻ đáng giá bao nhiêu	\N	2020	978-604-52-2991-3	1747420308_Tuổi trẻ đáng giá bao nhiêu.pdf	62c9aea51febd265d015ae78a4cab053	3d7a13bf-7383-4764-9160-4afa676a2057	597614	AVAILABLE	7bc26412-d096-4bdc-a8b7-8c4407a5e845	PUBLIC	vi	1.0	0	0	f	Tuổi trẻ là giai đoạn quý giá để phát triển bản thân và định hình tương lai, như được nhấn mạnh trong tác phẩm “Tuổi trẻ đáng giá bao nhiêu?” của Rosie Nguyễn. Tác giả bày tỏ tiếc nuối khi nhiều người trẻ lãng phí thời gian vào những thú vui vô bổ mà không nhận ra giá trị của thời gian – tài sản không thể thay thế. Nhìn lại ở ngưỡng 30, tác giả mong muốn được quay lại tuổi mười tám, đôi mươi để sống ý nghĩa hơn, đầu tư vào sức khỏe thông qua các hoạt động như chạy bộ, bơi lội hay yoga, bởi một cơ thể khỏe mạnh không chỉ nâng cao thể chất mà còn cải thiện tinh thần. Hơn nữa, việc đọc sách được xem là cách hiệu quả để tích lũy tri thức, mở rộng tầm nhìn và tạo động lực hành động, đặc biệt với các nguồn tài liệu miễn phí như ebook hay các trang web như Sachvui.Com. Chỉ cần duy trì thói quen đọc một cuốn sách mỗi tuần, kiến thức sẽ tăng đáng kể sau một năm.\n\nBên cạnh đó, học trực tuyến qua các nền tảng MOOC như Coursera, edX hay Khan Academy mang lại cơ hội tiếp cận giáo trình chất lượng từ các trường đại học hàng đầu, với nhiều chủ đề đa dạng và hoàn toàn miễn phí. Đây là xu hướng giáo dục tương lai, cho phép người học tự chọn thời gian, không cần di chuyển và bổ sung kỹ năng thực tế. Ngoài ra, tuổi trẻ còn là thời điểm lý tưởng để trải nghiệm du lịch bụi, kết nối với cộng đồng toàn cầu qua các nền tảng như Couchsurfing, giúp tiết kiệm chi phí và mang lại những kỷ niệm khó quên. Những chuyến đi không chỉ mở rộng tầm nhìn mà còn giúp người trẻ hiểu sâu hơn về con người và cuộc sống, như câu chuyện về một sinh viên khám phá Campuchia và Thái Lan chỉ với 2 triệu đồng nhờ sự can đảm bước ra khỏi vùng an toàn.\n\nHơn nữa, tham gia các hoạt động tình nguyện và công việc làm thêm trong độ tuổi hai mươi cũng đóng vai trò quan trọng trong việc rèn luyện kỹ năng và xây dựng mối quan hệ. Các tổ chức như AIESEC hay các câu lạc bộ du lịch như Hanoi Kids Tours cung cấp cơ hội phát triển kỹ năng giao tiếp, khám phá sở thích cá nhân và thể hiện lòng biết ơn. Đồng	f99fb4fe-b6ee-4f06-945c-852c9524c082	ae1a745c-d568-4912-9cb6-2f6b3ff677e6	2025-05-17 01:31:48.440549+00	2025-05-17 01:34:58.657768+00	\N
Truyện cổ tích Hà Nhi	\N	\N	1995	978-604-58-6841-1	1747440161_truyen-co-tich-ha-nhi.pdf	ace95f767aac5e14a6506c641bb578c2	3d7a13bf-7383-4764-9160-4afa676a2057	26783715	REJECTED	6f487384-1e01-458d-8c86-d9bfcec3525b	PUBLIC	vi	1.0	0	0	f	\N	f99fb4fe-b6ee-4f06-945c-852c9524c082	ec55ebcd-70b0-4d6e-9cad-62b6c9de8da6	2025-05-17 07:02:41.883584+00	2025-05-17 07:02:43.446385+00	/uploads/images/1747440161_truyen-co-tich-ha-nhi_cover.jpg
Cẩm nang chăm sóc trẻ	\N	\N	2020	978-604-1-26257-9	1747440431_cam-nang-cham-soc-tre.pdf	261afec40b8f499c5174d811434777fe	3d7a13bf-7383-4764-9160-4afa676a2057	402434	AVAILABLE	6f487384-1e01-458d-8c86-d9bfcec3525b	PUBLIC	vi	1.0	0	0	f	"Cẩm nang Chăm sóc Trẻ em" cung cấp những hướng dẫn toàn diện và thiết thực cho phụ huynh trong việc nuôi dưỡng, bảo vệ sức khỏe và đảm bảo an toàn cho trẻ ở các độ tuổi khác nhau. Trước hết, về dinh dưỡng, tài liệu giới thiệu các thực đơn cụ thể như 16 món ăn cho trẻ 12-24 tháng, cùng hàng loạt món cháo, canh và món mặn giàu dinh dưỡng (từ 228 đến 329 calo mỗi khẩu phần) với công thức chế biến chi tiết, đảm bảo cung cấp năng lượng và dưỡng chất cần thiết cho sự phát triển của trẻ. Các nguyên liệu chủ yếu bao gồm gạo, protein từ thịt, cá, trứng, và rau củ, được chế biến đơn giản, dễ tiêu hóa, phù hợp với trẻ nhỏ.\n\nBên cạnh dinh dưỡng, cẩm nang nhấn mạnh tầm quan trọng của việc chăm sóc sức khỏe toàn diện. Về giấc ngủ, tài liệu đưa ra các giải pháp giúp trẻ hình thành thói quen ngủ đúng giờ qua chương trình 7 ngày, khuyến khích cha mẹ tạo môi trường yên tĩnh, duy trì lịch trình đều đặn, và hạn chế các thói quen phụ thuộc như bế ru hay cho bú khi ngủ. Giấc ngủ được nhấn mạnh là yếu tố then chốt cho sự phát triển não bộ, đặc biệt trong 3 năm đầu đời khi 80% sự phát triển diễn ra. Ngoài ra, chăm sóc răng miệng cũng được chú trọng, với hướng dẫn phòng ngừa sâu răng bằng vệ sinh đúng cách, sử dụng kem đánh răng chứa fluoride phù hợp độ tuổi, và tránh các thói quen xấu như ăn kẹo thường xuyên. Các vấn đề như hôi miệng và mọc răng cũng được đề cập, kèm theo cách xử lý triệu chứng khó chịu trong giai đoạn này.\n\nVề an toàn, tài liệu cung cấp các biện pháp bảo vệ trẻ tại nhà và trong các tình huống nguy hiểm. Phụ huynh được khuyến cáo giám sát chặt chẽ trẻ, đặc biệt ở độ tuổi hiếu động, để tránh tai nạn như đuối nước, bỏng, ngã, hoặc nuốt dị vật. Các hướng dẫn cụ thể bao gồm cách xử lý khi trẻ bị hóa chất vào mắt, nuốt vật lạ, hay gặp hỏa hoạn, nhấn mạnh việc bình tĩnh và đưa trẻ đến cơ sở y tế kịp thời.	f99fb4fe-b6ee-4f06-945c-852c9524c082	2a6a85d2-e314-4acb-9e44-e7ec8a6d9e5d	2025-05-17 07:07:11.104424+00	2025-05-17 07:10:39.695973+00	/uploads/images/1747440431_cam-nang-cham-soc-tre_cover.jpg
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (user_id, document_id, created_at, id, updated_at) FROM stdin;
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback (user_id, name, email, subject, message, status, response, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: file_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_types (extension, mime_type, description, is_allowed, max_size_mb, id, created_at, updated_at) FROM stdin;
pdf	application/pdf	PDF Document	t	20	3d7a13bf-7383-4764-9160-4afa676a2057	2025-05-14 08:59:45.150349+00	\N
txt	text/plain	Text File	t	5	40fdbd91-fe7c-430a-a1d7-6e2b7ca8d772	2025-05-14 08:59:45.150349+00	\N
docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	Word Document	t	20	6350c129-2d92-4213-addf-c3f14529074c	2025-05-14 08:59:45.150349+00	\N
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.languages (code, name, native_name, is_active, id, created_at, updated_at) FROM stdin;
vi	Vietnamese	Ti?ng Vi?t	t	6a6d1489-bdc4-44c2-8b60-d4a8b8db7002	2025-05-14 09:05:29.361311+00	\N
en	English	Ti?ng Anh	t	041a8ef7-b90d-43ca-b90e-4efde6383fb4	2025-05-15 05:20:45.238257+00	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (user_id, type, content, related_id, related_type, is_read, created_at, id, updated_at) FROM stdin;
\.


--
-- Data for Name: publishers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publishers (name, description, website, email, phone, address, status, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ratings (document_id, user_id, rating, comment, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reading_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reading_progress (user_id, document_id, chapter_id, progress_type, progress_value, status, last_read_at, total_read_time, session_read_time, last_position, device_id, session_id, synced_at, ai_recommendation_trigger, section_id, conflict_resolution, last_sync_device, sync_version, conflict_status, merged_progress, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: slideshows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.slideshows (title, description, image_url, link_url, display_order, status, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (key, value, description, type, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (name, description, status, id, created_at, updated_at, slug) FROM stdin;
Khoa h?c	C?c b?i vi?t v? khoa h?c t? nhi?n, v?t l?, h?a h?c, sinh h?c	ACTIVE	a7eba552-1da6-4025-a215-d53626a436e7	2025-05-14 05:27:16.742012+00	\N	khoa-hoc
C?ng ngh?	C?c b?i vi?t v? c?ng ngh?, AI	ACTIVE	bbacf5f6-3b79-42db-85e7-ed9f873a9c67	2025-05-14 06:11:24.812346+00	\N	cong-nghe
V?n h?c	C?c b?i vi?t v? c?ng ngh?, AI	ACTIVE	4034c375-29f3-4adb-90ea-65134e8a3503	2025-05-14 06:14:00.545094+00	\N	van-hoc
Ti?u thuy?t	C?c t?c ph?m v?n h?c d?i, c? c?t truy?n ph?c t?p	ACTIVE	bd49043b-9f74-40c7-b89d-7f9bf1193575	2025-05-14 06:21:09.081997+00	\N	tieu-thuyet
Truy?n ng?n	C?c t?c ph?m v?n h?c ng?n g?n, s?c t?ch	ACTIVE	bfefd8a7-154c-4812-ae5c-db79ff1025b6	2025-05-14 06:21:19.285732+00	\N	truyen-ngan
Th?	C?c t?c ph?m th? ca, v?n v?n	ACTIVE	e3f2952a-ad8b-47d1-8070-90801ed59983	2025-05-14 06:21:27.09996+00	\N	tho
T?nh y?u	C?c t?c ph?m v? t?nh y?u, t?nh c?m	ACTIVE	705b9df4-636e-4982-aeb6-a334e96e8f7d	2025-05-14 06:21:31.696952+00	\N	tinh-yeu
L?ch s?	C?c t?c ph?m v? l?ch s?, s? ki?n l?ch s?	ACTIVE	baaf1886-7d65-4765-b925-96f8b1c9b799	2025-05-14 06:21:36.210548+00	\N	lich-su
Thi?u nhi	S?ch d?nh cho tr? em	ACTIVE	0d45e92c-e666-44ad-a702-78fa1a0375ee	2025-05-14 06:21:43.071752+00	\N	thieu-nhi
Thanh ni?n	S?ch d?nh cho l?a tu?i thanh ni?n	ACTIVE	483e0b39-4f13-431c-b514-8748cce988c8	2025-05-14 06:21:47.327225+00	\N	thanh-nien
Gi?o khoa	S?ch gi?o khoa, t?i li?u h?c t?p	ACTIVE	288f0d3e-5df9-4f84-897d-a34607889928	2025-05-14 06:21:52.089013+00	\N	giao-khoa
Ti?ng Vi?t	S?ch vi?t b?ng ti?ng Vi?t	ACTIVE	df8d9b37-c28d-4993-afe0-66947201aecd	2025-05-14 06:21:58.801315+00	\N	tieng-viet
Ti?ng Anh	S?ch vi?t b?ng ti?ng Anh	ACTIVE	b777c09c-f741-4a73-87f9-b54a1f16f10a	2025-05-14 06:22:02.398654+00	\N	tieng-anh
E-book	S?ch ?i?n t?	ACTIVE	8c0885e5-9eb6-4ecd-bc7c-f6ad1a37684d	2025-05-14 06:22:07.096595+00	\N	e-book
Audiobook	S?ch n?i	ACTIVE	489b7112-f3c1-47d2-8088-98787c1dd493	2025-05-14 06:22:11.105226+00	\N	audiobook
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (user_id, token, ip_address, user_agent, created_at, expires_at, id, updated_at) FROM stdin;
f99fb4fe-b6ee-4f06-945c-852c9524c082	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOTlmYjRmZS1iNmVlLTRmMDYtOTQ1Yy04NTJjOTUyNGMwODIiLCJleHAiOjE3NDc0NjcwNDF9.nI3L8XPoTAiiXL0w_ec3nnOphEYb6mA84_xPoImOLN4	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0	2025-05-17 02:33:36.332113+00	2025-05-18 07:00:41.632465+00	763273a8-debd-446c-9eef-d2c76e50d7c5	2025-05-17 07:00:41.614143+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (email, username, hashed_password, full_name, role, is_active, is_verified, verification_code, verification_code_expires, failed_login_attempts, lockout_until, phone_number, address, avatar_url, last_login, id, created_at, updated_at) FROM stdin;
testuser03@example.com	testuser03	$2b$12$iHQAq/7dviW2ZMw0yttzXeJ5Sry6u9ChP0fIFIuzmSRSgqfV/kxCm	testuser03	MEMBER	t	f	\N	\N	0	\N	\N	\N	\N	\N	194e3ea0-ea28-47a7-a63a-1c2e4067bd73	2025-05-13 06:06:30.963524+00	2025-05-13 06:06:30.70439+00
testuser04@example.com	testuser04	$2b$12$Vp60Lj7YgOYu5pFdj3.zGO2fd56sswzGxvVfVUkyWD/KpN.tjETmO	testuser04	MEMBER	t	f	\N	\N	0	\N	\N	\N	\N	\N	6d15f82a-a17e-4ecc-ba88-7c8c67a834ec	2025-05-13 06:08:21.541896+00	2025-05-13 06:08:21.289882+00
testuser00@example.com	testuser00	$2b$12$bUIjFgurAPcS4JjXj5zXDuT11qgU/C5TT3G4NMcKXfS0kQnXQzkTG	testuser00	MEMBER	f	f	\N	\N	0	\N	\N	\N	\N	2025-05-13 08:01:56.025915+00	07146562-4154-4635-838c-0d06d7df0a0f	2025-05-13 05:56:52.252723+00	2025-05-13 07:50:36.610883+00
clonemail28012024@gmail.com	clonemail28012024	$2b$12$2ebJhDLgvLDqHFI0fPiVK.U1vkfA/tXgxonadE9LTzWT716/lH.Ha	Clone	MEMBER	t	t	\N	\N	0	\N	0987654321	123 Test Street, Test City	https://example.com/avatars/test.jpg	2025-05-14 02:15:52.988289+00	765d8411-e686-42f2-991b-5a782dd87652	2025-05-13 06:17:52.940354+00	2025-05-13 07:48:04.103697+00
testuser01@example.com	testuser01	$2b$12$ZgPI.zKrMWloqBmUtee4Pe22kgyTTfbTnQztcFpUDgOkaWznPvwLC	testuser01	MEMBER	t	f	\N	\N	0	\N	\N	\N	\N	2025-05-13 06:12:29.783907+00	c261acda-3fb6-4e2d-95d8-f681d7073807	2025-05-13 05:58:24.801012+00	2025-05-13 06:12:29.531479+00
testuser02@example.com	testuser02	$2b$12$V1ymSsHQsBo5ncaq6PtcQupfTr7MkJuN7VHB0rHZ2p2FV3/L6CKrC	testuser02	MEMBER	t	f	\N	\N	0	\N	\N	\N	\N	2025-05-13 08:02:47.269419+00	e0771ad4-b867-403d-81f5-8201ac90d347	2025-05-13 06:04:08.475419+00	2025-05-13 06:04:08.246427+00
c.lonemail28012024@gmail.com	test	$2b$12$tYXb4W1fCOFNqKWsaA5qLu6iE1BygZ09eeUMSQWW.F0UG40FHf9ci	test	MEMBER	t	t	\N	\N	0	\N	\N	\N	\N	2025-05-14 02:18:41.532956+00	e504d986-9186-47ed-8e55-096bd7aaf331	2025-05-14 02:11:21.954027+00	2025-05-14 02:19:10.702888+00
testuser05@example.com	testuser05	$2b$12$MzKw7TsqnVovFv9qq1ABx.lMdUz2jN0rz1vZmdcCAj0Z3sNYgn3WS	testuser05	MEMBER	t	f	\N	\N	0	\N	\N	\N	\N	2025-05-13 08:11:01.002207+00	dce7245a-26bc-43ca-8d1c-5460e01dee63	2025-05-13 06:15:10.052499+00	2025-05-13 08:06:22.123502+00
lanyurwar@gmail.com	lanyurwar	$2b$12$xoEqbcRhQ0LZdjDW4.it2.gJroykhx5ycxwYvFsBTZ9bKozTULcRG	lanyurwar	MEMBER	t	f	\N	\N	0	\N	\N	\N	\N	2025-05-13 08:16:40.977609+00	4a7c099d-9c14-4b62-9cbf-f5fa50fa2640	2025-05-13 08:16:07.16748+00	\N
testuser06@example.com	testuser	$2b$12$ebiciaHvkBgp.ZM5VMaqnuo9Z.WZ4e72cnD6uGPeRsK64KhwElMd2	testuser	MEMBER	t	f	\N	\N	0	\N	\N	\N	\N	2025-05-13 08:18:19.297036+00	f470b4ea-6d7a-4e4b-98c1-51762d005004	2025-05-13 08:11:56.844403+00	\N
cnv1902@gmail.com	cnv1902	$2b$12$1NBGNwfQa9MKlVl3OTzu9Ok3FraMrArv/nskDcyjiA007YpAJqGXa	Nguyen Van Chuong	MEMBER	t	t	\N	\N	0	\N	\N	\N	\N	2025-05-15 14:41:25.704901+00	c87e42ab-cf7d-462f-9d46-e3509295ccf9	2025-05-14 07:59:06.956553+00	2025-05-15 14:41:17.480499+00
testuser07@example.com	testuser07	$2b$12$HOvRxPUOfPex4.Ng6VHDyu8W9Wt9TveRMkQWmxo1iLRvs.oy9Sjo6	testuser	MEMBER	t	t	\N	\N	0	\N	\N	\N	\N	2025-05-13 08:35:52.566948+00	56a82a35-a0bf-487e-a706-04e40e8e58fd	2025-05-13 08:21:08.08777+00	2025-05-13 08:37:49.883238+00
testuser08@example.com	testuser08	$2b$12$ahszwj41lmeVJ4P.MbUjAOhI.gWH6tcmJoArsbvKplqqmZsIsrj/6	testuser08	MEMBER	t	t	\N	\N	0	\N	\N	\N	\N	2025-05-14 07:38:38.669423+00	53adc6a6-b1d2-4ff3-86c1-3f8de0e70b1b	2025-05-14 07:37:25.89131+00	2025-05-14 07:40:11.197535+00
admin@example.com	admin	$2b$12$bLmTbf9zzjmYpXTXTgLtcu0m9K3pmPqUOqv72JAqypnzU682HZQvC	System Admin	ADMIN	t	t	\N	\N	0	\N	\N	\N	\N	2025-05-17 07:00:41.528942+00	f99fb4fe-b6ee-4f06-945c-852c9524c082	2025-05-13 05:48:51.840068+00	\N
\.


--
-- Data for Name: voices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voices (id, name, language, gender, provider, is_active, created_at, updated_at) FROM stdin;
vi-VN-Standard-A	Default Voice	vi	\N	gTTS	t	2025-05-17 01:24:51.361907+00	2025-05-17 01:24:51.361907+00
\.


--
-- Data for Name: website_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.website_links (title, url, description, "position", display_order, status, id, created_at, updated_at) FROM stdin;
\.


--
-- Name: access_logs access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: authors authors_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_slug_key UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: document_access document_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_access
    ADD CONSTRAINT document_access_pkey PRIMARY KEY (id);


--
-- Name: document_audio document_audio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audio
    ADD CONSTRAINT document_audio_pkey PRIMARY KEY (id);


--
-- Name: document_author document_author_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_author
    ADD CONSTRAINT document_author_pkey PRIMARY KEY (id);


--
-- Name: document_chapters document_chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_chapters
    ADD CONSTRAINT document_chapters_pkey PRIMARY KEY (id);


--
-- Name: document_qa document_qa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_qa
    ADD CONSTRAINT document_qa_pkey PRIMARY KEY (id);


--
-- Name: document_sections document_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_sections
    ADD CONSTRAINT document_sections_pkey PRIMARY KEY (id);


--
-- Name: document_tag document_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT document_tag_pkey PRIMARY KEY (id);


--
-- Name: documents documents_isbn_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_isbn_key UNIQUE (isbn);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: file_types file_types_extension_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_types
    ADD CONSTRAINT file_types_extension_key UNIQUE (extension);


--
-- Name: file_types file_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_types
    ADD CONSTRAINT file_types_pkey PRIMARY KEY (id);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (code, id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: reading_progress reading_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_pkey PRIMARY KEY (id);


--
-- Name: slideshows slideshows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slideshows
    ADD CONSTRAINT slideshows_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: authors uq_author_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT uq_author_name UNIQUE (name);


--
-- Name: document_author uq_document_author; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_author
    ADD CONSTRAINT uq_document_author UNIQUE (document_id, author_id);


--
-- Name: document_chapters uq_document_chapter_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_chapters
    ADD CONSTRAINT uq_document_chapter_number UNIQUE (document_id, chapter_number);


--
-- Name: document_sections uq_document_section_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_sections
    ADD CONSTRAINT uq_document_section_number UNIQUE (document_id, chapter_id, section_number);


--
-- Name: document_tag uq_document_tag; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT uq_document_tag UNIQUE (document_id, tag_id);


--
-- Name: ratings uq_document_user_rating; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT uq_document_user_rating UNIQUE (document_id, user_id);


--
-- Name: languages uq_language_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT uq_language_code UNIQUE (code);


--
-- Name: publishers uq_publisher_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publishers
    ADD CONSTRAINT uq_publisher_name UNIQUE (name);


--
-- Name: reading_progress uq_user_document_chapter_section_progress; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT uq_user_document_chapter_section_progress UNIQUE (user_id, document_id, chapter_id, section_id);


--
-- Name: favorites uq_user_document_favorite; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT uq_user_document_favorite UNIQUE (user_id, document_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_token_key UNIQUE (token);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voices voices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voices
    ADD CONSTRAINT voices_pkey PRIMARY KEY (id);


--
-- Name: website_links website_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.website_links
    ADD CONSTRAINT website_links_pkey PRIMARY KEY (id);


--
-- Name: idx_access_logs_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_access_logs_document ON public.access_logs USING btree (document_id);


--
-- Name: idx_access_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_access_logs_timestamp ON public.access_logs USING btree ("timestamp");


--
-- Name: idx_access_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_access_logs_user ON public.access_logs USING btree (user_id);


--
-- Name: idx_access_logs_user_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_access_logs_user_document ON public.access_logs USING btree (user_id, document_id);


--
-- Name: idx_document_audio_chapter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_audio_chapter ON public.document_audio USING btree (chapter_id);


--
-- Name: idx_document_audio_doc_chapter_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_audio_doc_chapter_section ON public.document_audio USING btree (document_id, chapter_id, section_id);


--
-- Name: idx_document_audio_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_audio_document ON public.document_audio USING btree (document_id);


--
-- Name: idx_document_audio_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_audio_language ON public.document_audio USING btree (language);


--
-- Name: idx_document_audio_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_audio_section ON public.document_audio USING btree (section_id);


--
-- Name: idx_document_chapters_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_chapters_document ON public.document_chapters USING btree (document_id);


--
-- Name: idx_document_chapters_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_chapters_number ON public.document_chapters USING btree (document_id, chapter_number);


--
-- Name: idx_document_sections_chapter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_sections_chapter ON public.document_sections USING btree (chapter_id);


--
-- Name: idx_document_sections_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_sections_document ON public.document_sections USING btree (document_id);


--
-- Name: idx_reading_progress_conflict; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_conflict ON public.reading_progress USING btree (conflict_status);


--
-- Name: idx_reading_progress_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_document ON public.reading_progress USING btree (document_id);


--
-- Name: idx_reading_progress_document_chapter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_document_chapter ON public.reading_progress USING btree (document_id, chapter_id);


--
-- Name: idx_reading_progress_last_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_last_read ON public.reading_progress USING btree (last_read_at);


--
-- Name: idx_reading_progress_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_section ON public.reading_progress USING btree (section_id);


--
-- Name: idx_reading_progress_sync; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_sync ON public.reading_progress USING btree (synced_at);


--
-- Name: idx_reading_progress_sync_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_sync_version ON public.reading_progress USING btree (sync_version);


--
-- Name: idx_reading_progress_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_user ON public.reading_progress USING btree (user_id);


--
-- Name: idx_reading_progress_user_document_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_user_document_section ON public.reading_progress USING btree (user_id, document_id, section_id);


--
-- Name: idx_reading_progress_user_last_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_progress_user_last_read ON public.reading_progress USING btree (user_id, last_read_at);


--
-- Name: idx_voices_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_voices_language ON public.voices USING btree (language);


--
-- Name: idx_voices_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_voices_provider ON public.voices USING btree (provider);


--
-- Name: ix_access_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_access_logs_id ON public.access_logs USING btree (id);


--
-- Name: ix_authors_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_authors_id ON public.authors USING btree (id);


--
-- Name: ix_authors_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_authors_name ON public.authors USING btree (name);


--
-- Name: ix_categories_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categories_id ON public.categories USING btree (id);


--
-- Name: ix_categories_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categories_name ON public.categories USING btree (name);


--
-- Name: ix_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_categories_slug ON public.categories USING btree (slug);


--
-- Name: ix_comments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comments_id ON public.comments USING btree (id);


--
-- Name: ix_document_access_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_access_id ON public.document_access USING btree (id);


--
-- Name: ix_document_audio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_audio_id ON public.document_audio USING btree (id);


--
-- Name: ix_document_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_author_id ON public.document_author USING btree (id);


--
-- Name: ix_document_chapters_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_chapters_id ON public.document_chapters USING btree (id);


--
-- Name: ix_document_qa_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_qa_id ON public.document_qa USING btree (id);


--
-- Name: ix_document_sections_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_sections_id ON public.document_sections USING btree (id);


--
-- Name: ix_document_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_tag_id ON public.document_tag USING btree (id);


--
-- Name: ix_documents_file_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_documents_file_hash ON public.documents USING btree (file_hash);


--
-- Name: ix_documents_file_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_documents_file_name ON public.documents USING btree (file_name);


--
-- Name: ix_documents_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_documents_id ON public.documents USING btree (id);


--
-- Name: ix_documents_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_documents_title ON public.documents USING btree (title);


--
-- Name: ix_favorites_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_favorites_id ON public.favorites USING btree (id);


--
-- Name: ix_feedback_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_feedback_id ON public.feedback USING btree (id);


--
-- Name: ix_file_types_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_file_types_id ON public.file_types USING btree (id);


--
-- Name: ix_languages_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_languages_id ON public.languages USING btree (id);


--
-- Name: ix_notifications_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_id ON public.notifications USING btree (id);


--
-- Name: ix_publishers_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_publishers_id ON public.publishers USING btree (id);


--
-- Name: ix_publishers_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_publishers_name ON public.publishers USING btree (name);


--
-- Name: ix_ratings_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ratings_id ON public.ratings USING btree (id);


--
-- Name: ix_reading_progress_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reading_progress_id ON public.reading_progress USING btree (id);


--
-- Name: ix_slideshows_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_slideshows_id ON public.slideshows USING btree (id);


--
-- Name: ix_system_settings_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_system_settings_id ON public.system_settings USING btree (id);


--
-- Name: ix_tags_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tags_id ON public.tags USING btree (id);


--
-- Name: ix_tags_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_tags_name ON public.tags USING btree (name);


--
-- Name: ix_user_sessions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_sessions_id ON public.user_sessions USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: ix_website_links_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_website_links_id ON public.website_links USING btree (id);


--
-- Name: access_logs access_logs_access_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_access_id_fkey FOREIGN KEY (access_id) REFERENCES public.document_access(id);


--
-- Name: access_logs access_logs_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: access_logs access_logs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_sessions(id);


--
-- Name: access_logs access_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: comments comments_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: document_access document_access_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_access
    ADD CONSTRAINT document_access_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_access document_access_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_access
    ADD CONSTRAINT document_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: document_audio document_audio_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audio
    ADD CONSTRAINT document_audio_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.document_chapters(id);


--
-- Name: document_audio document_audio_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audio
    ADD CONSTRAINT document_audio_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_audio document_audio_language_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audio
    ADD CONSTRAINT document_audio_language_fkey FOREIGN KEY (language) REFERENCES public.languages(code);


--
-- Name: document_audio document_audio_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audio
    ADD CONSTRAINT document_audio_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.document_sections(id);


--
-- Name: document_audio document_audio_voice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audio
    ADD CONSTRAINT document_audio_voice_id_fkey FOREIGN KEY (voice_id) REFERENCES public.voices(id);


--
-- Name: document_author document_author_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_author
    ADD CONSTRAINT document_author_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id);


--
-- Name: document_author document_author_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_author
    ADD CONSTRAINT document_author_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_chapters document_chapters_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_chapters
    ADD CONSTRAINT document_chapters_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_qa document_qa_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_qa
    ADD CONSTRAINT document_qa_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.document_chapters(id);


--
-- Name: document_qa document_qa_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_qa
    ADD CONSTRAINT document_qa_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_qa document_qa_language_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_qa
    ADD CONSTRAINT document_qa_language_fkey FOREIGN KEY (language) REFERENCES public.languages(code);


--
-- Name: document_qa document_qa_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_qa
    ADD CONSTRAINT document_qa_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.document_sections(id);


--
-- Name: document_sections document_sections_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_sections
    ADD CONSTRAINT document_sections_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.document_chapters(id);


--
-- Name: document_sections document_sections_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_sections
    ADD CONSTRAINT document_sections_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_tag document_tag_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT document_tag_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_tag document_tag_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_tag
    ADD CONSTRAINT document_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id);


--
-- Name: documents documents_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id);


--
-- Name: documents documents_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: documents documents_file_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_file_type_fkey FOREIGN KEY (file_type) REFERENCES public.file_types(id);


--
-- Name: documents documents_language_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_language_fkey FOREIGN KEY (language) REFERENCES public.languages(code);


--
-- Name: documents documents_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publishers(id);


--
-- Name: favorites favorites_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reading_progress reading_progress_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.document_chapters(id);


--
-- Name: reading_progress reading_progress_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: reading_progress reading_progress_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.document_sections(id);


--
-- Name: reading_progress reading_progress_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_sessions(id);


--
-- Name: reading_progress reading_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: voices voices_language_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voices
    ADD CONSTRAINT voices_language_fkey FOREIGN KEY (language) REFERENCES public.languages(code);


--
-- PostgreSQL database dump complete
--

