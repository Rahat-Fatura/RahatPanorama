var express = require("express");
var router = express.Router();

const getInvoices = require("../src/panorama/src/getData");
const services = require("../src/services");
const _ = require("lodash");

/* GET home page. */
router.get("/", function (req, res, next) {
    return res.render("pages/dashboard/dashboard", {
        page: {
            name: "dashboard",
            display: "Kontrol Paneli",
            menu: "dashboard",
            uppermenu: "",
        },
    });
});

router.get("/send/:date", async function (req, res, next) {
    try {
        let date = req.params.date;
        let invoices = await getInvoices(date);
        for (let i = 0; i < invoices.length; i++) {
            let invoice = invoices[i];
            try {
                await services.apiService.connect.invoice.updateInvoice(
                    invoice
                );
                invoices[i].status = "success";
            } catch (error) {
                invoices[i].status = "error";
                invoices[i].error = error;
            }
        }
        return res.status(200).send(invoices);
    } catch (error) {
        return res.status(400).send(error);
    }
});

module.exports = router;
