const config = require("config");
const axios = require("axios");

const connect = (method, url, body) => {
    return new Promise(async (resolve, reject) => {
        const base_url = config.get(`services.apiGateway.url`);
        const api_key = config.get(`services.apiGateway.api_key`);
        const requestUrl = `${base_url}${url}`;
        let data;
        if (body) data = body;
        const headers = {
            "Content-Type": "application/json",
            "api-key": api_key,
        };

        const configHttp = {
            method,
            url: requestUrl,
            headers,
            data,
        };

        await axios(configHttp)
            .then((response) => {
                return resolve(response.data);
            })
            .catch((error) => {
                // console.log("axios error : ", error);
                if ("response" in error) {
                    const result = error.response;
                    if (result.data?.code) {
                        return reject({
                            code: result.data.code,
                            data: result.data.data,
                        });
                    } else {
                        return reject({
                            code: 500,
                            data: result.data,
                        });
                    }
                } else {
                    return reject({
                        code: 500,
                        data: "Servise erişilemiyor!",
                        detail: error.cause,
                    });
                }
            });
    });
};

module.exports = connect;
