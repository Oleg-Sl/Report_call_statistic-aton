
export default  class BX {
    constructor() {

    }

    async callMethod(method, params = {}) {
        return new Promise((resolve, reject) => {
            let callback = result => {
                if (result.status != 200 || result.error()) {
                    console.log(`${result.error()} (callMethod ${method}: ${JSON.stringify(params)})`);
                    return reject("");
                }
                return resolve(result.data());
            };
            BX24.callMethod(method, params, callback);
        });
    }
}


