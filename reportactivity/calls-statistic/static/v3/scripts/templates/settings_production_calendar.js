/**
 * Возвращает HTML-код одного дня месяца календаря
 * @param {number} id Номер дня месяца
 * @returns {string} Возвращает HTML-код одного дня месяца календаря
 */

/**
 * Возвращает HTML-код одного дня месяца календаря
 * @param {*} year Год
 * @param {*} month Номер месяца
 * @param {*} nameMonth Название месяца
 * @param {*} content HTML-код содержимого календаря
 * @returns {string} Возвращает HTML-код одного дня месяца календаря
 */
 function templateProductionCalendar(year, month, nameMonth, content) {
    return `
        <div class="calendar-item-body" data-year="${year} data-num-month="${month}">
            <div class="calendar-item-title">${nameMonth}</div>
            <ul class="calendar-days">
                <li class="calendar-days-item">пн</li>
                <li class="calendar-days-item">вт</li>
                <li class="calendar-days-item">ср</li>
                <li class="calendar-days-item">чт</li>
                <li class="calendar-days-item">пт</li>
                <li class="calendar-days-item">сб</li>
                <li class="calendar-days-item">вс</li>
            </ul>
            <ul class="calendar-numbers">
                ${content}
            </ul>
        </div>
    `;
}

/**
 * Возвращает HTML-код одного рабочего дня месяца
 * @param {number} id Номер дня месяца
 * @returns {string} Возвращает HTML-код одного рабочего дня месяца
 */
 function templateProductionCalendarDayOn(number="") {
    return `
        <li class="calendar-numbers-item">${number}</li>
    `;
}

/**
 * Возвращает HTML-код одного нерабочего дня месяца
 * @param {number} id Номер дня месяца
 * @returns {string} Возвращает HTML-код одного нерабочего дня месяца
 */
 function templateProductionCalendarDayOff(number="") {
    return `
        <li class="calendar-numbers-item calendar-numbers-item-day-off">${number}</li>
    `;
}

export {templateProductionCalendar, templateProductionCalendarDayOn, templateProductionCalendarDayOff, };


