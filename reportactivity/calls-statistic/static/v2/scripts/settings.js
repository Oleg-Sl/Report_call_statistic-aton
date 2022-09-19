import BX from './bitrix24.js';
import {templateUsersAllowedUserTR, templateUsersAllowedDepartItem, } from './templates/settings.js'

const DEPART = JSON.parse('[{"ID":"1","NAME":"ГК АТОН","SORT":500,"UF_HEAD":"901","CHILDREN":[{"ID":"46","NAME":"Бухгалтерия","SORT":200,"PARENT":"1","UF_HEAD":"4327"},{"ID":"18","NAME":"Коммерческий отдел","SORT":300,"PARENT":"1","UF_HEAD":"30","CHILDREN":[{"ID":"167","NAME":"Тендерный отдел","SORT":50,"PARENT":"18","UF_HEAD":"1623"},{"ID":"107","NAME":"ОМСК","SORT":100,"PARENT":"18","UF_HEAD":"1047","CHILDREN":[{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"}]},{"ID":"241","NAME":"Отдел продаж (Барнаул)","SORT":200,"PARENT":"18","UF_HEAD":"1155"},{"ID":"331","NAME":"Отдел продаж (Новосибирск)","SORT":400,"PARENT":"18","CHILDREN":[{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"}]},{"ID":"217","NAME":"Отдел Маркетинга","SORT":600,"PARENT":"18","UF_HEAD":"859"}]},{"ID":"38","NAME":"Технический отдел","SORT":400,"PARENT":"1","UF_HEAD":"34","CHILDREN":[{"ID":"68","NAME":"Доступная Среда","SORT":200,"PARENT":"38","UF_HEAD":"122"},{"ID":"58","NAME":"Испытательная лаборатория","SORT":300,"PARENT":"38","UF_HEAD":"150"},{"ID":"60","NAME":"Отдел СОУТ","SORT":350,"PARENT":"38","UF_HEAD":"116","CHILDREN":[{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"}]},{"ID":"129","NAME":"Орган Инспекции","SORT":400,"PARENT":"38","UF_HEAD":"785"},{"ID":"66","NAME":"МОЗ","SORT":500,"PARENT":"38","UF_HEAD":"146"},{"ID":"269","NAME":"Отдел аудита и аутсорсинга по ОТ","SORT":500,"PARENT":"38","UF_HEAD":"124","CHILDREN":[{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"}]},{"ID":"249","NAME":"Пожарная безопасность","SORT":500,"PARENT":"38","UF_HEAD":"2273","CHILDREN":[{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"}]},{"ID":"357","NAME":"Энергоаудит","SORT":500,"PARENT":"38"},{"ID":"64","NAME":"Экология","SORT":700,"PARENT":"38","UF_HEAD":"164","CHILDREN":[{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"}]},{"ID":"56","NAME":"ЭМИЛ","SORT":800,"PARENT":"38","UF_HEAD":"142"}]},{"ID":"157","NAME":"Руководитель учебного центра центра","SORT":450,"PARENT":"1","UF_HEAD":"32","CHILDREN":[{"ID":"113","NAME":"Учебный отдел(Омск)","SORT":500,"PARENT":"157"}]},{"ID":"34","NAME":"Отдел кадров","SORT":475,"PARENT":"1","UF_HEAD":"140"},{"ID":"355","NAME":"Томск УЦ","SORT":500,"PARENT":"1","UF_HEAD":"3679"},{"ID":"165","NAME":"Юрист","SORT":500,"PARENT":"1"},{"ID":"36","NAME":"Системный администратор","SORT":700,"PARENT":"1","UF_HEAD":"14"},{"ID":"80","NAME":"Техническая поддержка Битрикс24","SORT":850,"PARENT":"1","UF_HEAD":"0","CHILDREN":[{"ID":"311","NAME":"Тест","SORT":500,"PARENT":"80"}]}]},{"ID":"46","NAME":"Бухгалтерия","SORT":200,"PARENT":"1","UF_HEAD":"4327"},{"ID":"18","NAME":"Коммерческий отдел","SORT":300,"PARENT":"1","UF_HEAD":"30","CHILDREN":[{"ID":"167","NAME":"Тендерный отдел","SORT":50,"PARENT":"18","UF_HEAD":"1623"},{"ID":"107","NAME":"ОМСК","SORT":100,"PARENT":"18","UF_HEAD":"1047","CHILDREN":[{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"}]},{"ID":"241","NAME":"Отдел продаж (Барнаул)","SORT":200,"PARENT":"18","UF_HEAD":"1155"},{"ID":"331","NAME":"Отдел продаж (Новосибирск)","SORT":400,"PARENT":"18","CHILDREN":[{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"}]},{"ID":"217","NAME":"Отдел Маркетинга","SORT":600,"PARENT":"18","UF_HEAD":"859"}]},{"ID":"167","NAME":"Тендерный отдел","SORT":50,"PARENT":"18","UF_HEAD":"1623"},{"ID":"107","NAME":"ОМСК","SORT":100,"PARENT":"18","UF_HEAD":"1047","CHILDREN":[{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"}]},{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"},{"ID":"241","NAME":"Отдел продаж (Барнаул)","SORT":200,"PARENT":"18","UF_HEAD":"1155"},{"ID":"331","NAME":"Отдел продаж (Новосибирск)","SORT":400,"PARENT":"18","CHILDREN":[{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"}]},{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"},{"ID":"217","NAME":"Отдел Маркетинга","SORT":600,"PARENT":"18","UF_HEAD":"859"},{"ID":"38","NAME":"Технический отдел","SORT":400,"PARENT":"1","UF_HEAD":"34","CHILDREN":[{"ID":"68","NAME":"Доступная Среда","SORT":200,"PARENT":"38","UF_HEAD":"122"},{"ID":"58","NAME":"Испытательная лаборатория","SORT":300,"PARENT":"38","UF_HEAD":"150"},{"ID":"60","NAME":"Отдел СОУТ","SORT":350,"PARENT":"38","UF_HEAD":"116","CHILDREN":[{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"}]},{"ID":"129","NAME":"Орган Инспекции","SORT":400,"PARENT":"38","UF_HEAD":"785"},{"ID":"66","NAME":"МОЗ","SORT":500,"PARENT":"38","UF_HEAD":"146"},{"ID":"269","NAME":"Отдел аудита и аутсорсинга по ОТ","SORT":500,"PARENT":"38","UF_HEAD":"124","CHILDREN":[{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"}]},{"ID":"249","NAME":"Пожарная безопасность","SORT":500,"PARENT":"38","UF_HEAD":"2273","CHILDREN":[{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"}]},{"ID":"357","NAME":"Энергоаудит","SORT":500,"PARENT":"38"},{"ID":"64","NAME":"Экология","SORT":700,"PARENT":"38","UF_HEAD":"164","CHILDREN":[{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"}]},{"ID":"56","NAME":"ЭМИЛ","SORT":800,"PARENT":"38","UF_HEAD":"142"}]},{"ID":"68","NAME":"Доступная Среда","SORT":200,"PARENT":"38","UF_HEAD":"122"},{"ID":"58","NAME":"Испытательная лаборатория","SORT":300,"PARENT":"38","UF_HEAD":"150"},{"ID":"60","NAME":"Отдел СОУТ","SORT":350,"PARENT":"38","UF_HEAD":"116","CHILDREN":[{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"}]},{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"129","NAME":"Орган Инспекции","SORT":400,"PARENT":"38","UF_HEAD":"785"},{"ID":"66","NAME":"МОЗ","SORT":500,"PARENT":"38","UF_HEAD":"146"},{"ID":"269","NAME":"Отдел аудита и аутсорсинга по ОТ","SORT":500,"PARENT":"38","UF_HEAD":"124","CHILDREN":[{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"}]},{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"249","NAME":"Пожарная безопасность","SORT":500,"PARENT":"38","UF_HEAD":"2273","CHILDREN":[{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"}]},{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"},{"ID":"357","NAME":"Энергоаудит","SORT":500,"PARENT":"38"},{"ID":"64","NAME":"Экология","SORT":700,"PARENT":"38","UF_HEAD":"164","CHILDREN":[{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"}]},{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"},{"ID":"56","NAME":"ЭМИЛ","SORT":800,"PARENT":"38","UF_HEAD":"142"},{"ID":"157","NAME":"Руководитель учебного центра центра","SORT":450,"PARENT":"1","UF_HEAD":"32","CHILDREN":[{"ID":"113","NAME":"Учебный отдел(Омск)","SORT":500,"PARENT":"157"}]},{"ID":"113","NAME":"Учебный отдел(Омск)","SORT":500,"PARENT":"157"},{"ID":"34","NAME":"Отдел кадров","SORT":475,"PARENT":"1","UF_HEAD":"140"},{"ID":"355","NAME":"Томск УЦ","SORT":500,"PARENT":"1","UF_HEAD":"3679"},{"ID":"165","NAME":"Юрист","SORT":500,"PARENT":"1"},{"ID":"36","NAME":"Системный администратор","SORT":700,"PARENT":"1","UF_HEAD":"14"},{"ID":"80","NAME":"Техническая поддержка Битрикс24","SORT":850,"PARENT":"1","UF_HEAD":"0","CHILDREN":[{"ID":"311","NAME":"Тест","SORT":500,"PARENT":"80"}]},{"ID":"311","NAME":"Тест","SORT":500,"PARENT":"80"}]');


export default class SettingsApp {
    constructor(container, requests, bx) {
        this.container = container;                                 // HTML контейнер модального окна настроек приложения
        this.requests = requests;                                   // объект для выполнения запросов к серверу
        this.bx = bx;                                               // объект для выполнения запросов к Битрикс через JS библиотеку

        this.myModal = new bootstrap.Modal(this.container, {});     // объект bootstrap модального окна с настройками

        // КОНТЕЙНЕРЫ
        this.containerDepart = this.container.querySelector(".modal-settings-app-depart-content");                  // контейнер - дерево подразделений
        this.containerUserdepart = this.container.querySelector(".modal-settings-app-usersdepart-content");         // контейнер - пользователb по подразделениям
        this.containerUserallowed = this.container.querySelector(".modal-settings-app-usersallowed-content");       // контейнер - права доступа пользователей
        
        // ПОЛЯ ВВОДА
        this.inputDuration = this.container.querySelector(".modal-settings-app-calls-duration-content input");      // поле ввода - минимальная длительности звонков
        this.inputDeadline = this.container.querySelector(".modal-settings-app-calls-deadline-content input");      // поле ввода - количество дней с начала месяца, для доступа к редакт.
        this.inputPeriod = this.container.querySelector(".modal-settings-app-calls-periodupdate-content input");    // поле ввода - период обновления статистики в минутах
        
        // КНОПКИ
        this.btnCancel = this.container.querySelector(".modal-settings-app-button-cancel");                         // кнопка - "Закрыть" окно настроек приложения
        this.btnSave = this.container.querySelector(".modal-settings-app-button-save");                             // кнопка - "Сохранить" настройки приложения

        // КЛЮЧИ для получения данных из хранилища приложения в Битрик
        this.keyStorage = {
            department: "department",       // ключ - список выбранных подразделений
            duration: "duration",           // ключ - установленная минимальная длительность звонка
            deadline: "deadline",           // ключ - количество дней с начала месяца, для доступа к редактированию таблицы
            period: "period",               // ключ - установленное количество минут обновления данных статистики на странице (запросы новых данных с сервера)
        }

        // ДАННЫЕ ИЗ ХРАНИЛИЩА
        this.saveDepartment = null;                 // список id департаментов сохраненных в хранилище
        this.saveDuration = null;                   // минимальная длительность звонков сохраненных в хранилище
        this.saveDeadline = null;                   // количество дней с начала месяца, в течении которых можно редактировать план звонков
        this.savePeriod = null;                     // период в минутах обновления данных статиситики сохраненный в хранилище

        // ДАННЫЕ 
        this.departments = null;                    // список подразделений компании
        this.companyStructure = null;               // иерархическая структура компании

    }

    async init() {
        await this.getStorageSettings();            // получение сохраненных настроек приложения из хранилища Битрикс
        await this.getAllDepartments();             // получение списка всех подразделений компании и формирование иерархичечкой структуры

        this.renderCompanyStructure();              // вывод списка подразделений компании в окне настроек
        this.setCheckedInputChoice();               // установка галочек на сохраненных подразделениях
        this.setDurationInput();                    // установка сохраненной длительности звонка
        this.setDeadlineInput();                    // установка сохраненного количества дней 
        this.setPeriodInput();                      // установка сохраненного периода обновления данных

        this.renderDepartUsersAllowed();            // окно "права доступа" - вывод списка подразделений
        this.renderUsersByAllDepartment();          // окно "выбранные пользователи подразделений" - вывод списка подразделений
       
        this.initHandler();                         // инициализация обработчиков событий
    }

    initHandler() {
        // событие кнопки "Сохранить" настройки приложения
        this.btnSave.addEventListener("click", (event) => {
            this.saveDepartment = this.getListChoiceDepartments();                              // получение списка выбранных подразделений
            this.saveDuration = this.inputDuration.value;                                       // получение введенной длительности звонка
            this.saveDeadline = this.inputDeadline.value;                                       // получение введенного количества дней
            this.savePeriod = this.inputPeriod.value;                                           // получение введенного периода обновления
            BX24.appOption.set(this.keyStorage.department, this.saveDepartment.join(","));      // сохранение списка подразделений в настройках приложения
            BX24.appOption.set(this.keyStorage.duration, this.saveDuration);                    // сохранение длительности звонка в настройках приложения
            BX24.appOption.set(this.keyStorage.deadline, this.saveDeadline);                    // сохранение количества дней в настройках приложения
            BX24.appOption.set(this.keyStorage.period, this.savePeriod);                        // сохранение периода обновления в настройках приложения
            this.myModal.hide();                                                                // скрыть модальное окно с настройками праложения
        })

        // окно "выбранные подразделения" - событие "checked" по подразделению
        this.containerDepart.addEventListener("change", async (event) => {
            if (event.target.checked) {
                this.renderUsersDepartment({
                    ID: event.target.value,
                    NAME: event.target.dataset.department,
                });
            } else {
                this.containerUserdepart.querySelectorAll(".modal-settings-app-usersdepart-item").forEach((element) => {
                    let departId = element.dataset.depart_id;
                    if (event.target.value == departId) {
                        element.remove();
                        return;
                    }
                })
            }
        })

        // окно "выбранные пользователи подразделений" - событие "checked" по пользователю подразделения
        this.containerUserdepart.addEventListener("change", async (event) => {
            if (event.target.checked) {
                await this.requests.PUT("users/" + event.target.value, {"STATUS_DISPLAY": true});
            } else {
                await this.requests.PUT("users/" + event.target.value, {"STATUS_DISPLAY": false});
            }
        })

        // событие - открытие модального окна
        this.container.addEventListener("show.bs.modal", async () => {
            await this.getStorageSettings();            // получение списка сохраненных настроек приложения
            this.setCheckedInputChoice();               // установка галочек на сохраненных подразделениях
            this.setDurationInput();                    // установка сохраненного значения длительности звонка
        })

        // окно "права доступа" -  событиее "клик" по подразделению
        this.containerUserallowed.addEventListener("click", async (event) => {
            // если клик произошел не по подразделению
            if (!event.target.classList.contains("modal-settings-app-usersallowed-depart")) {
                return;
            }
            
            let status = event.target.dataset.status;
            // если список пользователей уже выведен
            if (status) {
                return;
            }

            let depart = event.target.dataset.depart;
            // отсутствует идентификатор подразделения
            if (!depart) {
                return;
            }

            let users = await this.requests.GET("users", {"UF_DEPARTMENT": depart});            // список пользователей подразделения
            
            let itemDepart = event.target.closest(".modal-settings-app-usersallowed-item");     // родительский блок
            let container = itemDepart.querySelector("tbody");                                  // блок для вставки списка пользователей
            this.renderUsersAllowed(container, users.result);                                   // вывод списка пользователей подразделения
            event.target.dataset.status = "true";                                               // установка атрибута, что рользователи подразделения уже выведены
        })

        // окно "права доступа" -  событие изменения прав пользователя
        this.containerUserallowed.addEventListener("change", async (event) => {
            let trElemUser = event.target.closest("tr");                                        // родительский блок
            let userId = trElemUser.dataset.userid;
            // если изменение право доступа к редатированию таблицы
            if (userId && event.target.classList.contains("selectedit")) {
                let value = event.target.value;
                await this.requests.PUT("users/" + userId, {"ALLOWED_EDIT": value});
            }
            // если измернилось право доступа к настройкам
            if (userId && event.target.classList.contains("selectsettings")) {
                let value = Boolean(+event.target.value);
                await this.requests.PUT("users/" + userId, {"ALLOWED_SETTING": value});
            }
        })
    }

    
    // получение сохраненных настроек приложения из хранилища Битрикс
    async getStorageSettings() {
        let storageDepartment = await BX24.appOption.get(this.keyStorage.department);
        let storageDuration = await BX24.appOption.get(this.keyStorage.duration);
        let storageDeadline = await BX24.appOption.get(this.keyStorage.deadline);
        let storagePeriod = await BX24.appOption.get(this.keyStorage.period);
        
        if (storageDepartment) {
            this.saveDepartment = storageDepartment.split(",");
        }
        if (storageDuration) {
            this.saveDuration = storageDuration;
        }
        if (storageDeadline) {
            this.saveDeadline = storageDeadline;
        }
        if (storagePeriod) {
            this.savePeriod = storagePeriod;
        }
    }

    // получение списка всех подразделений из Битрикс
    async getAllDepartments() {
        this.departments = await this.bx.callMethod("department.get");          // список всех аподраздеоений
        this.companyStructure = this.getTreeDepartments();                      // создание иерархии подразделений (структура компаний)
    }

    // возвращает иерархическую структуру компании
    getTreeDepartments(parent=undefined) {
        let departmentsList = [];                                               // список департаментов с родительским подразделений = "parent"
        for (let department of this.departments) {
            if (department.PARENT === parent) {
                let children = this.getTreeDepartments(department.ID);          // список дочерних подразделений
                if (children.length !== 0) {
                    department.CHILDREN = children;
                }
                departmentsList.push(department);
            }
        }
        return departmentsList;
    }


    // <<<<<===== ПОДРАЗДЕЛЕНИЯ =====>>>>>
    // возвращает список ID выбранных подразделений
    getListChoiceDepartments() {
        let departmentList = [];
        let departCheckList = this.containerDepart.getElementsByTagName("INPUT");
        for (let departCheck of departCheckList) {
            if (departCheck.checked) {
                departmentList.push(departCheck.value);
            }
        }
        return departmentList;
    }

    // установка галочек в выбранных подразделениях
    setCheckedInputChoice() {
        if (!this.saveDepartment) {
            return;
        }
        let departCheckList = this.containerDepart.getElementsByTagName("INPUT");
        for (let departCheck of departCheckList) {
            if (this.saveDepartment.includes(departCheck.value)) {
                departCheck.checked = true;
            } else {
                departCheck.checked = false;
            }
        }
    }


    // <<<<<===== ДЛИТЕЛЬНОСТЬ ЗВОНКОВ =====>>>>>
    // установка длительности звонка
    setDurationInput() {
        if (this.saveDuration) {
            this.inputDuration.value = this.saveDuration;
        }     
    }
    

    // <<<<<===== КОЛИЧЕСТВО ДНЕЙ С НАЧАЛА МЕСЯЦА =====>>>>>
    // установка количества дней
    setDeadlineInput() {
        if (this.saveDeadline) {
            this.inputDeadline.value = this.saveDeadline;
        }
    }

    // <<<<<===== ПЕРИОД ОБНОВЛЕНИЯ ДАННЫХ =====>>>>>
    // установка периода обновления данных
    setPeriodInput() {
        if (this.savePeriod) {
            this.inputPeriod.value = this.savePeriod;
        }
    }


    // <<<<<===== RENDER =====>>>>>
    // окно "выбранные подразделения" - возвращает HTML код дочерних подразделений
    getHtmlContentDepartmentLi(departments) {
        let contentHTML = '';
        for (let department of departments) {
            let nestedContentHTML = "";
            if (Array.isArray(department.CHILDREN) && department.CHILDREN.length >= 1) {
                nestedContentHTML += this.getHtmlContentDepartmentUl(department.CHILDREN);
            }
            contentHTML += `
                <li class="list-group-item">
                    <input class="form-check-input me-1" type="checkbox" data-department="${department.NAME}" value='${department.ID}' aria-label="...">${department.NAME}
                    ${nestedContentHTML}
                </li>
            `;
        }
        return contentHTML;
    }
    
    // окно "выбранные подразделения" - возвращает HTML код списка подразделений
    getHtmlContentDepartmentUl(departments) {
        let contentHTML = '';
        contentHTML += `
            <ul class="list-group">
                ${this.getHtmlContentDepartmentLi(departments)}
            </ul>
        `;
        return contentHTML;
    }
    
    // окно "выбранные подразделения" - вывод иерархического списка подразделений
    renderCompanyStructure() {
        const contentHTML = this.getHtmlContentDepartmentUl(this.companyStructure);
        this.containerDepart.insertAdjacentHTML('beforeend', contentHTML);
    }

    // окно "выбранные пользователи подразделений" - возвращает HTML код списка пользователей
    renderUsers(users) {
        let contentHTML = "";
        for (let user of users) {
            let checked = "";
            if (user.STATUS_DISPLAY) {
                // если пользователь участвует в выводе статистики
                checked = "checked";
            }
            contentHTML += `
                <li class="list-group-item">
                    <input class="form-check-input me-1" type="checkbox" value='${user.ID}' aria-label="..." ${checked}>
                    ${user.LAST_NAME} ${user.NAME}
                </li>
            `;
        }
        return contentHTML;
    }

    // окно "выбранные пользователи подразделений" - вывод пользователей подразделения
    async renderUsersDepartment(department) {
        let contentHTML = "";
        let response = await this.requests.GET(`users`, {"UF_DEPARTMENT": department.ID});
        if (response.error) {
            return;
        }
        let users = response.result;
        contentHTML += `
            <div class="modal-settings-app-usersdepart-item" data-depart_id=${department.ID}>
                <div>
                    <a class="" data-bs-toggle="collapse" href="#collapseExample${department.ID}" role="button" aria-expanded="false" aria-controls="collapseExample${department.ID}">
                        ${department.NAME}
                    </a>
                </div>
                <div class="collapse" id="collapseExample${department.ID}">
                    <ul class="list-group">
                        ${this.renderUsers(users)}
                    </ul>
                </div>
            </div>
        `;
        
        this.containerUserdepart.insertAdjacentHTML('beforeend', contentHTML);
    }

    // окно "выбранные пользователи подразделений" - вывод списка подразделений
    renderUsersByAllDepartment() {
        this.containerUserdepart.innerHtml = "";
        for (let department of this.departments) {
            if (this.saveDepartment.includes(department.ID)) {
                this.renderUsersDepartment(department);
            }
        }
    }

    // окно "права доступа" - вывод списка пользователей подразделения
    renderUsersAllowed(container, users) {
        let contentHTML = "";
        for (let user of users) {
            contentHTML += templateUsersAllowedUserTR(user.ID, user.LAST_NAME, user.NAME, user.ALLOWED_EDIT, user.ALLOWED_SETTING);
        }
        container.innerHTML = contentHTML;
    }
    
    // окно "права доступа" - вывод списка подразделений
    renderDepartUsersAllowed() {
        let contentHTML = "";
        for (let depart of this.departments) {
            contentHTML += templateUsersAllowedDepartItem(depart.ID, depart.NAME);
        }
        this.containerUserallowed.innerHTML = contentHTML;
    }


    // <<<<<===== ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ НАСТРОЕК ИЗ ВНЕ =====>>>>>
    // возвращает список сохраненных подразделений
    async getSaveDepartment() {
        let departments = await BX24.appOption.get(this.keyStorage.department);  
        if (departments) {
            return departments.split(",");
        }
    }

    // возвращает сохраненную длительность звонка
    async getSaveDuration() {
        let duration = await BX24.appOption.get(this.keyStorage.duration);
        return duration;
    }
    
    // возвращает сохраненное количество дней
    async getSaveDeadline() {
        let deadline = await BX24.appOption.get(this.keyStorage.deadline);
        return deadline;
    }

    // возвращает сохраненный период обновления
    async getSavePeriod() {
        let period = await BX24.appOption.get(this.keyStorage.period);
        return period;
    }

    // возвращает id руководителя подразделения
    async getUserHeadDepart(departmentId) {
        let departObj = this.departments.find((department) => department.ID == departmentId);
        // если у подразделения есть руководитель
        if (departObj && departObj.UF_HEAD != 0) {
            return departObj.UF_HEAD;
        }
        // если у подразделения нет руководителя, поиск руководителя родительского подразделения
        if (departObj && departObj.PARENT) {
            return this.getUserHeadDepart(departObj.PARENT)
        }
    }

   
    
}


