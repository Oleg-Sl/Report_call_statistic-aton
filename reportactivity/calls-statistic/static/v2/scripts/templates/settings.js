
/**
 * Возвращает HTML-код строки пользователя для окна редактирования прав доступа
 * @param {number} id Идентификатор пользователя
 * @param {string} last_name Фамилия пользователя
 * @param {string} name Имя пользователя
 * @param {number} allowedEdit Права на редактирования таблицы: 0 - запрещено, 1 - ограниченно разрешено, 2 - разрешено
 * @param {boolean} allowedSettings Права на доступ к настрокам приложения: true - разрешено, false - запрещено
 * @returns {string} Возвращает HTML-код строки пользователя для окна редактирования прав доступа
 */
function templateUsersAllowedUserTR(id, last_name, name, allowedEdit, allowedSettings) {
    let selectEditOne = "";
    let selectEditTwo = "";
    let selectSettings = "";
    if (allowedEdit == 1) selectEditOne = "selected";
    if (allowedEdit == 2) selectEditTwo = "selected";
    if (allowedSettings) selectSettings = "selected";

    return `
        <tr data-userid=${id}>
            <td scope="row">
                <div>${last_name} ${name}</div>
            </td>
            <td>
                <select class="form-select form-select-sm selectedit" aria-label="">
                    <option value="0">Читатель</option>
                    <option ${selectEditOne} value="1">Ограниченно разрешено</option>
                    <option ${selectEditTwo} value="2">Разрешено</option>
                </select>
            </td>
            <td>
                <select class="form-select form-select-sm selectsettings" aria-label="">
                    <option value="0">Запрещен</option>
                    <option ${selectSettings} value="1">Разрешен</option>
                </select>
            </td>
        </tr>
    `;
}

/**
 * Возвращает HTML-код подразделения для окна редактирования прав доступа
 * @param {number} id Идентификатор подразделения
 * @param {string} title Название подразделения
 * @returns {string} Возвращает HTML-код подразделения для окна редактирования прав доступа
 */
function templateUsersAllowedDepartItem(id, title) {
    return `
        <div class="modal-settings-app-usersallowed-item" data-depart="${id}">
            <div>
                <a class="modal-settings-app-usersallowed-depart" data-bs-toggle="collapse" href="#collapseUsersallowed${id}" data-depart="${id}" data-status="" role="button" aria-expanded="false" aria-controls="collapseExampleUsersallowed">
                    ${title}
                </a>
            </div>
            <div class="collapse" id="collapseUsersallowed${id}">
                <ul class="list-group">
                    <li class="list-group-item">
                        <table class="">
                            <thead>
                                <tr>
                                    <th scope="col">Пользователь</th>
                                    <th scope="col">Права на таблицу</th>
                                    <th scope="col">Доступ к настройкам</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </li>

                </ul>
            </div>
        </div>
    `;
}


export {templateUsersAllowedUserTR, templateUsersAllowedDepartItem, };
