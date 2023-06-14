let config = require("config");
let soap = require("soap");
let fs = require("fs");
let path = require("path");
let uuid = require("uuid");
const { exec } = require("child_process");

let panorama = {
    url: config.get("services.panorama.url"),
    data: {
        strUserName: config.get("services.panorama.user.username"),
        strPassWord: config.get("services.panorama.user.password"),
        bytFirmaKod: config.get("services.panorama.user.firmakod"),
        lngCalismaYili: config.get("services.panorama.user.calismayil"),
        lngDistributorKod: config.get("services.panorama.user.distkod"),
    },
};

module.exports = (date) => {
    soap.createClient(
        panorama.url,
        {
            forceSoap12Headers: true,
        },
        (err, client) => {
            if (err) console.log(err);
            let args = {
                objPaketTanim: {
                    clsPaketTanim: [
                        {
                            Tabloadi: "VIEWFATURAGENERIC",
                            Viewadi: `VIEWFATURAGENERIC WHERE TRHISLEMTARIHI = '${date}' AND LNGDISTKOD = ${panorama.data.lngDistributorKod} --`,
                        },
                        {
                            Tabloadi: "VIEWMUSTERIGENERIC",
                            Viewadi: "VIEWMUSTERIGENERIC",
                            Kriter: `"(LNGDISTKOD = ${panorama.data.lngDistributorKod}) AND (BYTDURUM = 0)"`,
                        },
                        {
                            Tabloadi: "TBLMSDMUSTERIBAKIYE",
                            Viewadi: `TBLMSDMUSTERIBAKIYE WHERE LNGDISTKOD = ${panorama.data.lngDistributorKod} AND (DBLBAKIYE > 1 OR DBLBAKIYE < -1)  --`,
                        },
                    ],
                },
                ...panorama.data,
            };
            client.GetBytesEntitySetWithPacketLogin(args, (err, result) => {
                if (err) {
                    console.log("err", err);
                    return;
                } else {
                    try {
                        let res = Buffer.from(
                            result.GetBytesEntitySetWithPacketLoginResult
                                .ResultByteArray,
                            "base64"
                        );
                        let uuid_name = uuid.v4();
                        let zip_name = uuid_name + ".zip";
                        let export_path = path.join(
                            path.resolve(__dirname, "..", "..", ".."),
                            "data",
                            zip_name
                        );
                        fs.writeFileSync(export_path, res);
                        let deserialize_path = path.resolve(
                            __dirname,
                            "..",
                            "..",
                            "..",
                            "deserialize",
                            "SmartConnectRead.exe"
                        );
                        let json_name = uuid_name + ".json";
                        let export_json_path = path.join(
                            path.resolve(__dirname, "..", "..", ".."),
                            "data",
                            json_name
                        );
                        exec(
                            `${deserialize_path} ${export_path} ${export_json_path}`,
                            { maxBuffer: 1024 * 1024 * 100 },
                            (err, stdout, stderr) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                let invoices = JSON.parse(
                                    fs.readFileSync(export_json_path, "utf8")
                                ).FaturaGeneric;
                                let customers = JSON.parse(
                                    fs.readFileSync(export_json_path, "utf8")
                                ).Musteriler;
                                let balances = JSON.parse(
                                    fs.readFileSync(export_json_path, "utf8")
                                ).MusteriBakiyeler;
                                fs.unlinkSync(export_path);
                                // fs.unlinkSync(export_json_path);

                                console.log(
                                    invoices.length,
                                    customers.length,
                                    balances.length
                                );
                            }
                        );
                    } catch (error) {
                        console.log(error, err, result);
                    }
                }
            });
        }
    );
};
