const lodash = require("lodash");
const config = require("config");

module.exports = (invoices, customers, balances) => {
    return new Promise((resolve, reject) => {
        try {
            let invoices_array = [];
            let rec_no = 0;
            let inv_ob = {};
            for (let i = 0; i < invoices.length; i++) {
                let invoice = invoices[i];
                if (rec_no != invoice.Belgekod) {
                    if (rec_no != 0) {
                        invoices_array.push(inv_ob);
                    }
                    rec_no = invoice.Belgekod;
                    inv_ob = {};
                    let customer = lodash.find(customers, {
                        ErpKod2: invoice.MusteriKod,
                    });
                    let balance = lodash.find(balances, {
                        Musterikod: customer.Kod,
                    });
                    let customer_object = {
                        TaxNumber: customer.VN
                            ? customer.VN
                            : customer.TCKimlikNo,
                        TaxOffice: customer.VD,
                        Name: (
                            customer.Unvan +
                            (customer.KisaAd ? " - " + customer.KisaAd : "")
                        ).replace("&", ""),
                        Address: (
                            customer.Adres1 +
                            (customer.Adres2 ? " " + customer.Adres2 : "")
                        ).replace("&", ""),
                        City: customer.Sehir,
                        District: customer.Ilce,
                        Country: "Türkiye",
                        Phone:
                            customer.Telefon +
                            (customer.CepTelNo ? "-" + customer.CepTelNo : ""),
                        Mail: customer.Email ? customer.Email : "",
                    };
                    let despatch_object = {};
                    if (invoice.IrsaliyeMatbuNo) {
                        despatch_object = {
                            Despatches: [
                                {
                                    Date: invoice.IrsaliyeTarihi,
                                    Value: invoice.IrsaliyeMatbuNo,
                                },
                            ],
                        };
                    }
                    let notes = {
                        Notes: [
                            {
                                Note: `Müşteri Kodu : ${customer.ErpKod2}`,
                            },
                            {
                                Note:
                                    balance.Bakiye != 0
                                        ? `Müşteri Güncel Bakiyesi : ${balance.Bakiye} TL`
                                        : "",
                            },
                        ],
                    };
                    let invoice_object = {
                        External: {
                            ID: invoice.Belgekod,
                            RefNo: invoice.Matbuno,
                            Type: `PANORAMA:rahatPanorama:${config.get(
                                "services.panorama.user.distkod"
                            )}:${config.get(
                                "services.panorama.user.calismayil"
                            )}`,
                        },
                        IssueDateTime: invoice.Islemtarihi,
                        ...despatch_object,
                        ...notes,
                        Customer: customer_object,
                        Lines: [
                            {
                                Name: invoice.UrunAdi,
                                Quantity: invoice.Miktar,
                                UnitCode: "C62",
                                Price: invoice.Birimfiyat,
                                KDV: {
                                    Percent: invoice.Detaykdvoran,
                                },
                                Allowance: {
                                    Percent:
                                        (invoice.Detayisktutar * 100) /
                                        (invoice.Detaynetfiyat +
                                            invoice.Detayisktutar),
                                },
                                AdditionalNames: {
                                    BuyerCode: invoice.Urunkod,
                                },
                            },
                        ],
                    };
                    inv_ob = {
                        integrator: config.get("integrator"),
                        document: invoice_object,
                    };
                } else {
                    let lines = inv_ob.document.Lines;
                    lines.push({
                        Name: invoice.UrunAdi,
                        Quantity: invoice.Miktar,
                        UnitCode: "C62",
                        Price: invoice.Birimfiyat,
                        KDV: {
                            Percent: invoice.Detaykdvoran,
                        },
                        Allowance: {
                            Percent:
                                (invoice.Detayisktutar * 100) /
                                (invoice.Detaynetfiyat + invoice.Detayisktutar),
                        },
                        AdditionalNames: {
                            BuyerCode: invoice.Urunkod,
                        },
                    });
                    inv_ob.document.Lines = lines;
                }
            }
            return resolve(invoices_array);
        } catch (error) {
            return reject(error);
        }
    });
};
