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
    //req.body is the rest of the input fields.
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

app.get("/curimgmodal/:id", (req, res) => {
    ///here I will want to do a db select, or two
    Promise.all([
        db.getImgInfo(req.params.id),
        db.getCommentInfo(req.params.id),
    ])
        .then(([result1, result2]) => {
            //console.log("results: ", result2.rows);

            res.json([result1.rows[0], result2.rows]);
        })

        //db.getImgInfo(req.params.id).then((results) => {
        //    console.log("results: ", results.rows);
        //    res.json(results.rows[0]);
        //});
        //db.getCommentInfo(req.params.id)
        //    .then((results) => {
        //        console.log("results: ", results.rows);
        //        res.json(results.rows[0]);
        //    })
        .catch((err) => {
            console.log("err in get ", err);
        });
});

app.post("/addcomment/:id", (req, res) => {
    //console.log("req.body", req.body);
    db.addNewComment(req.body.comment_un, req.body.new_comment, req.params.id)
        .then((results) => {
            //console.log("results in addComment: ", results);
            res.json(results.rows[0]);
        })
        .catch((err) => {
            console.log("err in add Comment ", err);
        });
});

app.get("/loadmore", (req, res) => {
    //let {smallestId}
    //console.log("req in load more: ", req);
    //console.log("req.query[0]: ", req.query[0]);

    db.getMoreImages(req.query[0]).then((results) => {
        //console.log("results in loadmore: ", results.rows);
        res.json(results.rows);
    });
});
app.listen(3000, () => console.log("The fall will hurt"));
