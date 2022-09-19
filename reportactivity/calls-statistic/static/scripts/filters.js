const RangeYearMin = 2021;
const RangeYearMax = 2050;


class FilterTableByMonth {
    constructor() {
        this.filterYear = document.querySelector("#tableByMonthFilter .table-by-month-filter-year");   //

        this.init();
    }


    init() {
        let now = new Date();
        let yearActual = now.getFullYear();

        this.renderFilterYear(yearActual);
    }

    renderFilterYear(yearActual) {
        let contentHTML = "";
               
        for (let year = RangeYearMin; year <= RangeYearMax; year++) {
            contentHTML += `
                <option value="${year}">${year}</option>
            `;
        }

        this.filterYear.innerHTML = contentHTML;
        this.filterYear.value = yearActual;
    }

    getYear() {
        return this.filterYear.value;
    }


}


class FilterTableByDay {
    constructor() {
        this.filterYear = document.querySelector("#tableByDayFilter .table-by-day-filter-year");        //
        this.filterMonth = document.querySelector("#tableByDayFilter .table-by-day-filter-month");      //
        this.init();
    }

    init() {
        let now = new Date();
        let yearActual = now.getFullYear();
        let monthActual = +now.getMonth() + 1;

        this.renderFilterYear(yearActual);
        this.setActualMonth(monthActual);

    }

    renderFilterYear(yearActual) {
        let contentHTML = "";
        
        for (let year = RangeYearMin; year <= RangeYearMax; year++) {
            contentHTML += `
                <option value="${year}">${year}</option>
            `;
        }

        this.filterYear.innerHTML = contentHTML;
        this.filterYear.value = yearActual;
    }

    setActualMonth(month) {
        this.filterMonth.value = month;
    }

    getYear() {
        return this.filterYear.value;
    }

    getMonth() {
        return this.filterMonth.value;
    }
}


export {FilterTableByMonth, FilterTableByDay}

