const connect = require("../../../connection");

const insertInvoice = (body) => {
    return new Promise((resolve, reject) => {
        connect("post", `/connect/invoice`, body)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const updateInvoice = (body) => {
    return new Promise((resolve, reject) => {
        connect("put", `/connect/invoice`, body)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const deleteInvoice = (ex_id) => {
    return new Promise((resolve, reject) => {
        connect("delete", `/connect/invoice/${ex_id}`, null)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports = {
    insertInvoice,
    updateInvoice,
    deleteInvoice,
};
