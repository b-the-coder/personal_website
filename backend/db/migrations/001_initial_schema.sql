
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE annotations (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),

    annotated_text TEXT NOT NULL,
    annotation_content TEXT NOT NULL,

    viewport_x DOUBLE PRECISION NOT NULL,
    viewport_y DOUBLE PRECISION NOT NULL,

    text_position TEXT NOT NULL,
    range_start_offset INTEGER NOT NULL,
    range_end_offset INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT valid_range CHECK (
        range_start_offset >= 0
        AND range_end_offset >= range_start_offset
    )
);


