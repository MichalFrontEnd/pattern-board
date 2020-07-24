const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/caper-imageboard"
);

module.exports.getImages = () => {
    let q = "SELECT * FROM images ORDER BY id DESC";
    return db.query(q);
};

module.exports.addImage = (title, description, username, url) => {
    let q =
        "INSERT INTO images (title, description, username, url)  VALUES ($1, $2, $3, $4) RETURNING *";

    let params = [title, description, username, url];
    return db.query(q, params);
};

module.exports.getImgInfo = (id) => {
    let q = `SELECT title, description,
        images.created_at AS imgtimestamp,
        comments.username, comment, comments.created_at AS comtimestamp
        FROM images
        JOIN comments ON images.id = comments.image_id
        WHERE images.id = $1`;
    let params = [id];
    return db.query(q, params);
};

//module.exports.getImgInfo = (id) => {
//    let q = "SELECT * FROM images WHERE id = $1";
//    let params = [id];
//    return db.query(q, params);
//};
