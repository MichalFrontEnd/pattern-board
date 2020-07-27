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
            //currentImgId: "",
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

            window.addEventListener("hashchange", function () {
                console.log("something in the hash changed");
                self.currentImgId = location.hash.slice(1);

                //when modal closes we need to set the url after the hash to an empty string, also for errors (in catches).
            });
            this.scrollPos(this.images);
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
                console.log(
                    //"self.$refs.imageInput before: ",
                    self.$refs.imageInput
                );
                self.title = "";
                self.description = "";
                self.username = "";
                self.$refs.imageInput.value = "";
                //console.log("self.$refs.imageInput after: ", self.$refs);
            }, //handleClick end
            handleChange: function (e) {
                //console.log("handleChange is running");
                this.file = e.target.files[0];
            }, //handleChange end
            modalChange: function () {
                this.currentImgId = "";
                location.hash = "";
            }, //////modalChange end
            showModal: function (id) {
                this.currentImgId = id;
            }, ////showModal end
            getMoreImgs: function () {
                var self = this;
                var lowestOnPageId = self.images[self.images.length - 1].id;
                console.log("lowestOnPageId in getMoreImgs: ", lowestOnPageId);
                axios
                    .get("/loadmore", { params: lowestOnPageId })
                    .then(function (resp) {
                        for (var i = 0; i < resp.data.length; i++) {
                            self.images.push(resp.data[i]);
                        }
                        lowestOnPageId = self.images[self.images.length - 1].id;
                    });
            }, ///getMoreImgs ends
            //showMore: function (e) {
            //e.preventDefault();
            //var self = this;
            //var lowestOnPageId = self.images[self.images.length - 1].id;
            ////console.log("lowestId: ", lowestOnPageId);

            //axios
            //    .get("/loadmore", { params: lowestOnPageId })
            //    .then(function (resp) {
            //        for (var i = 0; i < resp.data.length; i++) {
            //            self.images.push(resp.data[i]);
            //        }
            //        lowestOnPageId = self.images[self.images.length - 1].id;
            //        if (lowestOnPageId === resp.data[0].lowestId) {
            //            //console.log("reached first photo!");
            //            moreButton = document.getElementsByClassName(
            //                "more_button"
            //            );
            //            moreButton[0].classList.add("hidemore");
            //        }
            //console.log("response form POST /upload: ", resp);
            //});
            //}, //////showMore ends

            scrollPos: function (image) {
                var self = this;
                //var self = this;
                ////var lowestOnPageId = self.images[self.images.length - 1].id;
                //console.log("self.images: ", self.images);
                //console.log("lowestOnPageId: ", lowestOnPageId);
                //console.log(
                //    "document.documentElement.scrollTop: ",
                //    document.documentElement.scrollTop
                //);
                //console.log("window.innerHeight: ", window.innerHeight);
                //console.log(
                //    "document.documentElement.offsetHeight: ",
                //    document.documentElement.offsetHeight
                //);
                window.onscroll = function () {
                    //var lowestOnPageId = self.images[self.images.length - 1].id;
                    var windowBottom =
                        document.documentElement.scrollTop +
                            window.innerHeight >
                        document.documentElement.offsetHeight - 50;

                    if (windowBottom) {
                        setTimeout(self.getMoreImgs(), 1000);
                    }
                };
                //if (
                //    document.documentElement.scrollTop + window.innerHeight >=
                //    document.documentElement.clientHeight - 100
                //) {
                //    console.log("let's scroll!");
                //}
            }, ////end of scroll

            //setDefault: function() {
            //    this.title = "",
            //    this.description = "",
            //    this.username = "",
            //}, ///setdeafult end
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
                comments: [],
                //currentImgId: location.hash.slice(1),
                new_comment: "",
            };
        }, ////end of data
        mounted: function () {
            this.getInfo();
        }, //////mounted ends
        watch: {
            currentImgId: function () {
                this.getInfo();
            }, //////imgChange end
        }, //////watch ends
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
            getInfo: function () {
                var self = this;
                //console.log("self.currentImgID: ", self.currentImgID);
                self.currentImgId = location.hash.slice(1);
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

                        if (resp.data.length === 0) {
                            self.$emit("close");
                            //self.currentImgId = "";
                            //location.hash = "";
                        }
                    })

                    .catch(function (err) {
                        console.log("error in AXIOS/ get images:", err);

                        self.$emit("close");
                    });
            },
        }, /////methods end
    }); ///end of modal-comp
})();
