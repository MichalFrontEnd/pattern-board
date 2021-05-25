const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/caper-imageboard"
);

module.exports.getImages = () => {
    let q = "SELECT * FROM images ORDER BY id DESC LIMIT 5";
    return db.query(q);
};

module.exports.addImage = (title, description, username, url, pattern_type) => {
    let q =
        "INSERT INTO images (title, description, username, url, pattern_type)  VALUES ($1, $2, $3, $4, $5) RETURNING *";

    let params = [title, description, username, url, pattern_type];
    return db.query(q, params);
};


module.exports.getImgInfo = (id) => {
    let q = "SELECT * FROM images WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};

module.exports.getCommentInfo = (id) => {
    let q = "SELECT * FROM comments WHERE image_id = $1";
    let params = [id];
    return db.query(q, params);
};

module.exports.addNewComment = (username, comment, image_id) => {
    let q = `INSERT INTO comments (comment_un, new_comment, image_id) VALUES ($1, $2, $3) RETURNING *`;
    let params = [username, comment, image_id];
    return db.query(q, params);
};

module.exports.getMoreImages = (lastId) => {
    let q = `SELECT *, (
        SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1
) AS "lowestId" FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 5`;
    let params = [lastId];
    return db.query(q, params);
};
