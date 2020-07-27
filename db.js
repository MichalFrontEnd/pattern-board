const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/caper-imageboard"
);

module.exports.getImages = () => {
    let q = "SELECT * FROM images ORDER BY id DESC LIMIT 5";
    return db.query(q);
};

module.exports.addImage = (title, description, username, url) => {
    let q =
        "INSERT INTO images (title, description, username, url)  VALUES ($1, $2, $3, $4) RETURNING *";

    let params = [title, description, username, url];
    return db.query(q, params);
};

//module.exports.getImgInfo = (id) => {
//    let q = `SELECT title, description,
//        images.created_at AS imgtimestamp,
//        comments.username, comment, comments.created_at AS comtimestamp
//        FROM images
//        JOIN comments ON images.id = comments.image_id
//        WHERE images.id = $1`;
//    let params = [id];
//    return db.query(q, params);
//};

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
    //let q = `SELECT id, url, username, title, description, created_at, (

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
