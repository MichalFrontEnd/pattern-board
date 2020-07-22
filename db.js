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
