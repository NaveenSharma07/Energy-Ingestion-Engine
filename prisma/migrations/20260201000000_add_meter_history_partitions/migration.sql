-- Add missing partitions for meter_history (if table is partitioned)
-- This fixes: "no partition of relation meter_history found for row"
-- Run only when meter_history is a partitioned table (e.g. from old schema)

DO $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  -- Only proceed if meter_history is a partitioned table
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'meter_history' AND c.relkind = 'p'
  ) THEN
    -- Add monthly partitions for 2026-01 through 2027-12
    FOR partition_date IN
      SELECT generate_series(
        '2026-01-01'::date,
        '2027-12-01'::date,
        '1 month'::interval
      )::date
    LOOP
      start_date := partition_date;
      end_date := partition_date + interval '1 month';
      partition_name := 'meter_history_' || to_char(partition_date, 'YYYY_MM');
      
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %I PARTITION OF meter_history FOR VALUES FROM (%L) TO (%L)',
          partition_name,
          start_date,
          end_date
        );
      EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN OTHERS THEN NULL; -- skip if table not partitioned or other error
      END;
    END LOOP;
    
    -- Also add 2025 partitions if they might be needed
    FOR partition_date IN
      SELECT generate_series(
        '2025-01-01'::date,
        '2025-12-01'::date,
        '1 month'::interval
      )::date
    LOOP
      start_date := partition_date;
      end_date := partition_date + interval '1 month';
      partition_name := 'meter_history_' || to_char(partition_date, 'YYYY_MM');
      
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %I PARTITION OF meter_history FOR VALUES FROM (%L) TO (%L)',
          partition_name,
          start_date,
          end_date
        );
      EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN OTHERS THEN NULL;
      END;
    END LOOP;
  END IF;
END $$;

-- Same for vehicle_history if it is partitioned
DO $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'vehicle_history' AND c.relkind = 'p'
  ) THEN
    FOR partition_date IN
      SELECT generate_series(
        '2025-01-01'::date,
        '2027-12-01'::date,
        '1 month'::interval
      )::date
    LOOP
      start_date := partition_date;
      end_date := partition_date + interval '1 month';
      partition_name := 'vehicle_history_' || to_char(partition_date, 'YYYY_MM');
      
      BEGIN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %I PARTITION OF vehicle_history FOR VALUES FROM (%L) TO (%L)',
          partition_name,
          start_date,
          end_date
        );
      EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN OTHERS THEN NULL;
      END;
    END LOOP;
  END IF;
END $$;
