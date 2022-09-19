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
                <th class="table-header table-by-day-fixed-column" colspan="1" rowspan="2" style="grid-row: 1/3;"></th>
                <th class="table-header table-by-day-fixed-column" colspan="2" rowspan="2" style="grid-column: 2/4; grid-row: 1/3;">Факт по дням</th>
                ${rowOne}
            </tr>
            <tr>
                ${rowTwo}
            </tr>
            <tr>
                <th class="table-header-tree table-by-day-fixed-column" colspan="1">План компания</th>
                <th class="table-header-tree table-by-day-fixed-column" colspan="1" style="grid-row: 3/5; grid-column:2/3;">Выполн.</th>
                <th class="table-header-tree table-by-day-fixed-column" colspan="1" style="grid-row: 3/5; grid-column:3/4;">Не выполн.</th>
                ${rowTree}
            </tr>
            <tr>
                <th class="table-header-four table-by-day-fixed-column" colspan="1">Факт компания</th>
                ${rowFour}
            </tr>
        </thead>
    `;
}


/**
 * Возвращает HTML-код одной колонки (дня) первой строки таблицы 
 * @param {string} title Название колонки - номер дня и месяца
 * @param {number} colStart Номер столбца с котрого начинается столбец
 * @param {number} colEnd Номер столбца до котрого продолжается столбец
 * @returns {string} Возвращает HTML-код одной колонки (дня) первой строки таблицы 
 */
 function templateTheadColumnDayRowOne(title, colStart, colEnd) {
    return `
        <th colspan="2" style="grid-column: ${colStart}/${colEnd};">${title}</th>
    `;
}


/**
 * Возвращает HTML-код одной колонки (дня) второй строки таблицы 
 * @returns {string} Возвращает HTML-код одной колонки (дня) второй строки таблицы 
 */
 function templateTheadColumnDayRowTwo() {
    return `
        <th class="table-header-two" colspan="1">Встречи</th>
        <th class="table-header-two" colspan="1">Звонки</th>
    `;
}


/**
 * Возвращает HTML-код одной колонки (дня) третьей строки таблицы
 * @param {number} countCallsPlan Название колонки - планируемое количество звонков
 * @returns {string} Возвращает HTML-код одной колонки (дня) третьей строки таблицы 
 */
 function templateTheadColumnDayRowTree(countCallsPlan) {
    return `
        <th class="table-header-tree" colspan="1"></th>
        <th class="table-header-tree" colspan="1">${countCallsPlan}</th>
    `;
}


/**
 * Возвращает HTML-код одной колонки (дня) четвертой строки таблицы
 * @param {number} countCallsPlan Название колонки - планируемое количество звонков
 * @returns {string} Возвращает HTML-код одной колонки (дня) четвертой строки таблицы 
 */
 function templateTheadColumnDayRowFour(countMeetingFact, countCallsFact, cssMarkerCell) {
    return `
        <th class="table-header-four" colspan="1">${countMeetingFact}</th>
        <th class="table-header-four ${cssMarkerCell}" colspan="1">
            <div class="count-calls-depart-marker"></div>
            <div class="count-calls-depart">${countCallsFact}</div>
        </th>
    `;
}


/**
 * Возвращает HTML-код строки руководителя подразделения
 * @param {string} head Фамилия + Имя руклводителя подразделения
 * @param {number} departId ID подразделения в Битрикс
 * @param {number} countDaysPlanIsCompleted Количество дней выполненного плана по подразделению
 * @param {number} countDaysPlanNotIsCompleted Количество дней не выполненного плана по подразделению
 * @param {string} contentHTML HTML-код - строки с статитсикой подразделения
 * @returns {string} HTML-код строки руководителя подразделения
 */
 function templateTbodyRowDepart(head, departId, countDaysPlanIsCompleted, countDaysPlanNotIsCompleted, contentHTML) {
    return `
        <tr class="head-department" data-depart-id="${departId}">
            <td class="table-by-day-first-column table-by-day-fixed-column table_by-day-border-right">${head}</td>
            <td class="table-by-day-fixed-column">${countDaysPlanIsCompleted}</td>
            <td class="table-by-day-fixed-column table_by-day-border-right">${countDaysPlanNotIsCompleted}</td>
            ${contentHTML}
        </tr>
    `;
}


/**
 * Возвращает HTML-код одной колонки (дня) данных строки подразделения
 * @param {number} countMeeting Количество встреч
 * @param {number} countCalls Количество звонков
 * @param {string} cssMarker CSS стиль ячейки - "количество звонков"
 * @returns {string} HTML-код одной колонки (дня) данных строки подразделения
 */
 function templateTbodyColumnDayRowDepart(countMeeting, countCalls, cssMarker) {
    return `
        <td class="table_by-day-border-left">${countMeeting}</td> 
        <td class="${cssMarker}">
            <div class="count-calls-depart-marker"></div>
            <div class="count-calls-depart">${countCalls}</div>
        </td>
    `;
}


/**
 * Возвращает HTML-код строки сотрудника
 * @param {string} employe Фамилия + Имя сотрудника
 * @param {number} employeId ID сотрудника в Битрикс
 * @param {number} countDaysPlanIsCompleted Количество дней выполненного плана сотрудника
 * @param {number} countDaysPlanNotIsCompleted Количество дней не выполненного плана сотрудника
 * @param {string} contentHTML HTML-код - строки с статитсикой сотрудника
 * @returns {string} HTML-код строки сотрудника
 */
 function templateTbodyRowEmploye(employe, employeId, countDaysPlanIsCompleted, countDaysPlanNotIsCompleted, contentHTML) {
    return `
        <tr data-user-id="${employeId}">
            <td class="table-by-day-first-column table-by-day-fixed-column table_by-day-border-right">${employe}</td>
            <td class="table-by-day-fixed-column">${countDaysPlanIsCompleted}</td>
            <td class="table-by-day-fixed-column table_by-day-border-right">${countDaysPlanNotIsCompleted}</td>
            ${contentHTML}
        </tr>
    `;
}


/**
 * Возвращает HTML-код одной колонки (дня) данных строки подразделения
 * @param {number} countMeeting Количество встреч
 * @param {number} countCalls Количество звонков
 * @param {string} cssMarker CSS стиль ячейки - "количество звонков"
 * @returns {string} HTML-код одной колонки (дня) данных строки подразделения
 */
 function templateTbodyColumnDayRowEmploye(countMeeting, countCalls, countComments, date, cssMarker, cssIsComments, styleMarkerPlanTrue, countCallsPlan) {
    return `
        <td class="table_by-day-border-left" data-date="${date}">
            ${countMeeting}
        </td>
        <td class="meta-data ${cssMarker} ${cssIsComments}" data-date="${date}" title="План по звонкам: ${countCallsPlan}">
            <div class="count-comments">${countComments}</div>
            <div class="count-calls-depart-marker ${styleMarkerPlanTrue}"></div>
            <div class="count-calls-depart">${countCalls}</div>
        </td>
    `;
}

export {
    templateThead,
    templateTheadColumnDayRowOne,
    templateTheadColumnDayRowTwo,
    templateTheadColumnDayRowTree,
    templateTheadColumnDayRowFour,

    templateTbodyRowDepart,
    templateTbodyColumnDayRowDepart,
    templateTbodyRowEmploye,
    templateTbodyColumnDayRowEmploye,

};



