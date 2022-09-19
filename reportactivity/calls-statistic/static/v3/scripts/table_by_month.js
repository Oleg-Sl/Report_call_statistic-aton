import {
    templateColMonthRowOne, 
    templateColMonthRowTwo, 
    templateColMonthRowTree, 
    templateColMonthRowFour, 
    templateThead,
    templateColMonthRowDepart,
    templateRowDepart,
    templateColMonthRowEmploye,
    templateRowEmploye,
} from './templates/template_table_by_month.js';


export default class TableByMonth {
    constructor(container, requests, infoData) {
        this.container = container;                                     // HTML-контейнер таблицы (тег - table)
        this.requests = requests;                                       // объект - выполнение запросов к серверу
        this.infoData = infoData;                                       // окно - просмотра дополнительных данных при клике по ячейке таблицы

        this.data = null;
        this.countWorking = null;
        this.duration = 20;
        this.summaryData = {};

        this.monthList = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

        // инициализация событий таблицы
        this.initHandler();
        // инициализация события перетаскивания таблицы по левой кнопке мыши
        this.handlerDragnDrop();
        // фиксирование первой строки таблицы
        this.stickyFirstLine();
        
    }

    initHandler() {
        // ввод плана по звонкам
        this.container.addEventListener("change", async (event) => {
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

        // двойной клик по ячейке с данными статистики сотрудников
        this.container.addEventListener('dblclick', async (event)=>{
            let cellMetData = event.target.closest(".meta-data");
            if (cellMetData) {
                let row = event.target.closest("tr");                       // строка таблицы - сотрудника
                let userId = row.dataset.userId;                            // ID сотрудника
                let dateStart = cellMetData.dataset.dateStart;              // дата - начало периода
                let dateEnd = cellMetData.dataset.dateEnd;                  // дата - конец периода
                let month = new Date(dateStart).getMonth();                 // номер месяца: 0..11
                let keyMonth = String(+month + 1);
                // координаты мыши в момент возникновения события
                let coordinates = {
                    x: event.clientX,
                    y: event.clientY
                }
                
                this.infoData.render(coordinates, userId, dateStart, dateEnd, this.duration, cellMetData);         // вывод окна с комментариями и звонками
            }
        })
    }

    // проверка допуска на редактирование данных таблицы
    verificationEditTable(month) {
        // ('0', 'Запрещено'),
        // ('1', 'Ограниченно разрешено'),
        // ('2', 'Разрешено'),
        let actualDate = new Date();                                // текущая дата
        let date = new Date(this.year, month, this.deadline);       // крайняя дата допускающая редактирование
        if (this.allowEdit == 0) {
            // если доступ запрещен
            return false;
        }
        if (this.allowEdit == 1 && actualDate > date) {
            // если доступ ограничен и запрешено редактироавание по срокам
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
    render(data, params) {
        this.data = data;                                       // данные статистики
        this.countWorking = params.countWorking;                // количество рабочих дней: {месяц: кол-во рабочих дней, ...}
        this.year = params.actualYear;                          // год
        this.deadline = params.deadline;                        // дней с начала месяца, в течении которого можно редактировать план по звонкам
        this.allowEdit = params.statusEdit;                     // право доступа на редактирование данных таблицы
        this.allowEditAll = params.statusEditAll;               // право на доступ к настройкам
        this.headDepart = params.headDepart;                    // руководители подразделений
        this.duration = params.duration;                        // минимальная длительность звонка

        // вывод данных и отрисовка таблицы
        this.renderTable();

        // смещение первого столбца - фиксация
        $('.table-by-month-first-column').css({
            "left": this.container.scrollLeft
        })
        
    }

    // отрисовка данных таблицы
    renderTable() {
        let contentHTML = "";
        contentHTML += this.renderThead();          // отрисовка заголовка таблицы
        contentHTML += this.renderTbody();          // отрисовка тела таблицы
        contentHTML += this.renderTfooter();        // отрисовка футера таблицы
        this.container.innerHTML = contentHTML;
    }
    
    // отрисовка заголовка таблицы
    renderThead() {
        let rowOne = `<th class="table-header table-by-month-first-column" colspan="1" rowspan="4"></th>`;
        let rowTwo = "";
        let rowTree = "";
        let rowFour = "";
        for (let numMonth in this.monthList) {
            // количество рабочих дней в месяце
            let countWorkingDay = this.getCountWorkingDays(+numMonth + 1);
           
            // формирование HTML-строк заголовка таблицы
            rowOne += templateColMonthRowOne(countWorkingDay);
            rowTwo += templateColMonthRowTwo(this.monthList[numMonth]);
            rowTree += templateColMonthRowTree(); 
            rowFour += templateColMonthRowFour();

            // номер месяца - строка
            let keyMonth = String(+numMonth + 1);

            // подготовка данных для формирования итоговй строки таблицы
            this.summaryData[keyMonth] = {
                meeting: 0,
                calls: 0,
                calls_avg: 0,
                calls_plan: 0
            }
        }

        return templateThead(rowOne, rowTwo, rowTree, rowFour);
    }

    // отрисовка тела таблицы
    renderTbody() {
        if (!this.data) return;
        let contentHTML = "";
        for (let departmentData of this.data) {
            contentHTML += this.renderRowHeadDepart(departmentData);
            contentHTML += this.renderRowEmployeeDepart(departmentData);
        }
        
        return `
            <tbody>
                ${contentHTML}            
            </tbody>
        `;
    }

    // вывод строки руководителя подразделения
    renderRowHeadDepart(departmentData) {
        let contentHTML = "";
        for (let numMonth in this.monthList) {
            let month = +numMonth + 1
            // количество встреч департамента в месяц
            let countMeeting = this.getSummaryStatisticsForDepartment(departmentData.data, month, "meetings_fact");
            // количество звонков департамента в месяц
            let countCalls   = this.getSummaryStatisticsForDepartment(departmentData.data, month, "calls_fact");
            // среднее количество звонков департамента в день за месяц
            let countCallsAvg = Math.ceil(countCalls / this.getCountWorkingDays(month)) || 0;
            // план звонков по подразделению в день на месяц
            let countCallsPlan = this.getSummaryStatisticsForDepartment(departmentData.data, month, "calls_plan");

            let actualDate = new Date();
            let date = new Date(this.year, numMonth, 1);

            let cssMarker = "";
            if (+countCallsPlan > +countCallsAvg && actualDate > date) {
                cssMarker = "marker-display";
            }

            contentHTML += templateColMonthRowDepart(countMeeting, countCalls, countCallsAvg, countCallsPlan, cssMarker, month);
        }

        // Фамилия + Имя руководителя подразделения
        let headDepart = `${departmentData.headLastname} ${departmentData.headName}`;
        return templateRowDepart(contentHTML, headDepart);
    }

    // вывод списка сотрудников подразделения
    renderRowEmployeeDepart(departmentData) {
        let contentHTML = "";
        let actualDate = new Date();

        for (let user of departmentData.data) {
            let contentEmploeeHTML = "";
            for (let numMonth in this.monthList) {
                // let cssClassCell = "";
                let month = +numMonth + 1
                let keyMonth = String(month);

                let date = new Date(this.year, numMonth, 1);

                // фактическое кол-во встреч
                let countMeeting = +user.meetings_fact[keyMonth] || 0;
                // фактическое кол-во звонков
                let countCalls = +user.calls_fact[keyMonth] || 0;
                // среднее кол-во звонков в день
                let countCallsAvg = Math.ceil(countCalls / this.getCountWorkingDays(month));
                // план по звонкам в день
                let countCallsPlan = user.calls_plan[keyMonth];
                // количество комментариев за месяц
                let countComments = +user.comments[keyMonth] || 0;
                
                // рарешение на редактирование плана по звонкам
                let edit = this.verificationEditTable(numMonth)

                let dateStart = new Date(this.year, numMonth, 1);
                let dateEnd = new Date(this.year, +numMonth + 1, 0);
                
                let params = {
                    countMeeting, 
                    countCalls, 
                    countCallsAvg, 
                    countCallsPlan, 
                    countComments, 
                    edit, 
                    month, 
                    dateStart: this.toDateStringMy(dateStart), 
                    dateEnd: this.toDateStringMy(dateEnd),
                    user: user.ID,
                    departId: departmentData.headId,
                }

                // HTML-код сотрудника
                contentEmploeeHTML += templateColMonthRowEmploye(params);

                this.summaryData[keyMonth]["meeting"] += countMeeting;
                this.summaryData[keyMonth]["calls"] += +countCalls;
                this.summaryData[keyMonth]["calls_avg"] += countCallsAvg;
                this.summaryData[keyMonth]["calls_plan"] += +countCallsPlan || 0;
            }

            let userTitle = `${user.LAST_NAME} ${user.NAME}`;
            contentHTML += templateRowEmploye(contentEmploeeHTML, departmentData.headId, user.ID, userTitle)
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
                ccount_avg = this.summaryData[keyMonth]["calls_avg"];
                // ccount_avg = Math.ceil(this.summaryData[keyMonth]["calls"] / +numMonth + 1);
            }

            contentHTML += `
                <td class="table_by-month-border-left">${this.summaryData[keyMonth]["meeting"]}</td>
                <td>${this.summaryData[keyMonth]["calls"]}</td>
                <td>${this.summaryData[keyMonth]["calls_avg"]}</td>
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

    // количество рабочих дней в месяце
    getCountWorkingDays(month) {
        let result = this.countWorking[month];
        if (result) {
            return result.length;
        }
    };

    // возвращает сумму данных по подразделению за месяц
    getSummaryStatisticsForDepartment(data, month, key) {
        let keyMonth = String(month);
        let accum = 0;
        for (let user of data) {
            let count = user[key][keyMonth] || 0;
            accum += count;
        }
        return accum;
    }
    
  
    // событие сохранения плана по звонкам на день
    async saveCountCallsPlan(month, employee, countCallsPlan) {
        let date = `${this.year}-${toFixedTwoSimbol(month)}-01`;
        let data = {
            calendar: date,
            count_calls: countCallsPlan || null,
            employee,
            all_month: true
        }
        let result = await this.requests.POST("calls-plan", data);
        
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

    // преобразование объекта даты в строку формата: гггг-мм-дд
    toDateStringMy(date) {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        return `${year}-${+month + 1}-${day}`;
    }
}

function toFixedTwoSimbol(numb) {
    if (+numb < 10) {
        return "0" + numb
    }
    return numb;
}



