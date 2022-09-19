import Request from './requests.js';
import SettingsApp from './settings.js';
import BX from './bitrix24.js';
import TableByDay from './table_by_day.js';
import TableByMonth from './table_by_month.js';
import {FilterTableByMonth, FilterTableByDay} from './filters.js';

// let API = "http://127.0.0.1:8000/api/v2/";


class App {
    constructor() {
        // this.api = API;

        this.requests = new Request();                                                          // объект выполнения запросов для получения и изменения сохраненных данных API
        this.bx = new BX();                                                                     // объект для выполнения запросов к Битрикс

        this.filterTableByMonth = new FilterTableByMonth();                                     // объект выполнения запросов для получения и изменения сохраненных данных API
        this.filterTableByDay = new FilterTableByDay();                                         // объект выполнения запросов для получения и изменения сохраненных данных API
        
        this.modalSettingsApp = document.querySelector("#modalSettings");                       // модальное окно - настройки приложения
        this.SettingsApp = new SettingsApp(this.modalSettingsApp, this.requests);               // объект настройки приложения
        
        this.elementTableByMonth = document.querySelector("#tableStatisticMonth");              // таблица статистики по месяцам
        this.elementTableByDay = document.querySelector("#tableStatisticDay");                  // табллица статистики по дням

        this.tableByMonth = new TableByMonth(this.elementTableByMonth, this.requests);
        this.tableByDay = new TableByDay(this.elementTableByDay, this.requests);

        this.buttonGetDataByMonth = document.querySelector(".get-statistic-by-month button");   // кнопка получить статистику по месяцам
        this.buttonGetDataByDay = document.querySelector(".get-statistic-by-day button");       // кнопка получить статистику по месяцам
        this.buttonOpenSettings = document.querySelector(".header-settings");                   // кнопка открытия настроек
        

        this.duration = 20;

        this.departments = [];                          // список id выбранных подразделений
        this.statisticDataByMonth = null;               // 
        this.statisticDataByDay = null;                 // 

        this.statusEdit = false;                        // право на редактирование данных таблицы
        this.statusSettings = false;                    // право на доступ к настройкам приложения
    }

    async init() {
        this.initHandler();                             // инициализация обработчиков событий приложения
        await this.initAllowedUser();                   // инициализация прав доступа пользователей
        this.initButtonSettings();
        await this.SettingsApp.init();                  // инициализация окна настроек
        await this.getDepartments();                    // получение списка подразделений для вывода статистики
        await this.renderTableByMonth();                // вывод таблицы статистика по месяцам
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

    // инициализация прав доступа пользователя
    async initAllowedUser() {
        let userCurrent = await this.bx.callMethod("user.current");
        let user = await this.requests.GET("users/" + userCurrent.ID);
        this.statusEdit = user.result.ALLOWED_EDIT;
        this.statusEditAll = (userCurrent.ID == 4651) || (userCurrent.ID == 2479) ? true : false;
        this.statusSettings = user.result.ALLOWED_SETTING;
    }

    // ограничение доступа пользователя к настройкам
    initButtonSettings() {
        if (!this.statusSettings) {
            this.buttonOpenSettings.remove();
        }
    }
    

    // получение списка подразделений 
    async getDepartments() {
        this.departments = await this.SettingsApp.getSaveDepartment();
    }

    // получение статистики по месяцам
    async getStatisticByMonth(year=2021) {
        let method = "active-by-month";
        let statisticDataByMonth = [];
        let promiseList = [];

        for (let departId of this.departments) {
            let data = {
                depart: departId,
                year: year,
                duration: this.duration,
            }
            
            let prom = Promise.all([
                this.requests.POST(method, data),
                this.getUserById(departId)
            ]).then((res) => {
                // console.log(res);
                let response = res[0];
                let user = res[1];

                statisticDataByMonth.push({
                    departId: departId,
                    headId: user.ID,
                    headName: user.NAME,
                    headLastname: user.LAST_NAME,
                    data: response.result
                })
            });

            promiseList.push(prom);
        }
       
        await Promise.all(promiseList).then(() => {
            this.statisticDataByMonth = statisticDataByMonth.sort(this.sortFunc);
        })
        return this.statisticDataByMonth;
    }

    // получение статистики по дням
    async getStatisticByDay(year=2021, month=11) {
        let method = "active-by-day";
        let statisticDataByDay = [];
        let promiseList = [];

        for (let departId of this.departments) {    
            let data = {
                depart: departId,
                year: year,
                month: month,
                duration: this.duration,
            }

            let prom = Promise.all([
                this.requests.POST(method, data),
                this.getUserById(departId)
            ]).then((res) => {
                // console.log(res);
                let response = res[0];
                let user = res[1];

                statisticDataByDay.push({
                    departId: departId,
                    headId: user.ID,
                    headName: user.NAME,
                    headLastname: user.LAST_NAME,
                    data: response.result
                })
            });

            promiseList.push(prom);
        }

        await Promise.all(promiseList).then(() => {
            this.statisticDataByDay = statisticDataByDay.sort(this.sortFunc);
        })

        return this.statisticDataByDay;
    }

    // получение списка рабочих дней
    async getCountWorkingDay(year) {
        let countWorking = [];
        let response = await this.requests.GET("count-working-days", {year});                           // список рабочих дней по месяцам
        
        if (!response.error) {
            countWorking = response.result;
        }
        
        return countWorking;
    }

    // вывод таблицы статистика по месяцам
    async renderTableByMonth() {
        let actualYear = this.filterTableByMonth.getYear();                                                     // выбранный год
        this.duration = await this.SettingsApp.getSaveDuration();                                               // получение длительности звонка для фильтрации
        let deadline = await this.SettingsApp.getSaveDeadline();                                                // получение дедлайна на редактирование
        let period = await this.SettingsApp.getSavePeriod();                                                    // получение периода обновления таблицы
        let countWorking = await this.getCountWorkingDay(actualYear);                                           // список количества рабочих дней по месяцам
        let statisticDataByMonth = await this.getStatisticByMonth(actualYear);                                  // получение статистики по месяцам
        this.tableByMonth.render(statisticDataByMonth, countWorking, actualYear, deadline, this.statusEdit, this.statusEditAll);    // вывод данных в таблицу

        let interval = +period * 1000 * 60;
        this.timerId = setInterval(
            async (countWorking, actualYear, deadline, statusEdit, statusEditAll) => {
                let statisticDataByMonth = await this.getStatisticByMonth(actualYear);
                this.tableByMonth.render(statisticDataByMonth, countWorking, actualYear, deadline, statusEdit, statusEditAll)
            },
            interval, countWorking, actualYear, deadline, this.statusEdit, this.statusEditAll
            // this.renderTableByMonthInterval, interval, statisticDataByMonth, countWorking, actualYear, deadline, this.statusEdit
        );
    }

    // вывод таблицы статистика по дням
    async renderTableByDay() {
        let actualYear = this.filterTableByDay.getYear();                                               // выбранный год
        let actualMonth = this.filterTableByDay.getMonth();                                             // выбранный месяц
        this.duration = await this.SettingsApp.getSaveDuration();                                       // получение длительности звонка для фильтрации
        let period = await this.SettingsApp.getSavePeriod();                                            // получение периода обновления таблицы
        let countWorkings = await this.getCountWorkingDay(actualYear);                                  // список рабочих дней
        let countWorking = countWorkings.find(item => item.month == actualMonth);
        let statisticDataByDay = await this.getStatisticByDay(actualYear, actualMonth);                 // получение статистики по дням
        // console.log(statisticDataByDay);
        this.tableByDay.render(
            statisticDataByDay, actualYear, actualMonth, countWorking.count_working_days
        );                                                                                            // вывод данных в таблицу
        let interval = +period * 1000 * 60;
        this.timerId = setInterval(
            async (actualYear, actualMonth, count_working_days) => {
                let statisticDataByDay = await this.getStatisticByDay(actualYear, actualMonth);
                this.tableByDay.render(statisticDataByDay, actualYear, actualMonth, count_working_days);
            },
            interval, actualYear, actualMonth, countWorking.count_working_days
            // this.renderTableByDayInterval, interval, statisticDataByDay, actualYear, actualMonth, countWorking.count_working_days
        );
    }


    // получение данных руководителя подразделения
    async getUserById(idDepart) {
        let idUser = await this.SettingsApp.getUserHeadDepart(idDepart);
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

