CREATE TABLE users (
    id uuid PRIMARY KEY default uuidv7 (),
    name VARCHAR(255) NOT NULL,
    token VARCHAR(100) NOT NULL
);

CREATE unique INDEX users_id_idx ON users (id);
