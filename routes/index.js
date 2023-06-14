var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    return res.render("pages/dashboard/dashboard", {
        page: {
            name: "dashboards",
            display: "Kontrol Paneli",
            menu: "dashboards",
            uppermenu: "",
        },
    });
});

module.exports = router;
