import Request from './requests.js';                                                                // модуль вывполнения запросов к серверу
import BX from './bitrix24.js';                                                                     // модуль выполнения работы к Битрикс

import SelectDataByStatistic from './settings/settings_select_data_by_statistic.js';                // настройки -> выбор данных для сбора статистики
import ProductionCalendar from './settings/settings_production_calendar.js';                        // настройки -> производственный календарь
import Permission from './settings/settings_permission.js';                                         // настройки -> права доступа
import OtherSettings from './settings/settings_other.js';                                           // настройки -> прочие настройки
import UpdatingStatisticsData from './settings/settings_update_data.js';                            // настройки -> обновление статистики
import UpdatingEmploye from './settings/settings_update_users.js';                                  // настройки -> обновление пользователей

import {FilterTableByMonth, FilterTableByDay} from './filters.js';                                  // фильтры - таблиц статистики
import TableByDay from './table_by_day.js';                                                         // модуль работы с таблицей - "Нормирование"
import TableByMonth from './table_by_month.js';                                                     // окно - "Список комментариев/звоков"
import WindowInfo from './window_info.js';


class App {
    constructor() {
        this.requests = new Request();          // объект выполнения запросов для получения и изменения сохраненных данных API
        this.bx = new BX();                     // объект для выполнения запросов к Битрикс

        // НАСТРОЙКИ
        this.modalSelectedData = document.querySelector("#modalSelectDepartAndEmploye");                        // модальное окно - выбор подразделений и сотруднико для вывода статистики
        this.modalSettingsCalendar = document.querySelector("#modalCalendar");                                  // модальное окно - производственный календарь
        this.modalSettingsPermission = document.querySelector("#modalPermission");                              // модальное окно - права доступа
        this.modalSettingsOther = document.querySelector("#modalOtherSettings");                                // модальное окно - прочие настройки
        this.modalUpdateStatistics = document.querySelector("#modalUpdateData");                                // модальное окно - обновление статистики
        this.modalUpdateUsers = document.querySelector("#modalUpdateEmploye");                                  // модальное окно - обновление пользователей
        this.settingsSelectedData = new SelectDataByStatistic(this.modalSelectedData, this.requests, this.bx);  // объект - выбор данных для статистики
        this.settingsCalendar = new ProductionCalendar(this.modalSettingsCalendar, this.requests, this.bx);     // объект - производственный календарь
        this.settingsPermission = new Permission(this.modalSettingsPermission, this.requests, this.bx);         // объект - права доступа
        this.settingsOtherSettings = new OtherSettings(this.modalSettingsOther, this.requests, this.bx);        // объект - прочие настройки
        this.settingsUpdateStatistics = new UpdatingStatisticsData(this.modalUpdateStatistics, this.requests, this.bx);     // объект - обновление статистики
        this.settingsUpdateEmploye = new UpdatingEmploye(this.modalUpdateUsers, this.requests, this.bx);        // объект - обновление пользователей

        // ОКНО - ПОДРОБНАЯ ИНФОРМАЦИЯ
        this.windowInfoData = document.querySelector("#windowInfoData");                                        // контейнер - окно с метаданными
        this.infoData = new WindowInfo(this.windowInfoData, this.requests, this.bx);                            // окно с метаданными

        // ФИЛЬТРЫ
        this.containerFilterByMonth = document.querySelector("#tableByMonthFilter");                            // контейнер фильтра таблицы по месяцам
        this.containerFilterByDay = document.querySelector("#tableByDayFilter");                                // контейнер фильтра таблицы по дням
        this.filterTableByMonth = new FilterTableByMonth(this.containerFilterByMonth);                          // объект - фильтрация по месяцам
        this.filterTableByDay = new FilterTableByDay(this.containerFilterByDay);                                // объект - фильтрация по дням

        // СПИННЕРЫ
        this.containerSpinnerByMonth = document.querySelector("#tableByMonthSpinner");                          // контейнер спиннера таблицы по месяцам
        this.containerSpinnerByDay = document.querySelector("#tableByDaySpinner");                              // контейнер спиннера таблицы по дням

        // ТАБЛИЦЫ
        this.elementTableByMonth = document.querySelector("#tableStatisticMonth");                              // таблица статистики по месяцам
        this.elementTableByDay = document.querySelector("#tableStatisticDay");                                  // таблица статистики по дням
        this.tableByMonth = new TableByMonth(this.elementTableByMonth, this.requests, this.infoData);           // объект - таблица статистики по месяцам
        this.tableByDay = new TableByDay(this.elementTableByDay, this.requests, this.infoData);                 // объект - таблица статистики по дням

        // КНОПКИ
        this.buttonGetDataByMonth = document.querySelector(".get-statistic-by-month button");   // кнопка - получить статистику по месяцам
        this.buttonGetDataByDay = document.querySelector(".get-statistic-by-day button");       // кнопка - получить статистику по месяцам
        this.buttonOpenSettings = document.querySelector(".header-settings");                   // кнопка - открытия настроек

        // ДАННЫЕ
        this.duration = 20;                             // минисмальная длительность звонков для учета в статистике
        this.departments = [];                          // список id выбранных подразделений
        this.statisticDataByMonth = null;               // статистика за год - по месяцам
        this.statisticDataByDay = null;                 // статистика за месяц - по дням

        // ПРАВА ДОСТУПА
        this.statusEdit = false;                        // право на редактирование данных таблицы: 0 - запрещено, 1 - ограниченно разрешено, 2 - разрешено
        this.statusSettings = false;                    // право на доступ к просмотру и редактированию настроек приложения: true - разрешено, false - запрещено 

        this.currentUser = {
            ID: null,
            LAST_NAME: null,
            NAME: null,
        }
    }

    async init() {
        // Объект запросов
        await this.requests.init();
        
        // Фильтры
        this.filterTableByMonth.init();                         // фильтр на странице - Нормирование
        this.filterTableByDay.init();                           // фильтр на старнице - План/Факт

        // Настройки
        await this.settingsSelectedData.init();                 // настройки -> выбор подразделений и сотруднико для вывода статистики
        let departments = this.settingsSelectedData.getDepartments();
        await this.settingsCalendar.init();                     // настройки -> производственный календарь
        await this.settingsPermission.init(departments);        // настройки -> права доступа
        await this.settingsOtherSettings.init();                // настройки -> прочие
        this.settingsUpdateStatistics.init();                   // настройки -> обновление статистики
        this.settingsUpdateEmploye.init();                      // настройки -> обновление статистики

        // Права доступа
        await this.initAllowedUser();                           // инициализация прав доступа текущего пользователя

        // Окно с метаданными (список комментариев + звонков)
        this.infoData.init(this.currentUser);                   // 

        // Получение настроек приложения для вывода статистики
        await this.getDepartments();                            // получение выбранных (сохраненного) в настройках списка подразделений

        // Вывод таблицы с данными по месяцам
        // await this.renderTableByMonth();                        // вывод таблицы статистика по месяцам
        this.renderTableByDay();                                // вывод таблицы статистика по месяцам

        this.initHandler();                                     // инициализация обработчиков событий приложения
    }

    initHandler() {
        // обработчик кнопки получения данные по месяцам
        this.buttonGetDataByMonth.addEventListener("click", (event) => {
            clearTimeout(this.timerId);
            this.renderTableByMonth();                                      // вывод таблицы статистика по месяцам
        })

        // обработчик кнопки получения данные по дням
        this.buttonGetDataByDay.addEventListener("click", (event) => {
            clearTimeout(this.timerId);
            this.renderTableByDay();                                        // вывод таблицы статистика по месяцам
        })

        // Событие открытия вкладки "Нормирование"
        let tabNormalization = document.querySelector('#nav-month-tab');
        tabNormalization.addEventListener('shown.bs.tab', async (event) => {
            clearTimeout(this.timerId);
            this.renderTableByMonth();
        })

        // Событие открытия вкладки "План/Факт"
        let tabPlanActual = document.querySelector('#nav-days-tab');
        tabPlanActual.addEventListener('shown.bs.tab', async (event) => {
            clearTimeout(this.timerId);
            this.renderTableByDay();
        })
    }

    // инициализация прав доступа текущего пользователя
    async initAllowedUser() {
        let userCurrent = await this.bx.callMethod("user.current");             // текущий пользователь - запрос данных из Битрикс
        let user = await this.requests.GET("users/" + userCurrent.ID);          // текущий пользователь - запрос данных с сервера
        this.currentUser = {
            ID: user.result.ID,
            LAST_NAME: user.result.LAST_NAME,
            NAME: user.result.NAME,
            ALLOWED_STATUS_DAY: user.result.ALLOWED_STATUS_DAY,
            ALLOWED_VERIFICATION_MSG: user.result.ALLOWED_VERIFICATION_MSG,

        }
        this.statusEdit = user.result.ALLOWED_EDIT;                             // право на редактирование данных таблицы
        this.statusSettings = user.result.ALLOWED_SETTING;                      // право на доступ к просмотру и редактированию настроек приложения
        this.statusStatusDay = user.result.ALLOWED_STATUS_DAY;                  // право на доступ к изменению статуса дня
        this.statusVerivicationMsg = user.result.ALLOWED_VERIFICATION_MSG;      // право на доступ к верификации сообщений
        
        if (!this.statusSettings) this.buttonOpenSettings.remove();             // удаление кнопки настроек приложения, при отсутствии доступа
    }

    // получение списка подразделений 
    async getDepartments() {
        this.departments = await this.settingsSelectedData.getSaveDepartment();
    }

    // получение статистики по месяцам
    async getStatisticByMonth(year=2021) {
        let method = "active-by-month";
        let statisticDataByMonth = [];
        
        let data = {
            depart: this.departments.join(","),
            year: year,
            duration: this.duration,
        }

        let response = await this.requests.POST(method, data);
        if (response.error) {
            console.log('Не удалось получить данные статистики за год. Ответ: ', response);
            return;
        }

        // убираем из статистики данные руководителя подразделения
        for (let dep in response.result) {
            let dataDepart = {};
            dataDepart.headId = this.headDepart[dep]["ID"];
            dataDepart.headLastname = this.headDepart[dep]["LAST_NAME"];
            dataDepart.headName = this.headDepart[dep]["NAME"];
            dataDepart.data = [];
            for (let statistics of response.result[dep]) {
                if (statistics.ID != this.headDepart[dep]["ID"]) {
                    dataDepart.data.push(statistics);
                }
            }
            statisticDataByMonth.push(dataDepart);
        }

        return statisticDataByMonth;
    }

    // получение статистики по дням
    async getStatisticByDay(year=2021, month=11) {
        let method = "active-by-day";
        let statisticDataByDay = [];
        
        let data = {
            depart: this.departments.join(","),
            year: year,
            month: month,
            duration: this.duration,
        }

        let response = await this.requests.POST(method, data);
        if (response.error) {
            console.log('Не удалось получить данные статистики за месяц. Ответ: ', response);
            return;
        }

        // убираем из статистики данные руководителя подразделения
        for (let dep in response.result) {
            let dataDepart = {};
            dataDepart.departId = dep;
            dataDepart.headId = this.headDepart[dep]["ID"];
            dataDepart.headLastname = this.headDepart[dep]["LAST_NAME"];
            dataDepart.headName = this.headDepart[dep]["NAME"];
            dataDepart.data = [];
            for (let statistics of response.result[dep]) {
                if (statistics.ID != this.headDepart[dep]["ID"]) {
                    dataDepart.data.push(statistics);
                }
            }
            statisticDataByDay.push(dataDepart);
        }

        return statisticDataByDay;

    }

    // получение списка рабочих дней
    async getCountWorkingDay(year) {
        let countWorking = [];
        let response = await this.requests.GET("production-calendar", {year});                                  // список рабочих дней по месяцам
        
        if (!response.error) {
            countWorking = response.result;
        }
        
        return countWorking;
    }

    // вывод таблицы статистика по месяцам
    async renderTableByMonth() {
        // сокрытие таблицы и показ спиннера
        this.elementTableByMonth.classList.add("d-none");
        this.containerSpinnerByMonth.classList.remove("d-none");

        let actualYear = this.filterTableByMonth.getYear();                         // выбранный год
        this.duration = await this.settingsOtherSettings.getSaveDurationCalls();    // получение длительности звонка для фильтрации
        let deadline = await this.settingsOtherSettings.getSaveCountDays();         // дедлайна на редактирование
        let period = await this.settingsOtherSettings.getSavePeriodUpdate();        // периода обновления данных таблицы
        let countWorking = await this.getCountWorkingDay(actualYear);               // список количества рабочих дней по месяцам
        this.headDepart = await this.getListDepartmentHeads();                      // руководители подразделений
        let statisticData = await this.getStatisticByMonth(actualYear);             // данные статистики по месяцам

        let params = {
            actualYear,
            deadline,
            period,
            countWorking,
            headDepart: this.headDepart,
            statusEdit: this.statusEdit, 
            statusEditAll: this.statusEditAll,
            duration: this.duration
        }
        
        this.tableByMonth.render(statisticData, params);

        let interval = +period * 1000 * 60;
        this.timerId = setInterval(
            async (params) => {
                let statisticData = await this.getStatisticByMonth(actualYear);
                this.tableByMonth.render(statisticData, params)
            },
            interval,
            params
        );

        // показ таблицы и сокрытие спиннера
        this.elementTableByMonth.classList.remove("d-none");
        this.containerSpinnerByMonth.classList.add("d-none");
    }

    // вывод таблицы статистика по дням
    async renderTableByDay() {
        // сокрытие таблицы и показ спиннера
        this.elementTableByDay.classList.add("d-none");
        this.containerSpinnerByDay.classList.remove("d-none");

        let actualYear = this.filterTableByDay.getYear();                                               // выбранный год
        let actualMonth = this.filterTableByDay.getMonth();                                             // выбранный месяц
        this.duration = await this.settingsOtherSettings.getSaveDurationCalls();                        // получение длительности звонка для фильтрации
        let period = await this.settingsOtherSettings.getSavePeriodUpdate();                            // получение периода обновления таблицы
        let countWorkings = await this.getCountWorkingDay(actualYear);                                  // список рабочих дней по месяцам за год
        let countWorking = countWorkings[actualMonth] || [];                                            // список рабочих дней за месяц
        let statisticData = await this.getStatisticByDay(actualYear, actualMonth);                      // получение статистики по дням

        let params = {
            actualYear,
            actualMonth,
            countWorking,
            headDepart: this.headDepart,
            statusEdit: this.statusEdit, 
            statusEditAll: this.statusEditAll,
            statusStatusDay: this.statusStatusDay,
            statusVerivicationMsg: this.statusVerivicationMsg,
            duration: this.duration
        }

        console.log("statisticDataByDay = ", statisticData);
        // вывод данных в таблицу
        this.tableByDay.render(
            statisticData, params
        );
        // интервал обновления данных в таблице в милисекундах
        let interval = +period * 1000 * 60;
        this.timerId = setInterval(
            async (params) => {
                let statisticData = await this.getStatisticByDay(actualYear, actualMonth);
                this.tableByDay.render(statisticData, params);
            },
            interval,
            params
        );

        // показ таблицы и сокрытие спиннера
        this.elementTableByDay.classList.remove("d-none");
        this.containerSpinnerByDay.classList.add("d-none");
    }

    async getListDepartmentHeads() {
        let users = [];
        let headByDepart = {};
        let promiseList = [];
        
        for (let departId of this.departments) {
            let prom = Promise.all([
                this.getUserById(departId)
            ]).then((res) => {
                let user = res[0];
                // users.push(user)
                headByDepart[departId] = user;
            });

            promiseList.push(prom);
        }
       
        await Promise.all(promiseList).then(() => {
        })

        return headByDepart;
    }

    // получение данных руководителя подразделения
    async getUserById(idDepart) {
        let idUser = await this.settingsSelectedData.getUserHeadDepart(idDepart);
        let user = await this.bx.callMethod("user.get", {"ID": idUser});
        return user[0];
    }

    sortFunc(obj1, obj2) {
        return +obj1.departId - +obj2.departId;
    }
}


$(document).ready(function() {
    BX24.ready(function() {
        console.log('Start');
        let appAddData = new App();
        appAddData.init();

    })
})

