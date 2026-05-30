CREATE TABLE image_blob (
  blob_id     INT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  data        TEXT         NOT NULL,
  mime_type   VARCHAR(50)  NOT NULL,
  size_bytes  INT          NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
