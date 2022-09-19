const RANGE_YEAR_MIN = 2021;                    // начло периода - вывод статистики
// const RANGE_YEAR_MAX = 2050;                    // конец периода - вывод статистики
let now = new Date();                           // текущая дата
let yearActual = now.getFullYear();             // текущий год
const RANGE_YEAR_MAX = yearActual + 5;          // конец периода - вывод статистики


class FilterTableByMonth {
    constructor(container) {
        this.container = container;                                     // контейнер фильтра
        this.selectYears = this.container.querySelector("select");      // элемент SELECT с списком годов

        this.RangeYearMin = RANGE_YEAR_MIN;                             // начло периода
        this.RangeYearMax = RANGE_YEAR_MAX;                             // конец периода
    }

    init() {
        let now = new Date();                           // текущая дата
        let yearActual = now.getFullYear();             // текущий год

        this.renderFilterYear();                        // вывод доступного списка годов элемента select фильтра
        this.setActualYear(yearActual);                 // установка начального значения фильтра - текущий год
    }

    // вывод доступного списка годов элемента select фильтра
    renderFilterYear() {
        let contentHTML = "";
        for (let year = this.RangeYearMin; year <= this.RangeYearMax; year++) {
            contentHTML += `
                <option value="${year}">${year}</option>
            `;
        }

        this.selectYears.innerHTML = contentHTML;       // вывод списка доступных годов для фильтрации
    }

    // установка начального значения фильтра - текущий год
    setActualYear(yearActual) {
        this.selectYears.value = yearActual;            // установка начального значения фильтра - текущий год
    }

    // возвращает выбранный год в формате: гггг
    getYear() {
        return this.selectYears.value;
    }
}


class FilterTableByDay {
    constructor(container) {
        this.container = container;                                                     // контейнер фильтра

        this.selectYear = this.container.querySelector(".table-by-day-filter-year");    // элемент SELECT с списком годов
        this.selectMonth = this.container.querySelector(".table-by-day-filter-month");  // элемент SELECT с списком месяцев

        this.RangeYearMin = RANGE_YEAR_MIN;                                             // начло периода
        this.RangeYearMax = RANGE_YEAR_MAX;                                             // конец периода
    }

    init() {
        let now = new Date();                                                           // текущая дата
        let yearActual = now.getFullYear();                                             // текущий год
        let monthActual = +now.getMonth() + 1;                                          // текущий месяц

        this.renderFilterYear();                                                        // вывод доступного списка годов элемента select фильтра
        this.setActualYear(yearActual);                                                 // установка начального значения фильтра - текущий год
        this.setActualMonth(monthActual);                                               // установка начального значения фильтра - текущий месяц

    }

    // вывод доступного списка годов элемента select фильтра
    renderFilterYear() {
        let contentHTML = "";
        for (let year = this.RangeYearMin; year <= this.RangeYearMax; year++) {
            contentHTML += `
                <option value="${year}">${year}</option>
            `;
        }

        this.selectYear.innerHTML = contentHTML;
    }

    // установка начального значения фильтра - текущий год
    setActualYear(yearActual) {
        this.selectYear.value = yearActual;            // установка начального значения фильтра - текущий год
    }

    setActualMonth(month) {
        this.selectMonth.value = month;
    }

    // возвращает выбранный год в формате: гггг
    getYear() {
        return this.selectYear.value;
    }

    // возвращает выбранный месяц в формате: 1..12
    getMonth() {
        return this.selectMonth.value;
    }
}


export {FilterTableByMonth, FilterTableByDay}

