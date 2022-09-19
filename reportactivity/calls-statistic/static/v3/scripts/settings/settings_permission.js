import {templatePermissionHead, templatePermissionDepartment, templatePermissionUser, } from '../templates/template_permission.js';


export default class Permission {
    constructor(container, requests, bx) {
        this.container = container;
        this.requests = requests;                   // объект Requests для выполнения запросов к серверу
        this.bx = bx;

        // КОНТЕЙНЕРЫ
        this.table = this.container.querySelector("table");                                             // контейнер - таблица

    }

    init(departments) {
        this.departments = departments;
        // вывод списка подразделений в таблицу
        this.renderTable();
        // инициализация обработчиков событий
        this.initHandler();
    }

    // инициализация обработчиков событий
    initHandler() {
        // сворачивание/разворачивание списка сотрудников подразделения
        this.table.addEventListener("click", async (event) => {
            let clickIsDepart = event.target.classList.contains("permission-department-href");
            if (!clickIsDepart) {
                return;
            }
            let tbody = event.target.closest("tbody");                          // сворачиваемый/разворачиваемый блок таблицы
            let rowHeader = event.target.closest("tr");                         // строка подразделения по которой сработало событие
            let departId = tbody.dataset.departId;                              // идентификатор подразделения
            let statusUserDisplay = tbody.dataset.userDisplay;                  // сотрудники подразделения уже загружены
            if (!statusUserDisplay) {
                // если список пользователей подразделения не загружен
                rowHeader.classList.add("download-data");                       // вывод индикатора - загрузка данных
                await this.renderUsersDepartment(tbody, departId);              // получение пользователей подразделения
                tbody.dataset.userDisplay = true;                               // список пользователей уже получен
                rowHeader.classList.remove("download-data");                    // удаление индикатора - загрузка данных
            }
            
            rowHeader.classList.toggle("permission-department-off"); 
            let rowsCollaps = tbody.querySelectorAll(".permission-user-tr");    // список всех строк пользователей в подразделении
            rowsCollaps.forEach(element => {
                element.classList.toggle("row-collaps");                        // показать/скрыть строку пользователя
            });
        })

        // изменение права доступа на редактирование таблицы
        this.table.addEventListener("change", async (event) => {
            let isChangeAccess = event.target.classList.contains("select-access-table");
            if (isChangeAccess) {
                let tr = event.target.closest("tr");
                let userId = tr.dataset.userId;
                let value = event.target.value;
                console.log("value = ", value);
                let result = await this.requests.PUT("users/" + userId, {"ALLOWED_EDIT": value});
                console.log("result = ", result);
            }
        })

        // изменение права доступа к настройкам
        this.table.addEventListener("change", async (event) => {
            let isChangeAccess = event.target.classList.contains("select-access-settings");
            if (isChangeAccess) {
                let tr = event.target.closest("tr");
                let userId = tr.dataset.userId;
                let value = Boolean(+event.target.value);
                console.log("value = ", value);
                let result = await this.requests.PUT("users/" + userId, {"ALLOWED_SETTING": value});
                console.log("result = ", result);
            }
        })

        // изменение права доступа к изменению статуса дня
        this.table.addEventListener("change", async (event) => {
            let isChangeAccess = event.target.classList.contains("select-access-status-day");
            if (isChangeAccess) {
                let tr = event.target.closest("tr");
                let userId = tr.dataset.userId;
                let value = Boolean(+event.target.value);
                let result = await this.requests.PUT("users/" + userId, {"ALLOWED_STATUS_DAY": value});
            }
        })

        // изменение права доступа к верификации сообщений
        this.table.addEventListener("change", async (event) => {
            let isChangeAccess = event.target.classList.contains("select-access-verification-msg");
            if (isChangeAccess) {
                let tr = event.target.closest("tr");
                let userId = tr.dataset.userId;
                let value = Boolean(+event.target.value);
                let result = await this.requests.PUT("users/" + userId, {"ALLOWED_VERIFICATION_MSG": value});
            }
        })
    }

    // вывод списка подразделений в таблицу
    renderTable() {
        let contentHTML = templatePermissionHead();
        for (let depart of this.departments) {
            contentHTML += templatePermissionDepartment(depart.ID, depart.NAME);
        }
        this.table.innerHTML = contentHTML;
    }

    // вывод списка сотрудников подразделений в таблицу
    async renderUsersDepartment(container, depart) {
        let users = await this.requests.GET("users", {"UF_DEPARTMENT": depart});            // список пользователей подразделения
        let contentHTML = "";
        for (let user of users.result.results) {
            contentHTML += templatePermissionUser(
                user.ID, 
                user.LAST_NAME, 
                user.NAME, 
                user.ALLOWED_EDIT, 
                user.ALLOWED_SETTING,
                user.ALLOWED_STATUS_DAY,
                user.ALLOWED_VERIFICATION_MSG,
            );
        }
        container.insertAdjacentHTML('beforeend', contentHTML);
    }
}


