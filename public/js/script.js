//console.log("script is linked")

(function () {
    new Vue({
        el: "#main",
        data: {
            images: [],
            imageId: null,
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
                        //console.log(
                        //    "self.images inside post/upload: ",
                        //    self.images
                        //);
                        //console.log("Am I here?");
                        console.log("response form POST /upload: ", resp);

                        self.images.unshift(resp.data);
                        console.log(
                            "images after unshift attempt",
                            self.images
                        );
                    })
                    .catch(function (err) {
                        console.log("err in Post /upload", err);
                    });
            }, //handleClick end
            handleChange: function (e) {
                //console.log("handleChange is running");
                //console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            }, //handleChange end
            modalChange: function (data) {
                console.log("change has occured");
            }, //////modalChange end
            showModal: function (id) {
                console.log("click handled");
                //modalVisible = true;
                this.currentImgId = id;
                //console.log("currentImgId: ", currentImgId);
            }, ////showModal end
        }, //methods end
    }); //Main vue end

    Vue.component("modal-comp", {
        template: "#modal-temp",
        props: ["currentImgId"],
        data: function () {
            return {};
        }, ////end of data
        mounted: {
            function() {
                var self = this;
                axios
                    .get(`/curimgmodal/${self.currentImgId}`)
                    .then(function (resp) {
                        console.log("resp: ", resp);
                        //self.images = resp.data;
                    })
                    .catch(function (err) {
                        console.log("error in AXIOS/ get images:", err);
                    });
            },
            methods: {}, /////methods end
        }, //////mounted ends
    }); ///end of modal-comp
})();
