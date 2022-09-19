

/**
 * Возвращает HTML-код подразделений
 * @param {string} departListHTML HTML-код - список подразделений
 * @returns {string} Возвращает HTML-код подразделений
 */
 function templateDepartUl(departListHTML) {
    return `
        <ul class="list-group">
            ${departListHTML}
        </ul>
    `;
}


/**
 * Возвращает HTML-код подразделения
 * @param {number} id Идентификатор подразделнния
 * @param {string} name Название подразделения
 * @param {string} childrenDepartListHTML HTML-код - списка дочерних подразделений
 * @returns {string} Возвращает HTML-код подразделения
 */
 function templateDepartLi(id, name, childrenDepartListHTML) {
    return `
        <li class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" data-department="${name}" value='${id}' aria-label="...">${name}
            ${childrenDepartListHTML}
        </li>
    `;
}



/**
 * Возвращает HTML-код подразделения
 * @param {number} id Идентификатор подразделнния
 * @param {string} name Название подразделения
 * @param {string} usersListHTML HTML-код - списка пользователя подразделений
 * @returns {string} Возвращает HTML-код подразделения
 */
 function templateDepartEmploye(id, name, usersListHTML) {
    return `
        <div class="modal-settings-app-usersdepart-item" data-depart_id=${id}>
            <div>
                <a class="" data-bs-toggle="collapse" href="#collapseExample${id}" role="button" aria-expanded="false" aria-controls="collapseExample${id}">
                    ${name}
                </a>
            </div>
            <div class="collapse" id="collapseExample${id}">
                <ul class="list-group">
                    ${usersListHTML}
                </ul>
            </div>
        </div>
    `;
}

/**
 * Возвращает HTML-код сотрудника
 * @param {number} id Идентификатор сотрудника
 * @param {string} lastname Фамилия сотрудника
 * @param {string} name Имя сотрудника
 * @param {string} checked Заполнение тега INPUT
 * @returns {string} Возвращает HTML-код сотрудника
 */
 function templateDepartEmployeUser(id, lastname, name, checked) {
    return `
        <li class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value='${id}' aria-label="..." ${checked}>
            ${lastname} ${name}
        </li>
    `;
}




export {templateDepartUl, templateDepartLi, templateDepartEmploye, templateDepartEmployeUser, };


