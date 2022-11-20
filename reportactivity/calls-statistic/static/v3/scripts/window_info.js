import {templateCallsItem, templateCommentsItem, } from './templates/template_window_info.js';                 // HTML-шаблоны

// const DOMAIN = "https://atonlab.bitrix24.ru/marketplace/app/229/"

const OWNER_TYPE = {
    "1": "Лид",
    "2": "Сделка",
    "3": "Контакт",
    "4": "Компания",
}
const OWNER_TYPE_URL = {
    "1": "/crm/lead/details/",
    "2": "/crm/deal/details/",
    "3": "/crm/contact/details/",
    "4": "/crm/company/details/",
}

const USER_PATH = "/company/personal/user/";

export default class WindowInfo {
    constructor(container, requests, bx) {
        this.container = container;
        this.requests = requests;                           // объект Requests для выполнения запросов к серверу
        this.bx = bx;
        
        // КНОПКИ
        this.btnComment = this.container.querySelector(".window-info-nav-link-comment");        // кнопка вкладки - "Комментарии"
        this.btnCalls = this.container.querySelector(".window-info-nav-link-calls");            // кнопка вкладки - "Звонки"
        this.btnSend = this.container.querySelector(".comment-send-enter p");                   // кнопка - "отправить комментарий"

        // ПАНЕЛИ
        this.paneComment = this.container.querySelector(".pane-comment");                        // вкладка - "Комментарии"
        this.paneCalls = this.container.querySelector(".pane-calls");                            // вкладка - "Звонки"

        // КОНТЕЙНЕРЫ
        this.containerComments = this.container.querySelector(".comment-list");                 // контейнер - "Список комментариев"
        this.containerCalls = this.container.querySelector(".calls-list");                      // контейнер - "Список звонков"
        this.containerSpinnerComment = this.container.querySelector(".comment-list-spinner");   // контейнер - "Загрузка списка комментариев"
        this.containerSpinnerCalls = this.container.querySelector(".calls-list-spinner");       // контейнер - "Загрузка списка звонков"
        
        
        this.badgeCountCalls = this.container.querySelector(".count-calls");                    // поле - "значек с количеством звонков"
        this.inputComment = this.container.querySelector(".comment-send-input");                // поле - "ввод комментария"

        // Данные комментатора - неизменные
        this.commentator = {
            ID: null,
            LAST_NAME: null,
            NAME: null,
            ALLOWED_STATUS_DAY: null,
            ALLOWED_VERIFICATION_MSG: null
        }

        // Данные обновляемые при открытии окна
        this.recipient = null;
        this.dateStart = null;
        this.dateEnd = null;

    }

    init(commentator) {
        this.commentator = commentator;
        this.initHandler();
    }

    initHandler() {
        // закрытие окна
        document.addEventListener("click", async (event) => {
            let clickNoWindow = event.target.closest("#windowInfoData");
            if (!clickNoWindow) {
                this.container.classList.add("d-none");
            }
        })
        // открытие вкладки - КОММЕНТАРИИ
        this.btnComment.addEventListener("click", async (event) => {
            this.btnComment.classList.add("active");
            this.btnCalls.classList.remove("active");
            this.paneComment.classList.add("active");
            this.paneCalls.classList.remove("active");
        })
        // открытие вкладки - ЗВОНКИ
        this.btnCalls.addEventListener("click", async (event) => {
            this.btnComment.classList.remove("active");
            this.btnCalls.classList.add("active");
            this.paneComment.classList.remove("active");
            this.paneCalls.classList.add("active");
        })
        // добавление комментария
        this.btnSend.addEventListener("click", async (event) => {
            let comment = this.inputComment.innerHTML;                              // текст комментария
            let date = new Date();                                                  // дата комментария
            let data = {
                comment: comment,
                date_comment_add: date,
                date_comment: this.dateStart,
                recipient: this.recipient,
                commentator: this.commentator.ID
            }
            let result = await this.requests.POST("comment", data);                 // добавление комментария на сервере
            if (!result.error) {
                this.addComment(
                    this.commentator.ID,
                    `${this.commentator.LAST_NAME} ${this.commentator.NAME}`,       // Фамилия + Имя комментатора
                    comment,                                                        // текст комментария
                    date.toLocaleString(),                                          // время создания комментария
                    `${USER_PATH}${this.commentator.ID}/`                           // путь к пользователю внутри портала БХ24
                )
                this.inputComment.innerHTML = "";                                   // очистка поля ввода
                this.cell.classList.add("is-comments");                             // добавление маркера ячейки - есть комментарии
            }
        })
        // клик по кнопке подтверждения комментария
        this.containerComments.addEventListener("dblclick", async (event) => {
            let btnVerified = event.target.classList.contains("comment-verified-i");    // обозначение верификации
            if (this.commentator.ALLOWED_VERIFICATION_MSG && btnVerified) {
                let elemVerified =  event.target.closest(".comment-verified");
                let statusVerified =  elemVerified.classList.contains("comment-verified-true");
                let comment =  event.target.closest(".comment");
                let commentId = comment.dataset.id;
                let date = new Date();
                let data = {
                    verified: !statusVerified,
                    verified_by_user: this.commentator.ID,
                    date_verified: date
                }
                let result = await this.requests.PUT(`comment/${commentId}`, data);                 // обновление комментария на сервере
                if (!result.error) {
                    elemVerified.classList.toggle("comment-verified-true");
                    // btnVerified.setAttribute("title", `${this.commentator.LAST_NAME}` `${this.commentator.NAME}`);
                    // btnVerified.dataset.tooltip = `${this.commentator.LAST_NAME}` `${this.commentator.NAME}`;
                    // .dataset.tooltip
                    // if (statusVerified) {
                    //     btnVerified = `q`;
                    // } else {
                    //     btnVerified = `${this.commentator.LAST_NAME}` `${this.commentator.NAME}`
                    // }
                }
            }
        })
        // клик по ссылке внутри комментария
        this.containerComments.addEventListener("click", async (event) => {
            let isHref = event.target.classList.contains("path-href");
            if (isHref) {
                let path = event.target.dataset.href;
                this.openPath(path);
            }
        })
        // клик по ссылке внутри блока с информацией о звонке
        this.containerCalls.addEventListener("click", async (event) => {
            let isHref = event.target.classList.contains("path-href");
            if (isHref) {
                let path = event.target.getAttribute("href");
                this.openPath(path);
            }
        })
    }

    // открыть внутри портала Б24
    openPath(path) {
        BX24.openPath(
            path,
            (result) => console.log(result)
        );
    }

    // вывод данных комментариев и звонков
    async render(coordinates, recipient, dateStart, dateEnd, duration, cell) {
        this.recipient = recipient;                                             // id - получатель комментария
        this.dateStart = dateStart;                                             // дата - начало периода
        this.dateEnd = dateEnd;                                                 // дата - конец периода
        this.duration = duration;                                               // секунд - длительность звонка 
        this.cell = cell;                                                       // td - ячейка по которой произошло открытие окна
        
        // показать окно с информацией
        this.container.classList.remove("d-none");
        // изменение положения окна с информацией
        this.changePosition(coordinates);

        // вывод списка комментариев
        this.renderComments();
        // вывод списка звонков
        this.renderCalls();
    }

    // получение и вывод списка комментариев
    async renderComments() {
        let contentHTML = "";

        // скрытие блока списка комментариев
        this.containerComments.classList.add("d-none");
        // показ спиннера - ожидание загрузки данных
        this.containerSpinnerComment.classList.remove("d-none");

        // получение списка комментариев
        let comments = await this.getComments(this.recipient, this.dateStart, this.dateEnd);
        
        // формирование HTML-кода для контейнера списка комментариев
        for (let comment of comments) {
            // дата добавления комментария
            let date_comment_add = new Date(comment.date_comment_add);
            // HTML-код комментария
            contentHTML += templateCommentsItem(
                comment.id,
                `${comment.commentator_lastname} ${comment.commentator_name}`,              // Фамилия + Имя
                comment.comment,                                                            // Комментарий
                date_comment_add.toLocaleString(),                                          // Дата
                `${USER_PATH}${comment.commentator}/`,                                      // Путь к пользователю
                comment.verified,                                                           // Подтверждение
                `${comment.verified_lastname} ${comment.verified_name}`,                    // Фамилия + Имя ПОДТВЕРЖДАЮЩЕГО
                new Date(comment.date_verified).toLocaleString(),                           // Дата ПОДТВЕРЖДЕНИЯ
            )
        }
        this.containerComments.innerHTML = contentHTML;

        // показ блока списка комментариев
        this.containerComments.classList.remove("d-none");
        // скрытие спиннера - ожидание загрузки данных
        this.containerSpinnerComment.classList.add("d-none");
    }

    // запрос списка комментариев от сервера
    async getComments(recipient, dateStart, dataEnd) {
        let params = {
            recipient: recipient,
            date_comment_after: dateStart,
            date_comment_before: dataEnd
        }
        let response = await this.requests.GET("comment", params);
        if (!response.error) {
            return response.result.results;
        }
        
    }

    // добавление новго комментария
    addComment(userId, user, comment, date, hrefUser) {
        let contentHTML = templateCommentsItem(userId, user, comment, date, hrefUser);
        this.containerComments.insertAdjacentHTML('beforeend', contentHTML);
    }

    // изменение положения окна
    changePosition(coordinates) {
        let top = coordinates.y;
        let left = coordinates.x;
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;
        let documentHeight = document.documentElement.clientHeight;
        let documentWidth = document.documentElement.clientWidth;

        if (left + width > documentWidth) {
            this.container.style.left = `${left - width}px`;
        } else {
            this.container.style.left = `${left}px`;
        }

        if (top + height > documentHeight) {
            this.container.style.bottom = `${top - height}px`;
        } else {
            this.container.style.top = `${top}px`;
        }
    }   
    

    // вывод списка звонков
    async renderCalls() {
        let contentHTML = "";
        // скрытие блока списка звонков
        this.containerCalls.classList.add("d-none");
        // показ спиннера - ожидание загрузки данных
        this.containerSpinnerCalls.classList.remove("d-none");
        // сброс значения значка "количество звонков"
        this.badgeCountCalls.innerHTML = "";

        // получение списка звонков
        let calls = await this.getCalls(this.recipient, this.dateStart, this.dateEnd, this.duration);
        let callsSort = calls.sort(this.sortFunc);
        // формирование HTML-кода для контейнера списка звонков
        for (let call of callsSort) {
            // дата совершения звонка
            let date = new Date(call.phone[0].CALL_START_DATE);
            // ссылка на сущность к которой привязан звонок
            let hrefOwner = `${OWNER_TYPE_URL[call.OWNER_TYPE_ID]}${call.OWNER_ID}/`;
            // ссылка на компанию к которой привязан звонок
            let hrefCompany = `${OWNER_TYPE_URL["4"]}${call.COMPANY_ID}/`;
            // HTML-код звонка
            contentHTML += templateCallsItem(
                OWNER_TYPE[call.OWNER_TYPE_ID],                     // тип связанной сущности
                call.OWNER_NAME,                                    // название связанной сущности
                hrefOwner,                                          // path - к сущности источника
                hrefCompany,                                        // path - связанно компании
                call.phone[0].PHONE_NUMBER,                         // номер телефона
                call.phone[0].CALL_DURATION,                        // длительность разговора
                date.toLocaleString()                               // дата начала разговора
            )
        }
        this.badgeCountCalls.innerHTML = ` (${callsSort.length})`;
        this.containerCalls.innerHTML = contentHTML;

        // показ блока списка звонков
        this.containerCalls.classList.remove("d-none");
        // скрытие спиннера - ожидание загрузки данных
        this.containerSpinnerCalls.classList.add("d-none");
    }

    // запрос списка комментариев от сервера
    async getCalls(recipient, dateStart, dataEnd, duration) {
        let params = {
            RESPONSIBLE_ID: recipient,
            //            CREATED_after: dateStart,
            //            CREATED_before: dataEnd,
            CALL_START_DATE_after: dateStart,
            CALL_START_DATE_before: dataEnd,
            CALL_DURATION: duration
        }

        let response = await this.requests.GET_LONG("calls", params);
        if (!response.error) {
            return response.result;
        }
    }
    
    sortFunc(obj1, obj2) {
        let dateOne = new Date(obj1.CALL_START_DATE);
        let dateTwo = new Date(obj2.CALL_START_DATE);
        return dateOne - dateTwo;
    }
}




