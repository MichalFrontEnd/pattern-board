//console.log("script is linked")

(function () {
    new Vue({
        el: "#main",
        data: {
            images: [],
            //imageId: null,
            //part 4:
            //imageId= location.hash.slice(1),
            title: "",
            description: "",
            username: "",
            file: null,
            currentImgId: "",
        }, /////data end

        mounted: function () {
            var self = this;
            axios
                .get("/images")
                .then(function (resp) {
                    //console.log("resp.data: ", resp.data);
                    self.images = resp.data;
                })
                .catch(function (err) {
                    console.log("error in AXIOS/ get images:", err);
                });

            //window.addEventListener("hashchange", function() {
            //    console.log("something in the hash changed")
            //    self.imageId = location.hash.slice(1);
            //when modal closes we need to set the url after the hash to an empty string, also for errors (in catches).
            //})
        }, /////mounted ends

        methods: {
            handleClick: function (e) {
                var self = this;
                e.preventDefault();

                var formData = new FormData();

                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        //console.log("response form POST /upload: ", resp);
                        self.images.unshift(resp.data);
                    })
                    .catch(function (err) {
                        console.log("err in Post /upload", err);
                    });
            }, //handleClick end
            handleChange: function (e) {
                console.log("handleChange is running");
                this.file = e.target.files[0];
            }, //handleChange end
            modalChange: function () {
                this.currentImgId = "";
            }, //////modalChange end
            showModal: function (id) {
                console.log("click handled");
                this.currentImgId = id;
            }, ////showModal end
            showMore: function (e) {
                e.preventDefault();
                var self = this;
                var lowestOnPageId = self.images[self.images.length - 1].id;
                //console.log("lowestId: ", lowestOnPageId);

                axios
                    .get("/loadmore", { params: lowestOnPageId })
                    .then(function (resp) {
                        for (var i = 0; i < resp.data.length; i++) {
                            self.images.push(resp.data[i]);
                        }
                        lowestOnPageId = self.images[self.images.length - 1].id;
                        if (lowestOnPageId === resp.data[0].lowestId) {
                            console.log("reached first photo!");
                            moreButton = document.getElementsByClassName(
                                "more_button"
                            );
                            moreButton[0].classList.add("hidemore");
                        }

                        console.log(
                            "lowestOnPageId after 'more': ",
                            lowestOnPageId
                        );
                        console.log("resp.data in loadmore: ", resp.data);
                        //`/curimgmodal/${self.currentImgId}`
                        //console.log("response form POST /upload: ", resp);
                    });
                //var smallestId = self.
            }, //////showMore ends
        }, //methods end
    }); //Main vue end

    Vue.component("modal-comp", {
        template: "#modal-temp",
        props: ["currentImgId"],
        data: function () {
            return {
                //image_info: [],
                //comments: [],
                title: "",
                url: "",
                username: "",
                description: "",
                created_at: "",
                comment: "",
                comment_un: "",
                comment_co: "",
                //new_comment: "",
                //new_comment_un: "",
                //new_comment_co: "",
                comments: [],
            };
        }, ////end of data
        mounted: function () {
            var self = this;
            //console.log("self.currentImgID: ", self.currentImgID);
            axios
                .get(`/curimgmodal/${self.currentImgId}`)
                .then(function (resp) {
                    //self.image_info.push(resp.data[0]);
                    //self.comments.push(resp.data[1]);
                    //console.log("self: ", self);
                    self.title = resp.data[0].title;
                    self.url = resp.data[0].url;
                    self.username = resp.data[0].username;
                    self.description = resp.data[0].description;
                    self.created_at = resp.data[0].created_at;

                    self.comments = resp.data[1];
                    console.log("self.comments: ", self.comments);
                })
                .catch(function (err) {
                    console.log("error in AXIOS/ get images:", err);
                });
        }, //////mounted ends
        methods: {
            emitCloseEvent: function (e) {
                //console.log("shroud clicked!");
                this.$emit("close", this.currentImgID);
            }, //////emitCloseEvent end
            commentSubmit: function (e) {
                var self = this;
                e.preventDefault();
                axios
                    .post(`/addcomment/${self.currentImgId}`, {
                        comment_un: this.comment_un,
                        new_comment: this.new_comment,
                    })
                    .then(function (resp) {
                        self.comments.unshift(resp.data);
                        //console.log("resp in addComment", resp.data);
                        //console.log("self.comments: ", self.comments);
                    })
                    .catch(function (err) {
                        console.log("err in Post /upload", err);
                    });
            }, ///////commentSubmit end
        }, /////methods end
    }); ///end of modal-comp
})();
