export default class Request {
    constructor() {
        this.api = "https://otchet.atonlab.ru/calls-statistic/api/v2/";
        // this.api = "http://127.0.0.1:8000/api/v2/";
        // this.api = "https://atonapplication.xyz/api/v1/";



    }

    // присоединение параметров и выполнение GET запроса
    async GET(method, params={}) {
        let url = this.api + method + "/";
        let urlGet = new URL(url);
        for (let key in params) {
            urlGet.searchParams.set(key, params[key]);
        }
        // console.log(">>> ", urlGet);
        let response = await fetch(urlGet);
        if (response.ok) {
            let json = await response.json();
            return {
                error: false,
                result: json,
            };
        } else {
            let json = await response.json();
            alert("Ошибка: " + getStringDescErr(json));
            return {
                error: true,
                result: json,
            };
        }
        // return response;
    }

    async POST(method, data, params={}) {
        let url = this.api + method + "/";
        let urlPost = new URL(url);
        for (let key in params) {
            urlGet.searchParams.set(key, params[key]);
        }
        let response = await fetch(urlPost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            let json = await response.json();
            return {
                error: false,
                result: json,
            };
        } else {
            let json = await response.json();
            // alert("Ошибка: " + getStringDescErr(json));
            console.log("Ошибка: " + getStringDescErr(json));
            return {
                error: true,
                result: json,
            };
        }
    }

    async PUT(method, data, params={}) {
        let url = this.api + method + "/";
        let urlPost = new URL(url);
        for (let key in params) {
            urlGet.searchParams.set(key, params[key]);
        }
        let response = await fetch(urlPost, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            let json = await response.json();
            return {
                error: false,
                result: json,
            };
        } else {
            let json = await response.json();
            alert("Ошибка: " + getStringDescErr(json));
            return {
                error: true,
                result: json,
            };
        }
    }

}


function getStringDescErr(err) {
    if (typeof(err) === "string") {
        return err;
    }
    if (typeof(err) === "number") {
        return String(err);
    }
    if (typeof(err) === "object" && Array.isArray(err)) {
        let errStr = "";
        for (let e of err) {
            errStr += String(e);
        }
        return errStr;
    }

    if (typeof(err) === "object" && !Array.isArray(err)) {
        let errStr = "";
        for (let key in err) {
            errStr += `${key} - ${err[key]}, `;
        }
        return errStr;
    }
}


