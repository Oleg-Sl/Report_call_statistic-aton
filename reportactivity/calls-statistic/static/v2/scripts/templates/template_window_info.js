
/**
 * Возвращает HTML-код элемента одного комментария
 * @param {string} user Фамилия + Имя отправителя
 * @param {string} comment Текст комментария
 * @param {string} date Дата создания комментария
 * @returns {string} HTML-код элемента одного комментария
 */
 function templateCommentsItem(id, user, comment, date, hrefUser, verified, verifiedUser, verifiedDate) {
    let styleVrified = verified ? "comment-verified-true" : "";
    let verifiedTitle = verified ? `${verifiedUser || ""} (${verifiedDate || ""})` : "";
    return `
        <div class="comment" data-id="${id}">
            <div class="comment-verified ${styleVrified}">
                <span><i class="bi bi-check-all comment-verified-i" data-bs-toggle="tooltip" data-bs-placement="top" title="${verifiedTitle}"></i></span>
            </div>
            <div class="comment-recipient">
                <span class="path-href" data-href="${hrefUser}">${user}</span>
            </div>
            <div class="comment-text-content">
                ${comment}
            </div>
            <div class="comment-date">
                <span>${date}</span>
            </div>
        </div>
    `;
}


/**
 * Возвращает HTML-код элемента одной записи звонка
 * @param {string} owner Название типа связанной сущности (ЛИД/СДЕЛКА/КОНТАКТ/КОМПАНИЯ)
 * @param {string} ownerTitle Название связанной сущности
 * @param {string} hrefOwner Путь внутри портала Б24 к связанной сущности
 * @param {string} hrefCompany Путь внутри портала Б24 к компании
 * @param {string} phone Номер телефона
 * @param {number} duration Длительность телефонного звонка
 * @param {string} date Дата звонка
 * @returns {string} HTML-код элемента одной записи звонка
 */
function templateCallsItem(owner, ownerTitle, hrefOwner, hrefCompany, phone, duration, date) {
    return `
        <div class="calls-item">
            <div class="company" data-href="${hrefOwner}">
                <span>${owner || "-"}: </span> <a class="path-href" href="${hrefOwner}" onclick="event.preventDefault()">${ownerTitle || "-"}</a>
            </div>
            <div class="related-entity" data-href="${hrefCompany}">
                <span>URL компании: </span><a class="path-href" href="${hrefCompany}" onclick="event.preventDefault()">${hrefCompany}</a>
            </div>
            <div class="data-col-2">
                <div class="phone">
                    <span>Телефон: </span> ${phone || "-"}
                </div>
                <div class="duration">
                    <span>Длительность:</span> ${duration || "-"}
                </div>
            </div>
            <div class="date">
                <span>Дата: </span> ${date}
            </div>
        </div>
    `;
}




export {templateCallsItem, templateCommentsItem, };




