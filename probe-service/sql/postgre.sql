CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE probe_environment_type AS ENUM ('DEVELOPMENT', 'TESTING', 'PRODUCTION');

CREATE TABLE probe_platform (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  code varchar(100) NOT NULL UNIQUE,
  description text,
  enabled boolean NOT NULL DEFAULT true
);

CREATE TABLE probe_environment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid NOT NULL REFERENCES probe_platform(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  type probe_environment_type NOT NULL,
  base_url varchar(2048) NOT NULL,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  encrypted_secrets jsonb NOT NULL DEFAULT '{}'::jsonb,
  tls_verify boolean NOT NULL DEFAULT true,
  timeout_ms integer NOT NULL DEFAULT 10000,
  enabled boolean NOT NULL DEFAULT true
);

CREATE TABLE probe_webhook_channel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  url varchar(2048) NOT NULL,
  method varchar(10) NOT NULL DEFAULT 'POST',
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  encrypted_secret text,
  enabled boolean NOT NULL DEFAULT true
);

CREATE TABLE probe_scenario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid NOT NULL REFERENCES probe_platform(id) ON DELETE CASCADE,
  name varchar(150) NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  current_version integer NOT NULL DEFAULT 1
);

CREATE TABLE probe_scenario_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES probe_scenario(id) ON DELETE CASCADE,
  version integer NOT NULL,
  definition jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (scenario_id, version)
);
