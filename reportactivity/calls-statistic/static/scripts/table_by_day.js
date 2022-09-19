
export default class TableByDay {
    constructor(container, requests) {
        this.container = container;
        this.requests = requests;

        this.data = null;
        this.countWorking = null;

        this.summaryDataByDay = {};
        this.summaryDataMonth = {
            calls_plan: 0,
            calls_fact: 0
        };

        this.monthObj = {
            "1": "января", 
            "2": "февраля", 
            "3": "марта", 
            "4": "апреля", 
            "5": "мая", 
            "6": "июня", 
            "7": "июля", 
            "8": "августа", 
            "9": "сентября", 
            "10": "октября", 
            "11": "ноября", 
            "12": "декабря"
        };

        this.initHandler();
        this.handlerDragnDrop();
        this.stickyFirstLine();

    }

    initHandler() {
        // обработчик горизантального скролла таблицы - залипание первого столбца таблицы
        this.container.addEventListener('scroll', (event)=>{
            let offsetLeft = event.target.scrollLeft;
            $('.table-by-day-fixed-column').css({
                "left": offsetLeft
            })

        });
    }


    // обновление данных таблицы
    render(data, year, month, countWorking) {
        // console.log("DAYS");
        this.data = data;                                       // данные статистики
        this.countWorking = countWorking;                       // количество рабочих дней
        this.year = year;                                       // год статистических данных
        this.month = month;                                     // месяц статистических данных
        this.countDay = new Date(year, month, 0).getDate();     // количество дней в месяце

        this.initSummaryData();                                 // инициализация итоговых данных таблицы
        this.renderTable();
        $('.table-by-day-fixed-column').css({
            "left": this.container.scrollLeft
        })
    }

    // инициализация итоговых данных таблицы
    initSummaryData() {
        // инициализация итоговых данных за месяц
        this.summaryDataMonth = {
            calls_plan: 0,
            calls_fact: 0
        };
        // инициализация итоговых данных по дням месяца
        for (let num = 1; num <= this.countDay; num++) {
            let keyDay = String(num);
            this.summaryDataByDay[keyDay] = {
                calls_fact: 0,
                calls_plan: 0,
                meeting_fact: 0,
            };
        }
    }

    // вывод данных в таблицу
    renderTable() {
        let contentHTML = "";
        let contentTbodyHTML = this.renderTbody();              // формирование тела таблицы
        let contentTheadHTML = this.renderThead();              // формирование заголовка таблицы
        contentHTML += contentTheadHTML;
        contentHTML += contentTbodyHTML;
        this.container.innerHTML = contentHTML;
    }
    
    // формирование заголовка таблицы
    renderThead() {
        let styleGridTemplateColumns = ["200px", "65px", "65px", "65px"];
        let cssClassCellSummary = +this.summaryDataMonth.calls_plan <= +this.summaryDataMonth.calls_fact ? "green-cell" : "red-cell";
        let actualDate = new Date();

        let rowOne = `
            <th class="table-header table-by-day-fixed-column" colspan="1" rowspan="2" style="grid-row: 1/3;"></th>
            <th class="table-header table-by-day-fixed-column" colspan="3" rowspan="2" style="grid-column: 2/5; grid-row: 1/3;">Итого</th>
        `;
        let rowTwo = "";
        let rowTree = `
            <th class="table-header-tree table-by-day-fixed-column" colspan="1">План компания</th>
            <th class="table-header-tree table-by-day-fixed-column" colspan="1">План</th>
            <th class="table-header-tree table-by-day-fixed-column" colspan="1">Факт</th>
            <th class="table-header-tree table-by-day-fixed-column" colspan="1">Отклон.</th>
        `;
        let rowFour = `
            <th class="table-header-four table-by-day-fixed-column" colspan="1">Факт компания</th>
            <th class="table-header-four table-by-day-fixed-column" colspan="1">${this.summaryDataMonth.calls_plan}</th>
            <th class="table-header-four table-by-day-fixed-column ${cssClassCellSummary}" colspan="1">
                <div class="count-calls-depart-marker"></div>
                <div class="count-calls-depart">${this.summaryDataMonth.calls_fact}</div>
            </th>
            <th class="table-header-four table-by-day-fixed-column" colspan="1">${this.summaryDataMonth.calls_fact - this.summaryDataMonth.calls_plan}</th>
        `;
        
        for (let num = 1; num <= this.countDay; num++) {
            let keyDay = String(num);
            let date = new Date(this.year, +this.month - 1, num);
            let cssClassCell = "";
            
            if (actualDate > date) {
                cssClassCell = +this.summaryDataByDay[keyDay]["calls_plan"] <= +this.summaryDataByDay[keyDay]["calls_fact"] ? "green-cell" : "red-cell";;
            }

            rowOne += `
                <th colspan="2" style="grid-column: ${2 * num + 3}/${2 * num + 5};">${num} ${this.monthObj[this.month]}</th>
            `;
            rowTwo += `
                <th class="table-header-two" colspan="1">Встречи</th>
                <th class="table-header-two" colspan="1">Звонки</th>
            `;
            rowTree += `
                <th class="table-header-tree" colspan="1"></th>
                <th class="table-header-tree" colspan="1">${this.summaryDataByDay[keyDay]["calls_plan"]}</th>
            `;
            rowFour += `
                <th class="table-header-four" colspan="1">${this.summaryDataByDay[keyDay]["meeting_fact"]}</th>
                <th class="table-header-four ${cssClassCell}" colspan="1">
                    <div class="count-calls-depart-marker"></div>
                    <div class="count-calls-depart">${this.summaryDataByDay[keyDay]["calls_fact"]}</div>
                </th>
               
            `;
            this.summaryDataByDay[keyDay] = {
                calls_fact: 0,
                calls_plan: 0,
                meeting_fact: 0,
            };
            styleGridTemplateColumns.push("65px");
            styleGridTemplateColumns.push("65px");
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

        this.container.style.gridTemplateColumns = styleGridTemplateColumns.join(" ");
    
        return contentHTML;
    }

    // формирование тела таблицы
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
        let actualDate = new Date();
        for (let num = 1; num <= this.countDay; num++) {
            let date = new Date(this.year, +this.month - 1, num);
            let countCallsFactDepart = this.getSumDepartCallsDay(depart.data, num);         // сумма звонков по подразделению за день
            let countCallsPlanDepart = this.getSumDepartCallsDayPlan(depart.data);          // план звонков отдела на день
            let countMeetingDepart = this.getSumDepartMeetingDay(depart.data, num);         // сумма встреч по подразделению
            let cssClassCell = "";

            if (!isNaN(+countCallsPlanDepart) && actualDate > date) {
                cssClassCell = +countCallsPlanDepart <= +countCallsFactDepart ? "green-cell" : "red-cell";
            }

            contentHTML += `
                <td class="table_by-day-border-left">${countMeetingDepart}</td> 
                <td class="${cssClassCell}">
                    <div class="count-calls-depart-marker"></div>
                    <div class="count-calls-depart">${countCallsFactDepart}</div>
                </td>
            `;
        }

        let count_calls_fact = this.getSumDepartCallsMonthFact(depart.data);
        let count_calls_plan = this.getSumDepartCallsMonthPlan(depart.data);
        
        let cssClassCell = "";
        if (!isNaN(+count_calls_plan)) {
            cssClassCell = +count_calls_plan <= +count_calls_fact ? "green-cell" : "red-cell";
        }
        
        return `
            <tr class="head-department">
                <td class="table-by-day-first-column table-by-day-fixed-column">${depart.headLastname} ${depart.headName}</td>
                <td class="table-by-day-fixed-column">${count_calls_plan}</td>
                <td class="table-by-day-fixed-column ${cssClassCell}">
                    <div class="count-calls-depart-marker"></div>
                    <div class="count-calls-depart">${count_calls_fact}</div>
                </td>
                <td class="table-by-day-fixed-column">${count_calls_fact - count_calls_plan}</td>
                ${contentHTML}
            </tr>
        `;
    }

    // вывод списка сотрудников подразделения
    renderRowEmployeeDepart(depart) {
        let contentHTML = "";
        let actualDate = new Date();
        for (let dataEmployee of depart.data) {
            let contentEmploeeHTML = "";
            if (depart.headId == dataEmployee.ID) {
                continue;           // пропускаем пользователя, если он руководитель подразделения
            }

            // вывод статистики по дням месяца
            for (let num = 1; num <= this.countDay; num++) {
                let date = new Date(this.year, +this.month - 1, num);
                let keyDay = String(num);
                let cssClassCell = "";
                if (!isNaN(+dataEmployee.count_calls_plan) && actualDate > date) {
                    cssClassCell = +dataEmployee.count_calls_plan <= +dataEmployee.data_by_day[keyDay]["count_calls"] ? "green-cell" : "red-cell";;
                }
                contentEmploeeHTML += `
                    <td class="table_by-day-border-left">${dataEmployee.data_by_day[keyDay]["count_meeting"]}</td>
                    <td class="${cssClassCell}">
                        <div class="count-calls-depart-marker"></div>
                        <div class="count-calls-depart">${dataEmployee.data_by_day[keyDay]["count_calls"]}</div>
                    </td>
                `;
                this.summaryDataByDay[keyDay]["calls_fact"] += +dataEmployee.data_by_day[keyDay]["count_calls"];
                this.summaryDataByDay[keyDay]["calls_plan"] += +dataEmployee.count_calls_plan;
                this.summaryDataByDay[keyDay]["meeting_fact"] += +dataEmployee.data_by_day[keyDay]["count_meeting"];
            }

            // при отсутствии плана по звонкам вывод "-"
            let deviation = "&ndash;";
            if (dataEmployee.count_calls_plan) {
                deviation = dataEmployee.count_calls_fact - dataEmployee.count_calls_plan;
            }

            let calls_plan = 0;
            if (this.countWorking) {
                calls_plan += +dataEmployee.count_calls_plan * +this.countWorking;
            }
            
            let cssClassCell = "";
            if (!isNaN(+dataEmployee.count_calls_fact) && calls_plan) {
                cssClassCell = +calls_plan <= +dataEmployee.count_calls_fact ? "green-cell" : "red-cell";
            }
            
            contentHTML += `
                <tr>
                    <td class="table-by-day-first-column table-by-day-fixed-column">${dataEmployee.LAST_NAME} ${dataEmployee.NAME}</td>
                    <td class="table-by-day-fixed-column">${calls_plan || "&ndash;"}</td>
                    <td class="table-by-day-fixed-column ${cssClassCell}">
                        <div class="count-calls-depart-marker"></div>
                        <div class="count-calls-depart">${dataEmployee.count_calls_fact}</div>
                    </td>
                    <td class="table-by-day-fixed-column">${deviation}</td>
                    ${contentEmploeeHTML}
                </tr>
            `;

            this.summaryDataMonth.calls_plan += calls_plan;
            this.summaryDataMonth.calls_fact += +dataEmployee.count_calls_fact;
            
        }
      
        return contentHTML;  
    }

    // возвращает сумму встреч по подразделению за день
    getSumDepartMeetingDay(listDataEmployeeDepart, day) {
        let keyMonth = String(day);
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            accum += dataEmployee.data_by_day[keyMonth]["count_meeting"];
        }

        return accum;
    }

    // возвращает сумму звонков по подразделению за день
    getSumDepartCallsDay(listDataEmployeeDepart, day) {
        let keyMonth = String(day);
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            accum += dataEmployee.data_by_day[keyMonth]["count_calls"];
        }

        return accum;
    }

    getSumDepartCallsDayPlan(listDataEmployeeDepart) {
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            let count_calls_plan = dataEmployee.count_calls_plan || 0;
            accum += +count_calls_plan;
        }

        return accum;
    }

    // возвращает сумму звонков по подразделению за день
    getSumDepartCallsMonthFact(listDataEmployeeDepart) {
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            let count_calls_fact = dataEmployee.count_calls_fact || 0;
            accum += count_calls_fact;
        }

        return accum;
    }

    // возвращает сумму звонков по подразделению за день
    getSumDepartCallsMonthPlan(listDataEmployeeDepart) {
        let accum = 0;
        for (let dataEmployee of listDataEmployeeDepart) {
            let count_calls_plan = dataEmployee.count_calls_plan || 0;
            accum += +count_calls_plan * +this.countWorking;
        }

        return accum;
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
                // console.log("scrollStart.X = ", scrollStart.X);
                // console.log("event.pageX = ", event.pageX);
                // console.log("cursorStart.X = ", cursorStart.X);
                // console.log("offset = ", offset);
                // console.log("maxScrollWidth = ", maxScrollWidth);

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

    stickyFirstLine() {
        requestAnimationFrame(tick);
        let table = this.container;
        function tick(timestamp) {
            // let elem = document.getElementsByTagName("table")[0];
            let offsetTop = $(document).scrollTop();
            if (table.offsetTop < offsetTop) {
                $('#tableStatisticDay th').css({
                    "top": offsetTop - table.offsetTop
                })
            }
            else {
                $('#tableStatisticDay th').css({"top": 0})
            }

            requestAnimationFrame(tick);
        }
    }
}



