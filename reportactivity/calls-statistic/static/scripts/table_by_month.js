
export default class TableByMonth {
    constructor(container, requests) {
        this.container = container;
        this.requests = requests;
        this.data = null;
        this.countWorking = null;
        this.summaryData = {};

        this.monthList = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

        this.initHandler();
        this.handlerDragnDrop();
        this.stickyFirstLine();
        
    }

    initHandler() {
        this.container.addEventListener("change", async (event) => {
            // ввод количества рабочих дней
            if (event.target.classList.contains("count-working-days")) {
                let month = event.target.dataset.month;
                let value = event.target.value;
                this.saveCountWorkingDays(month, value);
            }
            // ввод плана по звонкам
            if (event.target.classList.contains("count-calls-plan")) {
                let month = event.target.dataset.month;
                let employee = event.target.dataset.employee;
                let countCallsPlan = event.target.value;
                await this.saveCountCallsPlan(month, employee, countCallsPlan);

                this.updateCountCalls(event.target);                                        // обноление планируемого количества звонков по отделу
            }
        })

        // обработчик горизантального скролла таблицы - залипание первого столбца таблицы
        this.container.addEventListener('scroll', (event)=>{
            let offsetLeft = event.target.scrollLeft;
            $('.table-by-month-first-column').css({
                "left": offsetLeft
            })
        });
    }

    verificationUpdatePlan(month) {
        let actualDate = new Date();
        let date = new Date(this.year, month, this.deadline);

        if (actualDate > date || !this.allowEdit) {
            return false;
        }
        return true;
    }

    verificationUpdateCountDays(month) {
        if (!this.allowEdit) {
            return false;
        }
        return true;
    }

    // обноление планируемого количества звонков по отделу
    updateCountCalls(element) {
        let countCallsByDepart = 0;
        let month = element.dataset.month;
        let depart = element.dataset.depart;
        let elementsList = this.container.querySelectorAll(`.count-calls-plan[data-month="${month}"][data-depart="${depart}"]`);

        for (let elemInput of elementsList) {
            countCallsByDepart += +elemInput.value;
        }

        let elementsCountCallsDepart = this.container.querySelector(`.count-calls-depart-plan[data-month="${month}"][data-depart="${depart}"] .count-calls-depart`);        
        elementsCountCallsDepart.innerText = countCallsByDepart;
    }

    // обновление данных таблицы
    render(data, countWorking, year, deadline, allowEdit, allowEditAll) {
        // console.log("MONTH");
        /**
        * this.data = [
        *     {
        *         departId: '107', 
        *         headId: '1047', 
        *         headName: 'Ирина', 
        *         headLastname: 'Аксинина', 
        *         data: [
        *             {
        *                 ID: 1047, LAST_NAME: 'Аксинина', NAME: 'Ирина', URL: 'https://atonlab.bitrix24.ru/company/personal/user/1047/', 
        *                 data_by_month: {
        *                     1:  {calls: [{ID: 264, COMPANY_ID: 10049, DURATION: 109, FILES: 'url', END_TIME: '2022-01-28T09:00:09Z'}, ...], count_calls: 11, meeting: [], count_meeting: 0, count_calls_plan: null},
        *                     2: ...,
        *                     ...,
        *                     12: ...
        *                 }
        *             }, 
        *             ...
        *         ]
        *     }, 
        *     ...
        * ]
        */
        this.data = data;
        /**
        * this.countWorking = [
        *     {
        *         "id": 2,
        *         "month": 2,
        *         "date_count_working": "2022-02-01",
        *         "count_working_days": 19
        *     },
        *     ...
        * ]
        */
        this.countWorking = countWorking;
        this.year = year;
        this.deadline = deadline;
        this.allowEdit = allowEdit;
        this.allowEditAll = allowEditAll;
        
        this.renderTable();
        $('.table-by-month-first-column').css({
            "left": this.container.scrollLeft
        })
    }

    // вывод данных в таблицу
    renderTable() {
        let contentHTML = "";
        contentHTML += this.renderThead();
        contentHTML += this.renderTbody();
        contentHTML += this.renderTfooter();
        this.container.innerHTML = contentHTML;
    }
    
    // вывыод заголовка таблицы
    renderThead() {
        let rowOne = `<th class="table-header table-by-month-first-column" colspan="1" rowspan="4"></th>`;
        let rowTwo = "";
        let rowTree = "";
        let rowFour = "";
        for (let numMonth in this.monthList) {
            let countWorkingDay = this.getCountWorkingDay(+numMonth + 1);
            let contentCountWorkingDays = "";
            if (this.verificationUpdateCountDays()) {
                contentCountWorkingDays = `<input type="text" value="${countWorkingDay || ''}" class="count-working-days" data-month="${+numMonth + 1}" placeholder="...">`
            } else {
                contentCountWorkingDays = countWorkingDay || "&ndash;";
            }
            rowOne += `
                <th class="table-header-tree" colspan="3"> </th>
                <th class="table-header-tree" colspan="1">
                    ${contentCountWorkingDays}
                </th>
            `;
            rowTwo += `
                <th class="table-header-two" colspan="4">${this.monthList[numMonth]}</th>
            `;
            rowTree += `
                <th class="table-header-tree" colspan="3">Факт</th>
                <th class="table-header-tree" colspan="1">План</th>
            `;
            rowFour += `
                <th class="table-header-four-fact-meeting" colspan="1">Встречи</th>
                <th class="table-header-four-fact-calls" colspan="1">Звонки</th>
                <th class="table-header-four-fact-avgcalls" colspan="1">Среднее за день</th>
                <th class="table-header-four-plan-calls" colspan="1">Звонки в день</th>
            `;

            let keyMonth = String(+numMonth + 1);
            // создание данных для итога таблицы
            this.summaryData[keyMonth] = {
                meeting: 0,
                calls: 0,
                calls_avg: 0,
                calls_plan: 0
            }
        }

        let contentHTML = `
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

        return contentHTML;
    }

    // вывыод тела таблицы
    renderTbody() {
        let contentHTML = "";
        for (let depart of this.data) {
            contentHTML += this.renderRowHeadDepart(depart);
            contentHTML += this.renderRowEmployeeDepart(depart);
        }
        
        return `
            <tbody>
                ${contentHTML}            
            </tbody>
        `;
    }

    // вывод строки руководителя подразделения
    renderRowHeadDepart(depart) {
        let contentHTML = "";
        for (let numMonth in this.monthList) {
            let countMeetingMonth = this.getSumDepartMeetingMonth(depart.data, +numMonth + 1);  // фактическое количество встреч в месяц по отделлу
            let countCallsMonth = this.getSumDepartCallsMonth(depart.data, +numMonth + 1);      // фактическое количество звонков в месяц по отделлу
            let countCallsAvg = this.getAvgPerMonth(countCallsMonth, +numMonth + 1);            // среднее значение кол-ва звонков в день за месяц по отделлу
            let countCallsPlan = this.getSumDepartCallsMonthPlan(depart.data, +numMonth + 1);   // план по звонкам на на день по отделлу
            
            let cssClassCell = "";
            if (!isNaN(+countCallsAvg)) {
                cssClassCell = +countCallsPlan <= +countCallsAvg? "green-cell" : "red-cell";
            }
            
            contentHTML += `
                <td class="table_by-month-border-left">${countMeetingMonth}</td> 
                <td>${countCallsMonth}</td>
                <td>${countCallsAvg}</td>
                <td class="count-calls-depart-plan ${cssClassCell}" data-depart="${depart.departId}"  data-month="${+numMonth + 1}">
                    <div class="count-calls-depart-marker"></div>
                    <div class="count-calls-depart">${countCallsPlan}</div>
                </td>
            `;
        }

        return `
            <tr class="head-department">
                <td class="table-by-month-first-column">${depart.headLastname} ${depart.headName}</td>
                ${contentHTML}
            </tr>
        `;
    }

    // вывод списка сотрудников подразделения
    renderRowEmployeeDepart(depart) {
        let contentHTML = "";

        for (let dataEmployee of depart.data) {
            let contentEmploeeHTML = "";
            if (depart.headId == dataEmployee.ID) {
                continue;
            }

            for (let numMonth in this.monthList) {
                let cssClassCell = "";
                let keyMonth = String(+numMonth + 1);

                let countMeeting = +dataEmployee.data_by_month[keyMonth]["count_meeting"];                  // кол-во встреч
                let countCalls = +dataEmployee.data_by_month[keyMonth]["count_calls"];                      // фактическое кол-во звонков
                let countCallsAvg = this.getAvgPerMonth(countCalls, +numMonth + 1);                         // среднее кол-во звонков в день
                let countCallsPlan = dataEmployee.data_by_month[keyMonth]["count_calls_plan"];              // план по звонкам в день

                if (!isNaN(+countCallsAvg)) {
                    this.summaryData[keyMonth]["calls_avg"] += +countCallsAvg;
                }
                
                if (!isNaN(+countCallsAvg) && countCallsPlan != null) {
                    cssClassCell = +countCallsPlan <= +countCallsAvg? "green-cell" : "red-cell";
                }

                let countCallsPlanVal = "";
                if (countCallsPlan != null) {
                    countCallsPlanVal = countCallsPlan;
                }
                
                let readonly = this.verificationUpdatePlan(numMonth) ? "readonly" : "";
        
                let contentCallsPlan = "";
                if (readonly || this.allowEditAll) {
                    contentCallsPlan = `
                        <input type="text" value="${countCallsPlanVal}" class="count-calls-plan" data-depart="${depart.departId}"  data-month="${keyMonth}" data-employee="${dataEmployee.ID}" placeholder="...">
                    `;
                } else {
                    contentCallsPlan = `
                        <div class="count-calls-depart">${countCallsPlanVal || "&ndash;"}</div>
                    `;
                }
                
                contentEmploeeHTML += `
                    <td class="table_by-month-border-left">${countMeeting}</td>
                    <td>${countCalls}</td>
                    <td>${countCallsAvg}</td>
                    <td class="${cssClassCell}">
                        <div class="count-calls-depart-marker"></div>
                        ${contentCallsPlan}
                    </td>
                `;

                this.summaryData[keyMonth]["meeting"] += countMeeting;
                this.summaryData[keyMonth]["calls"] += countCalls;
                // this.summaryData[keyMonth]["calls_avg"] += countCallsAvg;
                this.summaryData[keyMonth]["calls_plan"] += +countCallsPlan;
            }

            contentHTML += `
                <tr>
                    <td class="table-by-month-first-column">${dataEmployee.LAST_NAME} ${dataEmployee.NAME}</td>
                    ${contentEmploeeHTML}
                </tr>
            `;
        }

        return contentHTML;  
    }

    // вывод итога таблицы
    renderTfooter() {
        let contentHTML = "";
        let actualDate = new Date();

        for (let numMonth in this.monthList) {
            let keyMonth = String(+numMonth + 1);
            let date = new Date(this.year, numMonth, 1);
            let ccount_avg = "&ndash;";
            if (actualDate > date) {
                ccount_avg = this.getAvgPerMonth(this.summaryData[keyMonth]["calls"], +numMonth + 1)
            }

            contentHTML += `
                <td class="table_by-month-border-left">${this.summaryData[keyMonth]["meeting"]}</td>
                <td>${this.summaryData[keyMonth]["calls"]}</td>
                <td>${ccount_avg}</td>
                <td>${this.summaryData[keyMonth]["calls_plan"]}</td>
            `;
        }

        return `
            <tr class="footer-departments">
                <td class="table-by-month-first-column">Итого</td>
                ${contentHTML}
            </tr>
        `;
    }


    // возвращает сумму встреч по подразделению за месяц
    getSumDepartMeetingMonth(listDataEmployeeDepart, month) {
        let keyMonth = String(month);
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            accum += dataEmployee.data_by_month[keyMonth]["count_meeting"];
        }

        return accum;
    }

    // возвращает сумму звонков по подразделению за месяц
    getSumDepartCallsMonth(listDataEmployeeDepart, month) {
        let keyMonth = String(month);
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            accum += dataEmployee.data_by_month[keyMonth]["count_calls"];
        }

        return accum;
    }

    // возвращает сумму плана звонков по подразделению за месяц
    getSumDepartCallsMonthPlan(listDataEmployeeDepart, month) {
        let keyMonth = String(month);
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            let countMeeting = dataEmployee.data_by_month[keyMonth]["count_calls_plan"];
            if (countMeeting) {
                accum += countMeeting;
            }
        }

        return accum;
    }

    // количество рабочих дней в месяце
    getCountWorkingDay(month) {
        let result = this.countWorking.find(item => item.month == month);
        if (result) {
            return result.count_working_days;
        }
    }

    // среднее число за месяц
    getAvgPerMonth(count, month) {
        let actualDate = new Date();
        let date = new Date(this.year, month, 1);

        if (actualDate > date) {
            let avg = count / this.getCountWorkingDay(month);
            return avg.toFixed(0);
        }

        return "&ndash;";
    }



    // событие сохранения количества рабочих дней в месяц
    async saveCountWorkingDays(month, value) {
        let method = "count-working-days";
        let date = `${this.year}-${toFixedTwoSimbol(month)}-01`;
        let data = {
            "date_count_working": date,
            "count_working_days": value,
        }
        let result = await this.requests.POST(method, data);
    }

    // событие сохранения плана по звонкам на день
    async saveCountCallsPlan(month, employee, countCallsPlan) {
        let method = "calling-plan";
        let date = `${this.year}-${toFixedTwoSimbol(month)}-01`;
        let data = {
            date_plan_calls: date,
            count_calls: countCallsPlan || null,
            employee
        }
        let result = await this.requests.POST(method, data);
        console.log("result = ", result);
    }
    
    // обработчик перетаскивания таблицы по нажатию кнопки мыши
    handlerDragnDrop() {
        this.container.addEventListener("mousedown", (event) => {
            if (event.target.tagName == "A" || event.which !== 1) {
                return;
            }
            let elem = this.container;
            let elemCursor = document.getElementsByTagName("body")[0];
            elem.onselectstart = () => false;
            elemCursor.style.cursor = "grab";
            // стартовая позиция курсора на экране
            let cursorStart = {
                "X": event.pageX, 
                "Y": event.pageY
            }
            // координаты таблицы на странице
            let scrollStart = {
                "X": elem.scrollLeft,
                "Y": elem.scrollTop
            }
            // максимальное значение ScrolLeft
            let maxScrollWidth = elem.scrollWidth - elem.offsetWidth;
            // функция перемещения таблицы по горизонтали
            function onMouseMove(event) {
                if (event.which !== 1) {
                    disabledDragDrop();
                }
                let offset = scrollStart.X - event.pageX + cursorStart.X;
                if (offset < 0) {
                    offset = 0;
                }
                if (offset > maxScrollWidth) {
                    offset = maxScrollWidth;
                }
                elem.scrollLeft = offset;
            }
            // установка обработчика перемещения мыши
            document.addEventListener('mousemove', onMouseMove);
    
            // событие при отпускании кнопки мыши
            document.addEventListener("mouseup", (event) => {
                disabledDragDrop();
            })

            function disabledDragDrop() {
                document.removeEventListener('mousemove', onMouseMove);
                $("table").onmouseup = null;
                elemCursor.style.cursor = "default";
            };
    
        })
    }

    // фиксирование заголовка таблицы при вертикальной прокрутке
    stickyFirstLine() {
        requestAnimationFrame(tick);
        let table = this.container;
        function tick(timestamp) {
            // let elem = document.getElementsByTagName("table")[0];
            let offsetTop = $(document).scrollTop();
            if (table.offsetTop < offsetTop) {
                $('#tableStatisticMonth th').css({
                    "top": offsetTop - table.offsetTop
                })
            }
            else {
                $('#tableStatisticMonth th').css({"top": 0})
            }

            requestAnimationFrame(tick);
        }
    }
}

function toFixedTwoSimbol(numb) {
    if (+numb < 10) {
        return "0" + numb
    }
    return numb;
}



