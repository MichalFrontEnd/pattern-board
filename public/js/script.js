//console.log("script is linked")

(function () {
    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
        }, /////data end
        mounted: function () {
            var self = this;
            axios
                .get("/images")
                .then(function (resp) {
                    console.log("resp.data: ", resp.data);
                    self.images = resp.data;
                })
                .catch(function (err) {
                    console.log("error in AXIOS/ get images:", err);
                });
        }, /////mounted ends

        methods: {
            handleClick: function (e) {
                e.preventDefault();
                console.log("THIS!", this);

                var formData = new FormData();

                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        console.log("Am I here?");
                        console.log("response form POST /upload: ", resp);
                        images.unshift(formData);
                        console.log("images after unshift attempt", images);
                    })
                    .catch(function (err) {
                        console.log("err in Post /upload", err);
                    });
            }, //handleClick end
            handleChange: function (e) {
                console.log("handleChange is running");
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            }, //handleChange end
        }, //methods end
    });
})();
