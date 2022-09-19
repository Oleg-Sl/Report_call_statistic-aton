/**
 * Возвращает HTML-код одной колонки (месяца) первой строки таблицы 
 * @param {number} countWorkingDay Количество рабочих дней в месяце
 * @returns {string} Возвращает HTML-код одной колонки (месяца) первой строки таблицы 
 */
 function templateColMonthRowOne(countWorkingDay) {
    return `
        <th class="table-header-tree" colspan="3"> </th>
        <th class="table-header-tree" colspan="1">
            ${countWorkingDay || "&ndash;"}
        </th>
    `;
}


/**
 * Возвращает HTML-код одной колонки (месяца) второй строки таблицы 
 * @param {string} month Название месяца
 * @returns {string} Возвращает HTML-код одной колонки (месяца) второй строки таблицы 
 */
 function templateColMonthRowTwo(month) {
    return `
        <th class="table-header-two" colspan="4">${month}</th>
    `;
}


/**
 * Возвращает HTML-код одной колонки (месяца) третьей строки таблицы 
 * @returns {string} Возвращает HTML-код одной колонки (месяца) третьей строки таблицы 
 */
 function templateColMonthRowTree() {
    return `
        <th class="table-header-tree" colspan="3">Факт</th>
        <th class="table-header-tree" colspan="1">План</th>
    `;
}


/**
 * Возвращает HTML-код одной колонки (месяца) четвертой строки таблицы 
 * @returns {string} Возвращает HTML-код одной колонки (месяца) четвертой строки таблицы 
 */
 function templateColMonthRowFour() {
    return `
        <th class="table-header-four-fact-meeting" colspan="1">Встречи</th>
        <th class="table-header-four-fact-calls" colspan="1">Звонки</th>
        <th class="table-header-four-fact-avgcalls" colspan="1">Среднее за день</th>
        <th class="table-header-four-plan-calls" colspan="1">Звонки в день</th>
    `;
}


/**
 * Возвращает HTML-код заголовка таблицы
 * @param {string} rowOne HTML-код - первой строки заголовка таблицы
 * @param {string} rowTwo HTML-код - второй строки заголовка таблицы
 * @param {string} rowTree HTML-код - третьей строки заголовка таблицы
 * @param {string} rowFour HTML-код - четвертой строки заголовка таблицы
 * @returns {string} HTML-код заголовка таблицы
 */
 function templateThead(rowOne, rowTwo, rowTree, rowFour, ) {
    return `
        <thead>
            <tr>
                ${rowOne}
            </tr>
            <tr>
                ${rowTwo}
            </tr>
            <tr>
                ${rowTree}
            </tr>
            <tr>
                ${rowFour}
            </tr>
        </thead>
    `;
}


/**
 * Возвращает HTML-код одной колонки (месяца) данных строки подразделения
 * @param {string} countMeeting Количество встреч
 * @param {string} countCalls Количество звонков
 * @param {string} countCallsAvg Среднее количество звонков в день за месяц
 * @param {string} countCallsPlan План звонков на день в месяц
 * @returns {string} HTML-код одной колонки (месяца) данных строки подразделения
 */
 function templateColMonthRowDepart(countMeeting, countCalls, countCallsAvg, countCallsPlan, cssMarker, numMonth, departId="") {
    return `
        <td class="table_by-month-border-left" data-month="${numMonth}">${countMeeting}</td> 
        <td data-month="${numMonth}">${countCalls}</td>
        <td data-month="${numMonth}">${countCallsAvg}</td>
        <td class="count-calls-depart-plan ${cssMarker}" data-month="${numMonth}" data-depart="${departId}">
            <div class="count-calls-depart-marker"></div>
            <div class="count-calls-depart">${countCallsPlan}</div>
        </td>
    `;
}


/**
 * Возвращает HTML-код строки руководителя подразделения
 * @param {string} contentHTML HTML-код - строки с статитсикой работников подразделения
 * @param {string} headDepart HTML-код - Фамилия + Имя руководителя подразделения
 * @returns {string} HTML-код строки руководителя подразделения
 */
 function templateRowDepart(contentHTML, headDepart, departId) {
    return `
        <tr class="head-department" data-depart-id="${departId}">
            <td class="table-by-month-first-column">${headDepart}</td>
            ${contentHTML}
        </tr>
    `;
}


/**
 * Возвращает HTML-код одной колонки (месяца) данных строки подразделения
 * @param {string} countMeeting Количество встреч
 * @param {string} countCalls Количество звонков
 * @param {string} countCallsAvg Среднее количество звонков в день за месяц
 * @param {string} countCallsPlan План звонков на день в месяц
 * @returns {string} HTML-код одной колонки (месяца) данных строки подразделения
 */
 function templateColMonthRowEmploye(params) {
    // Маркер при невыполнении плана
    let cssCellMarker = "";
    if (params.countCallsPlan != null && params.countCallsAvg != null && params.countCallsPlan > params.countCallsAvg) {
        cssCellMarker = "marker-display";
    }

    // Значение 
    let countCallsAvg = params.countCallsAvg == null ? "&ndash;" : params.countCallsAvg;

    // Значение ячейки "План по звонкам" для отображения
    let countCallsPlanVal = "";
    if (params.countCallsPlan != null) {
        countCallsPlanVal = params.countCallsPlan;
    }

    // HTML-код ячейки - "План по звонкам"
    let callsPlanHTML = "";
    if (params.edit) {
        callsPlanHTML = `
            <input type="text" value="${countCallsPlanVal}" class="count-calls-plan" data-month="${params.month}" data-employee="${params.user}" placeholder="...">
        `;
    } else {
        callsPlanHTML = `
            <div class="count-calls-depart">${countCallsPlanVal || "&ndash;"}</div>
        `;
    }
    
    // Стиль ячейки с комментариями
    let cssCellIsComments = "";
    if (params.countComments != 0) {
        cssCellIsComments = "is-comments";
    }
    
    return ` 
        <td class="table_by-month-border-left" data-depart-id="${params.departId}">${params.countMeeting}</td>
        <td class="meta-data ${cssCellIsComments}" data-date-start="${params.dateStart}" data-date-end="${params.dateEnd}" data-depart-id="${params.departId}">
            <div class="count-comments">${params.countComments}</div>
            ${params.countCalls}
        </td>
        <td data-depart-id="${params.departId}">${countCallsAvg}</td>
        <td class="${cssCellMarker}" data-depart-id="${params.departId}">
            <div class="count-calls-depart-marker"></div>
            ${callsPlanHTML}
        </td>
    `;
}


/**
 * Возвращает HTML-код строки сотрудника
 * @param {string} contentHTML HTML-код - строки с статитсикой работника подразделения
 * @param {number} departId ID подразделения
 * @param {number} userId ID сотрудника
 * @param {string} user Фамилия + Имя сотрудника
 * @returns {string} HTML-код строки сотрудника
 */
 function templateRowEmploye(contentHTML, departId, userId, user) {
    return `
        <tr data-depart-id="${departId}" data-user-id="${userId}">
            <td class="table-by-month-first-column">${user}</td>
            ${contentHTML}
        </tr>
    `;
}


export {
    templateColMonthRowOne, 
    templateColMonthRowTwo, 
    templateColMonthRowTree, 
    templateColMonthRowFour, 
    templateThead,
    templateColMonthRowDepart,
    templateRowDepart,
    templateColMonthRowEmploye,
    templateRowEmploye,
};













































