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
        this.containerSpinnerComment = this.container.querySelector(".comment-list-spinner");   // контейнер - "Список звонков"
        
        this.inputComment = this.container.querySelector(".comment-send-input");                // поле - "ввод комментария"

        // Данные комментатора - неизменные
        this.commentator = {
            ID: null,
            LAST_NAME: null,
            NAME: null,
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
            if (btnVerified) {
                console.log("Верификация сообщения");
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
                console.log(path);
                this.openPath(path);
            }
        })

        // клик по ссылке внутри блока с информацией о звонке
        this.containerCalls.addEventListener("click", async (event) => {
            let isHref = event.target.classList.contains("path-href");
            if (isHref) {
                let path = event.target.getAttribute("href");
                console.log(path);
                this.openPath(path);
            }
        })

    }

    // открыть внутир портала Б24
    openPath(path) {
        BX24.openPath(
            path,
            (result) => console.log(result)
        );
    }

    // вывод данных комментариев и звонков
    async render(coordinates, recipient, dateStart, dateEnd, calls, cell) {
        this.recipient = recipient;                                             // получатель комментария - id
        this.dateStart = dateStart;                                             // дата комментария - начало периода
        this.dateEnd = dateEnd;                                                 // дата комментария - конец периода
        this.cell = cell;                                                       // ячейка по которой произошло открытие окна
        
        // СКРЫТИЕ/ПОКАЗ БЛОКОВ
        this.containerComments.classList.add("d-none");                         // скрытие списка комментариев
        this.containerSpinnerComment.classList.remove("d-none");                // показ спиннера - ожидание загрузки данных

        // положение и видимость окна
        this.container.classList.remove("d-none");                              // показать окно
        this.changePosition(coordinates);                                       // изменение положения окна

        // комментарии
        // let comments = COMMENTS;
        let comments = await this.getComments(recipient, dateStart, dateEnd);   // список комментариев
        this.renderComments(comments);                                          // вывод списка комментариев
        
        // СКРЫТИЕ/ПОКАЗ БЛОКОВ
        this.containerComments.classList.remove("d-none");                      // показ списка комментариев
        this.containerSpinnerComment.classList.add("d-none");                   // скрытие спиннера - ожидание загрузки данных
        
        this.renderCalls(calls);                                                // вывод спсика звонков
    }

    // запрос списка комментариевс сервера
    async getComments(recipient, dateStart, dataEnd) {
        let params = {
            recipient: recipient,
            date_comment_after: dateStart,
            date_comment_before: dataEnd
        }
        let result = await this.requests.GET("comment", params);
        if (!result.error) {
            return result.result;
        }
        
    }

    // изменение положения окна
    changePosition(coordinates) {
        let top = coordinates.y;
        let left = coordinates.x;
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;
        let documentHeight = document.documentElement.clientHeight;
        let documentWidth = document.documentElement.clientWidth;
        // let documentWidth = document.querySelector("body").offsetWidth;

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

    // вывод списка комментариев
    renderComments(comments) {
        let contentHTML = "";
        for (let comment of comments) {
            let date_comment_add = new Date(comment.date_comment_add);
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
    }
    
    // добавление новго комментария
    addComment(user, comment, date, hrefUser) {
        let contentHTML = templateCommentsItem(user, comment, date, hrefUser);
        this.containerComments.insertAdjacentHTML('beforeend', contentHTML);
    }

    // вывод списка звонков
    renderCalls(calls) {
        let contentHTML = "";
        for (let call of calls) {
            let date = new Date(call.CREATED);
            let hrefOwner = `${OWNER_TYPE_URL[call.OWNER_TYPE_ID]}${call.OWNER_ID}/`;
            let hrefCompany = `${OWNER_TYPE_URL["4"]}${call.COMPANY_ID}/`;
            contentHTML += templateCallsItem(
                OWNER_TYPE[call.OWNER_TYPE_ID],                     // тип связанной сущности
                call.OWNER_NAME,                                    // название связанной сущности
                hrefOwner,                                          // path - к сущности источника
                hrefCompany,                                        // path - связанно компании
                call.PHONE_NUMBER,                                  // номер телефона
                call.DURATION,                                      // длительность разговора
                date.toLocaleString()                               // дата начала разговора
            )
        }
        
        this.containerCalls.innerHTML = contentHTML;
    }
}





const COMMENTS =[
    {
        "id": 17,
        "commentator_name": "Тест",
        "commentator_lastname": "Тестов",
        "date_comment": "2022-03-20",
        "date_comment_add": "2022-03-26T05:36:01.212000Z",
        "comment": "ыфы<div><br></div>",
        "recipient": 108,
        "commentator": 2479
    },
    {
        "id": 17,
        "commentator_name": "Тест",
        "commentator_lastname": "Тестов",
        "date_comment": "2022-03-20",
        "date_comment_add": "2022-03-26T05:36:01.212000Z",
        "comment": "ыфы<div><br></div>",
        "recipient": 108,
        "commentator": 2479
    },
    {
        "id": 17,
        "commentator_name": "Тест",
        "commentator_lastname": "Тестов",
        "date_comment": "2022-03-20",
        "date_comment_add": "2022-03-26T05:36:01.212000Z",
        "comment": "ыфы<div><br></div>",
        "recipient": 108,
        "commentator": 2479
    }
]
// let container = document.querySelector("#windowInfoData");
// let app = new WindowInfo(container);
// console.log(1)
// app.init();
let calls = [
    {
        ID: 2745871,
        COMPANY_ID: 494,
        OWNER_TYPE_ID: 1,
        OWNER_ID: 1212,
        OWNER_NAME: "Лид22",
        DURATION: 55,
        PHONE_NUMBER: "12345678",
        CREATED: "2022-03-16T07:42:14Z",
        FILES: "https://cdndl.zaycev.net/track/24859497/6pf9GZRxAVX26UhxAmdBVoQm4Yyfwzr2RuvnggbJ3xgKHtENWtk1VeXy2xfA44QKcdwa8dupbY3JzoCJ9VQqb36RKa7girfAYtxATQdobmqvrdCEeaCPuL8sCXssfhb2E91eDmQqgmkLv8yrrgMBWd3V4fY89H5tg1edQ2W6YcFiw4cP13rDpQd8yQHNyCLV4e2JNsZp3C1m6dM8pJAw78MLAoCYQsUTGn8et9SXqovm7nd6mUPtb5W8HmgSMed7v92ykHRN9z2tvaaNKUJgztWi26YaZfAMViXt61qKpYwb9hpyiWfsdCye3RcpMmw88NcLqxbDL2dEEgWyFj4pAyNiTVKQ1N"
    },
    {
        ID: 2745871,
        COMPANY_ID: 494,
        OWNER_TYPE_ID: 2,
        OWNER_ID: 1212,
        OWNER_NAME: "Сделка22",
        DURATION: 55,
        PHONE_NUMBER: "12345678",
        CREATED: "2022-03-16T07:42:14Z",
        FILES: "https://atonlab.bitrix24.ru/bitrix/tools/crm_show_file.php?fileId=3823283&ownerTypeId=6&ownerId=2745871&auth=88a131620059c52a00249ec6000009af4038031ec3b1b66a1087cc0e1f3d9818b113f7"
    },
    {
        ID: 2745871,
        COMPANY_ID: 494,
        OWNER_TYPE_ID: 3,
        OWNER_ID: 1212,
        OWNER_NAME: "Контакт22",
        DURATION: 55,
        PHONE_NUMBER: "12345678",
        CREATED: "2022-03-16T07:42:14Z",
        FILES: "https://atonlab.bitrix24.ru/bitrix/tools/crm_show_file.php?fileId=3823283&ownerTypeId=6&ownerId=2745871&auth=88a131620059c52a00249ec6000009af4038031ec3b1b66a1087cc0e1f3d9818b113f7"
    },
    {
        ID: 2745871,
        COMPANY_ID: 494,
        OWNER_TYPE_ID: 4,
        OWNER_ID: 1212,
        OWNER_NAME: "Компания22",
        DURATION: 55,
        PHONE_NUMBER: "12345678",
        CREATED: "2022-03-16T07:42:14Z",
        FILES: "https://atonlab.bitrix24.ru/bitrix/tools/crm_show_file.php?fileId=3823283&ownerTypeId=6&ownerId=2745871&auth=88a131620059c52a00249ec6000009af4038031ec3b1b66a1087cc0e1f3d9818b113f7"
    },
]


// app.render("", "", "", calls);



/* <div class="calls-play">
                        <audio controls>
                            <source src="${call.FILES}" type="audio/ogg">
                            <source src="${call.FILES}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                        
                    </div> */



                //     contentHTML += `
                //     <div class="calls-item">
                //         <div class="company" data-url"${urlOwner}">
                //             <span>${OWNER_TYPE[call.OWNER_TYPE_ID]}</span> ${call.OWNER_NAME}
                //         </div>
                //         <div class="related-entity" data-url"${urlCompany}">
                //             <span>URL компании:</span> ${urlCompany}
                //         </div>
                //         <div class="related-entity" data-url"${urlCompany}">
                //             <span>Длительность:</span> ${call.DURATION}
                //         </div>
                //         <div class="meta-data">
                //             <div class="meta-data-phone">
                //                 <span>Телефон: </span> ${call.PHONE_NUMBER}
                //             </div>
                //             <div class="meta-data-date">
                //                 <span>Дата: </span> ${date.toLocaleString()}
                //             </div>
                //         </div>
                //         <div class="related-entity">
                //             <span>Дата: </span> ${date.toLocaleString()}
                //         </div>
                //     </div>
                // `;