
(function () {
    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            currentImgId: "",
            selected: "",
        }, /////data end

        mounted: function () {
            var self = this;

            axios
                .get("/images")
                .then(function (resp) {
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
                formData.append("selected", this.selected);

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        self.images.unshift(resp.data);
                    })
                    .catch(function (err) {
                        console.log("err in Post /upload", err);
                    });
                self.title = "";
                self.description = "";
                self.username = "";
                self.$refs.imageInput.value = "";
                self.selected = "";
            }, //handleClick end
            handleChange: function (e) {
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
                window.onscroll = function () {
                    var windowBottom =
                        document.documentElement.scrollTop +
                            window.innerHeight >
                        document.documentElement.offsetHeight - 50;

                    if (windowBottom) {
                        setTimeout(self.getMoreImgs(), 1000);
                    }
                };
            }, ////end of scroll
        }, //methods end
    }); //Main vue end

    Vue.component("modal-comp", {
        template: "#modal-temp",
        props: ["currentImgId"],
        data: function () {
            return {
                title: "",
                url: "",
                username: "",
                description: "",
                created_at: "",
                comment: "",
                comment_un: "",
                comment_co: "",
                comments: [],
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
                    })
                    .catch(function (err) {
                        console.log("err in Post /upload", err);
                    });
                self.comment_un = "";
                self.new_comment = "";
            }, ///////commentSubmit end
            getInfo: function () {
                var self = this;
                self.currentImgId = location.hash.slice(1);
                axios
                    .get(`/curimgmodal/${self.currentImgId}`)
                    .then(function (resp) {
                        self.title = resp.data[0].title;
                        self.url = resp.data[0].url;
                        self.username = resp.data[0].username;
                        self.description = resp.data[0].description;
                        self.created_at = resp.data[0].created_at;
                        self.comments = resp.data[1];

                        if (resp.data.length === 0) {
                            self.$emit("close");
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
