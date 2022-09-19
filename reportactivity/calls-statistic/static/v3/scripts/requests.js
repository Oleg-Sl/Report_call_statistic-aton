import { DOMAIN } from "./domain.js";


class Auth {
    constructor(domain) {
        this.domain = domain;

        // токен доступа
        this.access = null;
        // время окнчания жизни токена доступа (в секундах)
        this.accessExp = null;
        // токен обновления
        this.refresh = null;
        // время жизни токена обновления (ы секундах)
        this.refreshExp = null;
    }

    async init() {
        // получение сохраненных токенов доступа и обновления
        await this.storageGetTokens();
        // пользователь не зарегистрирован
        if (!this.access || !this.refresh) {
            // Получение пароля логина для регистрации пользователя
            let username = await this.storageGetUsername();
            let password = await this.storageGetPassword();
            // регистрация пользователя
            let userRegistration = await this.serverRegistrationUser(username, password);
            // создание токенов доступа и обновления
            let tokens = await this.serverCreateToken(username, password);
            // сохранениние созданных токенов в хранилище
            let resSaveTokens = await this.storageSaveTokens(tokens.access, tokens.refresh);
        }
    }

    // получение токена доступа, при его просрочке - обновление, при отсутствии - получение
    async getAccessToken() {
        let isRefreshToken = this.isRefreshTokenExpired();
        // если токен обновления просрочен
        if (!isRefreshToken) {
            console.log("Создание нового токена");
            // Получение пароля логина для регистрации пользователя
            let username = await this.storageGetUsername();
            let password = await this.storageGetPassword();
            // создание токенов доступа и обновления
            let tokens = await this.serverCreateToken(username, password);
            // сохранениние созданных токенов в хранилище
            let resSaveTokens = await this.storageSaveTokens(tokens.access, tokens.refresh);
        }

        let isAccessToken = this.isAccessTokenExpired();
        // если токен доступа просрочен
        if (!isAccessToken) {
            console.log("Обновление токена");
            // получение токенов
            let tokens = await this.serverRefreshToken(this.refresh);
            // сохранениние обновленных токенов в хранилище
            let resSaveTokens = await this.storageSaveTokens(tokens.access, tokens.refresh);
        }
        return this.access;
    }



    // <<<--- ПОЛУЧЕНИЕ И СОХРАНЕНИЕ ТОКЕНОВ В ХРАНИЛИЩЕ --->>>
    // возвращает имя пользователя из хранилиша
    async storageGetUsername() {
        return new Promise((resolve, reject) => {
            let callback = result => {
                if (result.status != 200 || result.error()) {
                    console.log(`${result.error()} (callMethod ${method}: ${JSON.stringify(params)})`);
                    return reject("");
                }
                let userData = result.data();
                return resolve(userData.ID);
            };
            BX24.callMethod("profile", {}, callback);
        });
    }
 
    // возвращает пароль зарегистрированного пользователя из хранилиша
    async storageGetPassword() {
        let password = await BX24.appOption.get("passwd_use_app");
        return password;
    }

    // возвращает данные сохраненных токенов из хранилища
    async storageGetTokens() {
        // получение токена доступа
        this.access = await BX24.userOption.get("accessToken");
        // время окончания жизни токена доступа
        this.accessExp = await BX24.userOption.get("accessExp");
        // получение токена обновления
        this.refresh = await BX24.userOption.get("refreshToken");
        // время окончания жизни токена обновления
        this.refreshExp = await BX24.userOption.get("refreshExp");
    }

    // сохранение токенов в хранилище пользователя
    async storageSaveTokens(accessToken, refreshToken) {
        try {
            this.access = accessToken;
            this.refresh = refreshToken;

            let [headerAccess, dataAccess, signAccess] = accessToken.split(".");
            let [headerRefresh, dataRefresh, signRefresh] = refreshToken.split(".");
            
            // парсинг данных из токена
            let dataAccessObj = JSON.parse(atob(dataAccess));
            let dataRefreshObj = JSON.parse(atob(dataRefresh));

            // время окончания жизни токенов
            this.accessExp = dataAccessObj["exp"];
            this.refreshExp = dataRefreshObj["exp"];
            
            await BX24.userOption.set("accessToken", this.access);
            await BX24.userOption.set("accessExp", this.accessExp);

            await BX24.userOption.set("refreshToken", this.refresh);
            await BX24.userOption.set("refreshExp", this.refreshExp);
            
            return true;
        } catch {
            console.warn("Не удалось сохранить токены.");
        }
    }



    // <<<--- Проверка валидности токенов --->>>
    // проверка валидности токена доступа: false - access токен просрочен, иначе - true
    isAccessTokenExpired() {
        const accessTokenExpDate = this.accessExp - 180;
        const nowTime = Math.floor(new Date().getTime() / 1000);
        return accessTokenExpDate > nowTime;
    }

    // проверка валидности токена обновления: false - refresh токен просрочен, иначе - true
    isRefreshTokenExpired() {
        const refreshTokenExpDate = this.refreshExp - 180;
        const nowTime = Math.floor(new Date().getTime() / 1000);
        return refreshTokenExpDate > nowTime;
    }



    // <<<--- ОБРАЩЕНИЕ К СЕРВЕРУ: регистрация пользователя, создание и обновление токена --->>>
    // регистрация пользователя на сервере
    async serverRegistrationUser(username, password) {
        let url = this.domain + "auth/users/";

        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password
            }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.status === 201) {
                    return Promise.resolve(data);
                }
                if (res.status === 400 && data.username[0] == "A user with that username already exists.") {
                    return Promise.resolve(data);
                }
                console.error(`Ошибка регистрации пользователя: ${data}`);
                return Promise.reject();
            });
    }

    // создание токена по логину и паролю
    async serverCreateToken(username, password) {
        let url = this.domain + "auth/jwt/create/";

        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.status === 200) {
                    return Promise.resolve(data);
                }
                console.error(`Ошибка создания токена: ${data}`);
                return Promise.reject();
            });
    }

    // обновление токенов
    async serverRefreshToken(refreshToken) {
        let url = this.domain + "auth/jwt/refresh/";

        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken
            }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.status === 200) {
                    return Promise.resolve(data);
                }
                console.error(`Ошибка обновления токена: ${data}`);
                return Promise.reject();
            });
    }
}


export default class Request {
    constructor() {
        this.api = `${DOMAIN}api/v3/`;
        this.auth = new Auth(DOMAIN);
    }

    async init() {
        // инициализация объекта - авторизация и аутентификация
        await this.auth.init();
    }

    // присоединение параметров и выполнение GET запроса
    async GET(method, params={}) {
        let token = await this.auth.getAccessToken();
        let options = {
            headers: {Authorization: `Bearer ${token}`}
        };
        let url = this.api + method + "/";
        let urlGet = new URL(url);
        for (let key in params) {
            urlGet.searchParams.set(key, params[key]);
        }

        let response = await fetch(urlGet, options);
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
    
    // присоединение параметров и выполнение GET запроса - пагинация - извлечение всех данных 
    async GET_LONG(method, params={}) {
        let result = [];
        let url = this.api + method + "/";
        let urlGet = new URL(url);
        for (let key in params) {
            urlGet.searchParams.set(key, params[key]);
        }

        while (true) {
            let token = await this.auth.getAccessToken();
            let options = {
                headers: {Authorization: `Bearer ${token}`}
            };
            let response = await fetch(urlGet, options);
            if (response.ok) {
                let json = await response.json();
                result = result.concat(json.results);
                urlGet = json.next;
                if (!urlGet) break;
            } else {
                let json = await response.json();
                alert("Ошибка: " + getStringDescErr(json));
                return {
                    error: true,
                    result: json,
                };
            }
        }
            
        return {
            error: false,
            result: result,
        };
    }

    async POST(method, data, params={}) {
        let token = await this.auth.getAccessToken();
        let url = this.api + method + "/";
        let urlPost = new URL(url);
        for (let key in params) {
            urlGet.searchParams.set(key, params[key]);
        }
        let response = await fetch(urlPost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': `Bearer ${token}`
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
        let token = await this.auth.getAccessToken();
        let url = this.api + method + "/";
        let urlPost = new URL(url);
        for (let key in params) {
            urlGet.searchParams.set(key, params[key]);
        }
        let response = await fetch(urlPost, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': `Bearer ${token}`
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

