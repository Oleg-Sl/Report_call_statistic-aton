import {templateProductionCalendar, templateProductionCalendarDayOn, templateProductionCalendarDayOff, } from '../templates/template_production_calendar.js';


const RANGE_YEAR_MIN = 2021;                    // начало периода - вывод статистики
// const RANGE_YEAR_MAX = 2050;                    // конец периода - вывод статистики
let now = new Date();                           // текущая дата
let yearActual = now.getFullYear();             // текущий год
const RANGE_YEAR_MAX = yearActual + 5;          // конец периода - вывод статистики

const MONTH_LIST = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];


export default class ProductionCalendar {
    constructor(container, requests) {
        this.container = container;
        this.requests = requests;                                                       // объект Requests для выполнения запросов к серверу

        this.modal = new bootstrap.Modal(this.container, {});                           // объект bootstrap модального окна с производственным календарем

        this.selectYear = this.container.querySelector(".calendar-year select");        // элемент select выбора года
        this.containerCalendarList = this.container.querySelector(".calendar-list");    // элемент с календорями за год

        this.RangeYearMin = RANGE_YEAR_MIN;                                             // начало периода - для списка доступных годов
        this.RangeYearMax = RANGE_YEAR_MAX;                                             // конец периода - для списка доступных годов
        this.monthList = MONTH_LIST;
        
        this.prodCalend = {};
        this.workingDay = null;
    }

    async init() {
        let now = new Date();                                                           // текущая дата
        let yearActual = now.getFullYear();                                             // текущий год
        this.renderFilterSelectYear();                                                  // вывод доступного списка годов элемента select
        await this.getWorkingDay(yearActual);                                           // получение списка рабочих дней
        this.setActualYear(yearActual);                                                 // установка стартового значения года
        this.renderCalendarList(yearActual);
        this.initHandler();
    }

    initHandler() {
        // изменение года
        this.selectYear.addEventListener("change", async (event) => {
            let year = event.target.value;
            await this.getWorkingDay(year);                                             // получение списка рабочих дней
            this.renderCalendarList(year);
        })

        // отключение выделения контента календаря
        this.containerCalendarList.onselectstart = () => false;

        // клик по дню календаря
        this.containerCalendarList.addEventListener("dblclick", async (event) => {
            let isClickByDay = event.target.classList.contains("calendar-numbers-item");            // статус клика - клик по дню календаря
            let numDay = event.target.innerHTML;                                                    // номер дня - по которому произошел клик
            if (isClickByDay && numDay) {
                let isWeekend = event.target.classList.contains("calendar-numbers-item-day-off");   // выходной день
                let elemCalendar = event.target.closest(".calendar-item-body");                     // HTML элемент календаря
                let year = elemCalendar.dataset.year;                                               // год
                let numMonth = elemCalendar.dataset.numMonth;                                       // номер месяца
                let statusDay = isWeekend ? "work" : "week";
                let result = await this.requests.POST("production-calendar", {
                    date_calendar: `${year}-${numMonth}-${numDay}`,
                    status: statusDay
                });
                if (!result.error) {
                    event.target.classList.toggle("calendar-numbers-item-day-off");                 // 
                }
                console.log("Изменение статуса дня = ", result);
            }
        })
        
    }

    // вывод доступного списка годов элемента select
    renderFilterSelectYear() {
        let contentHTML = "";
        for (let year = this.RangeYearMin; year <= this.RangeYearMax; year++) {
            contentHTML += `
                <option value="${year}">${year}</option>
            `;
        }

        this.selectYear.innerHTML = contentHTML;
    }
    
    // установка стартового значения года
    setActualYear(yearActual) {
        this.selectYear.value = yearActual;
    }

    // получение списка рабочих дней за год
    async getWorkingDay(year) {
        let result = await this.requests.GET("production-calendar", {"year": year, "status": "week"});
        this.workingDay = result.result;
    }

    // вывод списка календарей
    renderCalendarList(year) {
        let contentHTML = "";
        for (let indMonth in this.monthList) {
            let dateStart = new Date(year, indMonth, 1);            // объект даты - начало месяца
            let dateEnd = new Date(year, +indMonth + 1, 0);         // объект даты - конец месяца
            let nameMonth = this.monthList[indMonth];               // название месяца
            let countDays = dateEnd.getDate();                      // количество дней в месяце
            let offsetLeft = dateStart.getDay();                    // с какого номера дня недели начинается месяц
            if (offsetLeft == 0) offsetLeft = 7;                    // установка значения 7 для воскресения, т.к. 0 - воскресенье
            let contentCalendarHTML = this.renderCalendarContent(indMonth, countDays, +offsetLeft - 1);     // HTML-код - содержимое календая (дни) 
            contentHTML += templateProductionCalendar(year, +indMonth + 1, nameMonth, contentCalendarHTML);      // HTML-код - обертка календаря (один месяц)
        }
        this.containerCalendarList.innerHTML = contentHTML;
    }

    // HTML-код - содержимое календая (дни) 
    renderCalendarContent(indMonth, countDays, offsetLeft) {
        let contentHTML = "";
        for (let ind = 0; ind < 42; ind++) {
            if (ind < offsetLeft) {
                // заглушка - пустые дни недели перед началом месяца
                contentHTML += templateProductionCalendarDayOn();
                continue;
            }
            if (ind > (countDays + offsetLeft - 1)) {
                // заглушка - пустые дни недели по завершению месяца
                contentHTML += templateProductionCalendarDayOn();
                continue;
            }
            let number = ind + 1 - offsetLeft;
            let isWeekend = this.isWeekend(+indMonth + 1, number);
            if (isWeekend) {
                // если выходной день
                contentHTML += templateProductionCalendarDayOff(number);
                continue;
            }
            // если рабочий день
            contentHTML += templateProductionCalendarDayOn(number);
        }
        return contentHTML;
    }
    
    isWeekend(month, day) {
        let arrWorkingDay = this.workingDay[month];
        if (Array.isArray(arrWorkingDay) && arrWorkingDay.includes(day)) {
            return true;
        }
    }
    
}
