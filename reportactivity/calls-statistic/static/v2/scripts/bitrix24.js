
export default  class BX {
    constructor() {
        this.batchLength = 5;
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

    async callMethodMetaData(method, params = {}) {
        return new Promise((resolve, reject) => {
            let callback = result => {
                if (result.status != 200 || result.error()) {
                    console.log(`${result.error()} (callMethod ${method}: ${JSON.stringify(params)})`);
                    return reject("");
                }
                return resolve(result);
            };
            BX24.callMethod(method, params, callback);
        });
    }

    async batchMethod(reqPackage) {
        return new Promise((resolve, reject) => {
            let callback = result => {
                // console.log("result = ", result);
                // console.log("result.status = ", result.status);
                let response = [];
                for (let key in result) {
                    if (result[key].status != 200 || result[key].error()) {
                        console.log(`${result[key].error()} (method ${reqPackage[key]["method"]}: ${JSON.stringify(reqPackage[key]["params"])})`);
                        // return reject("");
                        continue;
                    }
                    let resData = result[key].data();
                    response = response.concat(resData);
                }
                return resolve(response);
            };
            BX24.callBatch(reqPackage, callback);
        });
    }

    // формирование списка запросов для batch
    generatingRequests(method, params, start, total) {
        let batch = [];                                     // список запросов
        for (let ind=start; ind < total; ind += 50) {
            let paramsStart = JSON.parse(JSON.stringify(params));
            paramsStart.start = ind;
            // формирование запроса
            let req = {
                method,
                params: paramsStart
            };
            batch.push(req);
        }    
        return batch;
    }

    // формирование списка пакетов запросов batch 
    splittingListRequests(requestsList){
        let requestsBatch = [];                     // 
        let batch = {};                             // пакет batch запросов
        let count = 1;                              // текущее количество запросов в пакете batch запросов
        for (let ind in requestsList) {
            if (count > this.batchLength) {         // если количество запросов в пакете превысило лимит
                requestsBatch.push(batch);          // добавление пакета batch запросов 
                batch = {};
                count = 1
            }
            batch[ind] = requestsList[ind];         // добавление запроса в пакет batch
            count++;                                // кол-во запросов в пакете batch
        }
        requestsBatch.push(batch);                  // добавление пакета batch запросов 
        
        return requestsBatch;
    }

    // 
    async longBatchMethod(method, params) {
        let response = await this.callMethodMetaData(method, params);
        let result = response.answer.result;        // данные
        let next = response.answer.next;            // следующий номер элемента для извлечения
        let total = response.answer.total;          // всего элементов
        if (next) {
            let requestsList = this.generatingRequests(method, params, next, total);        // формирование списка запросов
            let batchList = this.splittingListRequests(requestsList);                       // разбитие списка запросов на "пачки"
            let countBatch = batchList.length;      // общее количество BATCH запросов
            let count = 0;                          // количество выпоненных BATCH запросов
            for (let batch of batchList) {
                let res = await this.batchMethod(batch);                                    //
                result = result.concat(res);
                count++;
                console.log(`Выполнено ${count} запросов из ${countBatch}`);
            }
        }
        
        return result;
    }

}


