

/**
 * Возвращает HTML-код заголовка таблицы
 * @returns {string} Возвращает HTML-код заголовка таблицы
 */
 function templatePermissionHead() {
    return `
        <thead>
            <tr>
                <th scope="col" colspan="3">Отдел</th>
            </tr>
            <tr>
                <th scope="col">Сотрудник</th>
                <th scope="col">Доступ к таблице <sup>[1]</sup></th>
                <th scope="col">Доступ к настройкам <sup>[2]</sup></th>
                <th scope="col">Доступ к изменению статуса дня <sup>[3]</sup></th>
                <th scope="col">Доступ к верификации сообщений <sup>[4]</sup></th>
            </tr>
        </thead>
    `;
}


/**
 * Возвращает HTML-код подразделения таблицы редактирования прав доступа
 * @param {number} id Идентификатор подразделения
 * @param {string} title Название подразделения
 * @param {string} usersHTML HTML-код списка строк таблицы редактирования прав доступа
 * @returns {string} Возвращает HTML-код подразделения таблицы редактирования прав доступа
 */
 function templatePermissionDepartment(id, title, usersHTML="") {
    return `
        <tbody data-depart-id="${id}">
            <tr class="permission-department">
                <td colspan="3">
                    <p href="#" class="permission-department-href">${title}</p>
                    <div id="floatingCirclesG">
                        <div class="f_circleG" id="frotateG_01"></div>
                        <div class="f_circleG" id="frotateG_02"></div>
                        <div class="f_circleG" id="frotateG_03"></div>
                        <div class="f_circleG" id="frotateG_04"></div>
                        <div class="f_circleG" id="frotateG_05"></div>
                        <div class="f_circleG" id="frotateG_06"></div>
                        <div class="f_circleG" id="frotateG_07"></div>
                        <div class="f_circleG" id="frotateG_08"></div>
                    </div>
                    <div class="department-status-collapse permission-department-href"><i class="bi bi-chevron-down permission-department-href"></i></div>
                </td>
            </tr>
            ${usersHTML}
        </tbody>
    `;
}


/**
 * Возвращает HTML-код одной строки таблицы редактирования прав доступа
 * @param {number} id Идентификатор сотрудника
 * @param {string} lastname Фамилия сотрудника
 * @param {string} name Имя сотрудника
 * @param {number} accessTable Право на редактирование таблицы: 0, 1, 2
 * @param {boolean} accessSettings Доступ к настройкам
 * @returns {string} Возвращает HTML-код одной строки таблицы редактирования прав доступа
 */
 function templatePermissionUser(id, lastname, name, accessTable, accessSettings, accessStatusDay=false, accessVerificationMsg=false) {
    let accessTableRead  = accessTable == 0 ? "selected" : "";
    let accessTableLimit = accessTable == 1 ? "selected" : "";
    let accessTableFull  = accessTable == 2 ? "selected" : "";
    let accessSettingsTrue = accessSettings ? "selected" : "";
    let accessSettingsFalse = accessSettings ? "" : "selected";
    let accessStatusDayTrue = accessStatusDay ? "selected" : "";
    let accessStatusDayFalse = accessStatusDay ? "" : "selected";
    let accessVerificationMsgTrue = accessVerificationMsg ? "selected" : "";
    let accessVerificationMsgFalse = accessVerificationMsg ? "" : "selected";
    return `
        <tr class="permission-user-tr row-collaps" data-user-id="${id}">
            <td scope="row">
                <div>${lastname} ${name}</div>
            </td>
            <td>
                <select class="select-access-table" aria-label="">
                    <option value="0" ${accessTableRead} >&#128270; &nbsp; Читатель</option>
                    <option value="1" ${accessTableLimit}>&#8987; &nbsp; Редактор (ограниченнно)</option>
                    <option value="2" ${accessTableFull} >&#9997; &nbsp; Редактор</option>
                </select>
            </td>
            <td>
                <select class="select-access-settings" aria-label="">
                    <option value="0" ${accessSettingsFalse}>&#10060; &nbsp; Запрещен</option>
                    <option value="1" ${accessSettingsTrue}>&#9989; &nbsp; Разрешен</option>
                </select>
            </td>
            <td>
                <select class="select-access-status-day" aria-label="">
                    <option value="0" ${accessStatusDayFalse}>&#10060; &nbsp; Запрещен</option>
                    <option value="1" ${accessStatusDayTrue}>&#9989; &nbsp; Разрешен</option>
                </select>
            </td>
            <td>
                <select class="select-access-verification-msg" aria-label="">
                    <option value="0" ${accessVerificationMsgFalse}>&#10060; &nbsp; Запрещен</option>
                    <option value="1" ${accessVerificationMsgTrue}>&#9989; &nbsp; Разрешен</option>
                </select>
            </td>
        </tr>
    `;
}


export {templatePermissionHead, templatePermissionDepartment, templatePermissionUser, };




