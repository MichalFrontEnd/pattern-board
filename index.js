const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

///////FIle UPLOAD BOILERPLATE DON'T TOUCH!!//////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});
//////END BOILERPLATE///////////

app.get("/images", (req, res) => {
    //console.log("get/images has been hit!");

    db.getImages().then(function (response) {
        //console.log("I passed getImages");
        //console.log("response: ", response);
        res.json(response.rows);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    //req.file is the file that was uploaded.
    //req.file is the rest of the input fields.
    //console.log("file: ", req.file);
    //console.log("input: ", req.body);
    const { title, description, username } = req.body;
    const { filename } = req.file;
    const url = s3Url + filename;

    //insert title, desc,username, url into db table
    if (req.file) {
        db.addImage(title, description, username, url)
            .then((response) => {
                console.log("rows in addImage: ", response.rows[0]);
                res.json(response.rows[0]);
            })
            .catch((err) => {
                console.log("error on addImage: ", err);
            });
    }
});

app.get("/modal", (req, res) => {
    ///here I will want to do a db select, or two
});

app.listen(3000, () => console.log("The fall will hurt"));
