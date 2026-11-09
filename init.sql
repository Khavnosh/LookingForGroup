CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    discord_tag VARCHAR(50),
    availability VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS tags(
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS game_groups(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(500) NOT NULL,
    owner_id INT NOT NULL,

    CONSTRAINT fk_game_groups_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_interest(
    user_id INT NOT NULL,
    tag_id INT NOT NULL,

    PRIMARY KEY (user_id, tag_id),

    CONSTRAINT fk_user_interest_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_interest_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_tags(
    group_id INT NOT NULL,
    tag_id INT NOT NULL,

    PRIMARY KEY (group_id, tag_id),

    CONSTRAINT fk_group_tags_group
        FOREIGN KEY (group_id)
        REFERENCES game_groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_group_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS is_member(
    group_id INT NOT NULL,
    user_id INT NOT NULL,

    PRIMARY KEY (group_id, user_id),

    CONSTRAINT fk_is_member_group
        FOREIGN KEY (group_id)
        REFERENCES game_groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_is_member_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
