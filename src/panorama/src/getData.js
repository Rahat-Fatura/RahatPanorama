let config = require("config");
let soap = require("soap");
let fs = require("fs");
let path = require("path");
let uuid = require("uuid");

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

module.exports = () => {
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
                            Viewadi:
                                "VIEWFATURAGENERIC WHERE TRHISLEMTARIHI = '2023-06-10' AND LNGDISTKOD = 7 --",
                        },
                    ],
                },
                ...panorama.data,
            };
            client.GetBytesEntitySetWithPacketLogin(args, (err, result) => {
                if (err) console.log("err", err);
                let res = Buffer.from(
                    result.GetBytesEntitySetWithPacketLoginResult
                        .ResultByteArray,
                    "base64"
                );
                let export_path = path.join(
                    path.resolve(__dirname, "..", "..", ".."),
                    "data",
                    uuid.v4() + ".zip"
                );
                fs.writeFileSync(export_path, res);
            });
        }
    );
};
