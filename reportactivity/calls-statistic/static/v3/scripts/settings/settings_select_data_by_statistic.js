import {templateDepartUl, templateDepartLi, templateDepartEmploye, templateDepartEmployeUser, } from '../templates/template_settings_select_data_by_statistic.js';


const DEPART = JSON.parse('[{"ID":"1","NAME":"ГК АТОН","SORT":500,"UF_HEAD":"901","CHILDREN":[{"ID":"46","NAME":"Бухгалтерия","SORT":200,"PARENT":"1","UF_HEAD":"4327"},{"ID":"18","NAME":"Коммерческий отдел","SORT":300,"PARENT":"1","UF_HEAD":"30","CHILDREN":[{"ID":"167","NAME":"Тендерный отдел","SORT":50,"PARENT":"18","UF_HEAD":"1623"},{"ID":"107","NAME":"ОМСК","SORT":100,"PARENT":"18","UF_HEAD":"1047","CHILDREN":[{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"}]},{"ID":"241","NAME":"Отдел продаж (Барнаул)","SORT":200,"PARENT":"18","UF_HEAD":"1155"},{"ID":"331","NAME":"Отдел продаж (Новосибирск)","SORT":400,"PARENT":"18","CHILDREN":[{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"}]},{"ID":"217","NAME":"Отдел Маркетинга","SORT":600,"PARENT":"18","UF_HEAD":"859"}]},{"ID":"38","NAME":"Технический отдел","SORT":400,"PARENT":"1","UF_HEAD":"34","CHILDREN":[{"ID":"68","NAME":"Доступная Среда","SORT":200,"PARENT":"38","UF_HEAD":"122"},{"ID":"58","NAME":"Испытательная лаборатория","SORT":300,"PARENT":"38","UF_HEAD":"150"},{"ID":"60","NAME":"Отдел СОУТ","SORT":350,"PARENT":"38","UF_HEAD":"116","CHILDREN":[{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"}]},{"ID":"129","NAME":"Орган Инспекции","SORT":400,"PARENT":"38","UF_HEAD":"785"},{"ID":"66","NAME":"МОЗ","SORT":500,"PARENT":"38","UF_HEAD":"146"},{"ID":"269","NAME":"Отдел аудита и аутсорсинга по ОТ","SORT":500,"PARENT":"38","UF_HEAD":"124","CHILDREN":[{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"}]},{"ID":"249","NAME":"Пожарная безопасность","SORT":500,"PARENT":"38","UF_HEAD":"2273","CHILDREN":[{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"}]},{"ID":"357","NAME":"Энергоаудит","SORT":500,"PARENT":"38"},{"ID":"64","NAME":"Экология","SORT":700,"PARENT":"38","UF_HEAD":"164","CHILDREN":[{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"}]},{"ID":"56","NAME":"ЭМИЛ","SORT":800,"PARENT":"38","UF_HEAD":"142"}]},{"ID":"157","NAME":"Руководитель учебного центра центра","SORT":450,"PARENT":"1","UF_HEAD":"32","CHILDREN":[{"ID":"113","NAME":"Учебный отдел(Омск)","SORT":500,"PARENT":"157"}]},{"ID":"34","NAME":"Отдел кадров","SORT":475,"PARENT":"1","UF_HEAD":"140"},{"ID":"355","NAME":"Томск УЦ","SORT":500,"PARENT":"1","UF_HEAD":"3679"},{"ID":"165","NAME":"Юрист","SORT":500,"PARENT":"1"},{"ID":"36","NAME":"Системный администратор","SORT":700,"PARENT":"1","UF_HEAD":"14"},{"ID":"80","NAME":"Техническая поддержка Битрикс24","SORT":850,"PARENT":"1","UF_HEAD":"0","CHILDREN":[{"ID":"311","NAME":"Тест","SORT":500,"PARENT":"80"}]}]},{"ID":"46","NAME":"Бухгалтерия","SORT":200,"PARENT":"1","UF_HEAD":"4327"},{"ID":"18","NAME":"Коммерческий отдел","SORT":300,"PARENT":"1","UF_HEAD":"30","CHILDREN":[{"ID":"167","NAME":"Тендерный отдел","SORT":50,"PARENT":"18","UF_HEAD":"1623"},{"ID":"107","NAME":"ОМСК","SORT":100,"PARENT":"18","UF_HEAD":"1047","CHILDREN":[{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"}]},{"ID":"241","NAME":"Отдел продаж (Барнаул)","SORT":200,"PARENT":"18","UF_HEAD":"1155"},{"ID":"331","NAME":"Отдел продаж (Новосибирск)","SORT":400,"PARENT":"18","CHILDREN":[{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"}]},{"ID":"217","NAME":"Отдел Маркетинга","SORT":600,"PARENT":"18","UF_HEAD":"859"}]},{"ID":"167","NAME":"Тендерный отдел","SORT":50,"PARENT":"18","UF_HEAD":"1623"},{"ID":"107","NAME":"ОМСК","SORT":100,"PARENT":"18","UF_HEAD":"1047","CHILDREN":[{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"}]},{"ID":"109","NAME":"Отдел продаж Омск","SORT":500,"PARENT":"107","UF_HEAD":"0"},{"ID":"241","NAME":"Отдел продаж (Барнаул)","SORT":200,"PARENT":"18","UF_HEAD":"1155"},{"ID":"331","NAME":"Отдел продаж (Новосибирск)","SORT":400,"PARENT":"18","CHILDREN":[{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"}]},{"ID":"133","NAME":"Отдел продаж №1","SORT":500,"PARENT":"331","UF_HEAD":"3537"},{"ID":"52","NAME":"Отдел Продаж №2 ","SORT":700,"PARENT":"331","UF_HEAD":"4529"},{"ID":"50","NAME":"Отдел Продаж №3 ","SORT":800,"PARENT":"331","UF_HEAD":"82"},{"ID":"217","NAME":"Отдел Маркетинга","SORT":600,"PARENT":"18","UF_HEAD":"859"},{"ID":"38","NAME":"Технический отдел","SORT":400,"PARENT":"1","UF_HEAD":"34","CHILDREN":[{"ID":"68","NAME":"Доступная Среда","SORT":200,"PARENT":"38","UF_HEAD":"122"},{"ID":"58","NAME":"Испытательная лаборатория","SORT":300,"PARENT":"38","UF_HEAD":"150"},{"ID":"60","NAME":"Отдел СОУТ","SORT":350,"PARENT":"38","UF_HEAD":"116","CHILDREN":[{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"}]},{"ID":"129","NAME":"Орган Инспекции","SORT":400,"PARENT":"38","UF_HEAD":"785"},{"ID":"66","NAME":"МОЗ","SORT":500,"PARENT":"38","UF_HEAD":"146"},{"ID":"269","NAME":"Отдел аудита и аутсорсинга по ОТ","SORT":500,"PARENT":"38","UF_HEAD":"124","CHILDREN":[{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"}]},{"ID":"249","NAME":"Пожарная безопасность","SORT":500,"PARENT":"38","UF_HEAD":"2273","CHILDREN":[{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"}]},{"ID":"357","NAME":"Энергоаудит","SORT":500,"PARENT":"38"},{"ID":"64","NAME":"Экология","SORT":700,"PARENT":"38","UF_HEAD":"164","CHILDREN":[{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"}]},{"ID":"56","NAME":"ЭМИЛ","SORT":800,"PARENT":"38","UF_HEAD":"142"}]},{"ID":"68","NAME":"Доступная Среда","SORT":200,"PARENT":"38","UF_HEAD":"122"},{"ID":"58","NAME":"Испытательная лаборатория","SORT":300,"PARENT":"38","UF_HEAD":"150"},{"ID":"60","NAME":"Отдел СОУТ","SORT":350,"PARENT":"38","UF_HEAD":"116","CHILDREN":[{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"}]},{"ID":"245","NAME":"Отдел СОУТ (Барнаул)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"111","NAME":"Отдел СОУТ (Омск)","SORT":500,"PARENT":"60","UF_HEAD":"0"},{"ID":"129","NAME":"Орган Инспекции","SORT":400,"PARENT":"38","UF_HEAD":"785"},{"ID":"66","NAME":"МОЗ","SORT":500,"PARENT":"38","UF_HEAD":"146"},{"ID":"269","NAME":"Отдел аудита и аутсорсинга по ОТ","SORT":500,"PARENT":"38","UF_HEAD":"124","CHILDREN":[{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"}]},{"ID":"313","NAME":"Отдел аудита и аутсорсинга по ОТ(Барнаул)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"271","NAME":"Отдел аудита и аутсорсинга по ОТ(ОМСК)","SORT":500,"PARENT":"269","UF_HEAD":"0"},{"ID":"249","NAME":"Пожарная безопасность","SORT":500,"PARENT":"38","UF_HEAD":"2273","CHILDREN":[{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"}]},{"ID":"115","NAME":"Пожарная безопасность (Омск)","SORT":500,"PARENT":"249"},{"ID":"357","NAME":"Энергоаудит","SORT":500,"PARENT":"38"},{"ID":"64","NAME":"Экология","SORT":700,"PARENT":"38","UF_HEAD":"164","CHILDREN":[{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"}]},{"ID":"273","NAME":"Экология(Барнаул)","SORT":500,"PARENT":"64"},{"ID":"277","NAME":"Экология(Омск)","SORT":500,"PARENT":"64"},{"ID":"56","NAME":"ЭМИЛ","SORT":800,"PARENT":"38","UF_HEAD":"142"},{"ID":"157","NAME":"Руководитель учебного центра центра","SORT":450,"PARENT":"1","UF_HEAD":"32","CHILDREN":[{"ID":"113","NAME":"Учебный отдел(Омск)","SORT":500,"PARENT":"157"}]},{"ID":"113","NAME":"Учебный отдел(Омск)","SORT":500,"PARENT":"157"},{"ID":"34","NAME":"Отдел кадров","SORT":475,"PARENT":"1","UF_HEAD":"140"},{"ID":"355","NAME":"Томск УЦ","SORT":500,"PARENT":"1","UF_HEAD":"3679"},{"ID":"165","NAME":"Юрист","SORT":500,"PARENT":"1"},{"ID":"36","NAME":"Системный администратор","SORT":700,"PARENT":"1","UF_HEAD":"14"},{"ID":"80","NAME":"Техническая поддержка Битрикс24","SORT":850,"PARENT":"1","UF_HEAD":"0","CHILDREN":[{"ID":"311","NAME":"Тест","SORT":500,"PARENT":"80"}]},{"ID":"311","NAME":"Тест","SORT":500,"PARENT":"80"}]');



export default class SelectDataByStatistic {
    constructor(container, requests, bx) {
        this.container = container;
        this.requests = requests;                                                                       // объект Requests для выполнения запросов к серверу
        this.bx = bx;

        // КОНТЕЙНЕРЫ
        this.containerDepart = this.container.querySelector(".select-depart-statistic-content");        // контейнер - дерево подразделений
        this.containerUserDepart = this.container.querySelector(".select-employe-statistic-content");   // контейнер - пользователей по подразделениям

        this.modal = new bootstrap.Modal(this.container, {});                                           // объект bootstrap модального окна

        // КНОПКИ
        this.btnCancel = this.container.querySelector(".modal-select-data-button-cancel");              // кнопка - "Закрыть" окно настроек приложения
        this.btnSave = this.container.querySelector(".modal-select-data-button-save");                  // кнопка - "Сохранить" настройки приложения


        this.keyStorageDepartment = "department";       // ключ для получения из хранилища списка выбранных подразделений

        // ДАННЫЕ
        this.saveDepartments = null;                    // список выбранных подразделений
        this.departments = null;                        // список подразделений компании
        this.companyStructure = null;                   // иерархическая структура компании
    }

    async init() {
        await this.getSavedDepartments();               // получение сохраненного списка подразделений из хранилища Битрикс
        await this.getAllDepartments();                 // получение списка всех подразделений из Битрикс

        this.renderCompanyStructure();                  // вывод списка подразделений компании в окне настроек
        this.setCheckedInputChoice();                   // установка галочек на сохраненных подразделениях

        await this.renderSelectedDepartment();          // вывод списка выбранных подразделений

        this.initHandler();                             // инициализация обработчиков событий
    }

    initHandler() {
        // событие кнопки "Сохранить" настройки приложения
        this.btnSave.addEventListener("click", (event) => {
            this.saveDepartments = this.getListChoiceDepartments();                             // получение списка выбранных подразделений
            BX24.appOption.set(this.keyStorageDepartment, this.saveDepartments.join(","));      // сохранение списка подразделений в настройках приложения
            this.modal.hide();                                                                // скрыть модальное окно с настройками праложения
        })

        // событие "checked" по подразделению
        this.containerDepart.addEventListener("change", async (event) => {
            if (event.target.checked) {
                // добавление нового подразделения в списке выбора сотрудников
                this.renderUsersDepartment({
                    ID: event.target.value,
                    NAME: event.target.dataset.department,
                });
            } else {
                // удаление подразделения из списка выбора сотрудников
                this.containerUserDepart.querySelectorAll(".modal-settings-app-usersdepart-item").forEach((element) => {
                    let departId = element.dataset.depart_id;
                    if (event.target.value == departId) {
                        element.remove();
                        return;
                    }
                })
            }
        })

        // окно "выбранные пользователи подразделений" - событие "checked" по пользователю подразделения
        this.containerUserDepart.addEventListener("change", async (event) => {
            if (event.target.checked) {
                await this.requests.PUT("users/" + event.target.value, {"STATUS_DISPLAY": true});
            } else {
                await this.requests.PUT("users/" + event.target.value, {"STATUS_DISPLAY": false});
            }
        })

        // событие - открытие модального окна
        this.container.addEventListener("show.bs.modal", async () => {
            await this.getSavedDepartments();           // получение списка сохраненных настроек приложения
            this.setCheckedInputChoice();               // установка галочек на сохраненных подразделениях
        })

    }

    // получение сохраненного списка подразделений из хранилища Битрикс
    async getSavedDepartments() {
        let storageDepartment = await BX24.appOption.get(this.keyStorageDepartment);
        if (storageDepartment) {
            this.saveDepartments = storageDepartment.split(",");
        } else {
            this.saveDepartments = [];
        }
    }

    // получение списка всех подразделений из Битрикс
    async getAllDepartments() {
        this.departments = await this.bx.callMethod("department.get");          // список всех аподраздеоений
        this.companyStructure = this.getTreeDepartments();                      // создание иерархии подразделений (структура компаний)
    }

    // установка галочек в выбранных подразделениях
    setCheckedInputChoice() {
        if (!this.saveDepartments) {
            return;
        }
        let departCheckList = this.containerDepart.getElementsByTagName("INPUT");
        for (let departCheck of departCheckList) {
            if (this.saveDepartments.includes(departCheck.value)) {
                departCheck.checked = true;
            } else {
                departCheck.checked = false;
            }
        }
    }

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


    // <<<<<===== RENDER =====>>>>>
    // возвращает HTML код дочерних подразделений
    getHtmlDepartmentLi(departments) {
        let contentHTML = '';
        for (let department of departments) {
            let nestedContentHTML = "";
            if (Array.isArray(department.CHILDREN) && department.CHILDREN.length >= 1) {
                nestedContentHTML += this.getHtmlDepartmentUl(department.CHILDREN);
            }
            contentHTML += templateDepartLi(department.ID, department.NAME, nestedContentHTML);
        }

        return contentHTML;
    }
    
    // возвращает HTML код списка подразделений
    getHtmlDepartmentUl(departments) {
        let contentHTML = '';
        let departListHTML = this.getHtmlDepartmentLi(departments);
        contentHTML += templateDepartUl(departListHTML);
        return contentHTML;
    }

    // вывод иерархического списка подразделений
    renderCompanyStructure() {
        const contentHTML = this.getHtmlDepartmentUl(this.companyStructure);
        this.containerDepart.insertAdjacentHTML('beforeend', contentHTML);
    }

    // возвращает HTML код списка пользователей
    renderUsers(users) {
        let contentHTML = "";
        for (let user of users) {
            let checked = "";
            if (user.STATUS_DISPLAY) {
                // если пользователь участвует в выводе статистики
                checked = "checked";
            }
            contentHTML += templateDepartEmployeUser(user.ID, user.LAST_NAME, user.NAME, checked)
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

        let users = response.result.results;
        let contentUsersHTML = this.renderUsers(users);
        contentHTML += templateDepartEmploye(department.ID, department.NAME, contentUsersHTML);       
        this.containerUserDepart.insertAdjacentHTML('beforeend', contentHTML);
    }

    // окно "выбранные пользователи подразделений" - вывод списка подразделений
    async renderSelectedDepartment() {
        this.containerUserDepart.innerHTML = "";
        for (let department of this.departments) {
            if (department.ID && this.saveDepartments.includes(department.ID)) {
                await this.renderUsersDepartment(department);
            }
        }
    }

    getDepartments() {
        return this.departments;
    }

    getSaveDepartment() {
        return this.saveDepartments;
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


