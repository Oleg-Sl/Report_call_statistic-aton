import {
    templateThead,
    templateTheadColumnDayRowOne,
    templateTheadColumnDayRowTwo,
    templateTheadColumnDayRowTree,
    templateTheadColumnDayRowFour,

    templateTbodyRowDepart,
    templateTbodyColumnDayRowDepart,
    templateTbodyRowEmploye,
    templateTbodyColumnDayRowEmploye,

} from './templates/template_table_by_day.js';



export default class TableByDay {
    constructor(container, requests, infoData) {
        this.container = container;                 // HTML-контейнер таблицы (тег - table)
        this.requests = requests;                   // объект - выполнение запросов к серверу
        this.infoData = infoData;                   // окно - просмотра дополнительных данных при клике по ячейке таблицы

        this.data = null;
        this.countWorking = null;
        this.duration = 20;
        this.statusStatusDay = null;
        this.statusVerivicationMsg = null;

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

        // инициализация событий таблицы
        this.initHandler();
        // инициализация события перетаскивания таблицы по левой кнопке мыши
        this.handlerDragnDrop();
        // фиксирование первой строки таблицы
        this.stickyFirstLine();

    }

    initHandler() {
        // обработчик горизантального скролла таблицы - залипание первого столбца таблицы
        this.container.addEventListener('scroll', (event) => {
            let offsetLeft = event.target.scrollLeft;
            $('.table-by-day-fixed-column').css({
                "left": offsetLeft
            })
        });
        // двойной клик по маркеру в ячейке с данными статистики сотрудников
        this.container.addEventListener('dblclick', async (event)=>{        
            let clickByMarker = event.target.classList.contains("count-calls-depart-marker");
            let cellRedStyle =  event.target.closest(".red-cell");
            if (this.statusStatusDay && clickByMarker && cellRedStyle) {
                event.stopPropagation();
                let statusRed = true;
                if (event.target.closest(".count-calls-depart-marker-plan-true")) {
                    statusRed = false;          // нужно сделать зеленым
                }

                let elemTr = event.target.closest("tr");                                        // строка таблицы - сотрудника
                let userId = elemTr.dataset.userId;                                             // ID сотрудника
                let date = cellRedStyle.dataset.date;                                           // дата
                
                event.target.classList.add("count-calls-depart-marker-update");
                
                let response = await this.requests.POST(
                    "plan-completed",
                    {
                        "calendar": date,
                        "employee": userId,
                        "plan_completed": statusRed
                    }
                )
                
                event.target.classList.remove("count-calls-depart-marker-update");

                console.log("response = ", response);
                if (!response.error) {
                    event.target.classList.toggle("count-calls-depart-marker-plan-true");
                }

            }
            
        })
        // двойной клик по ячейке с данными статистики сотрудников
        this.container.addEventListener('dblclick', (event)=>{
            let clickByMarker = event.target.classList.contains("count-calls-depart-marker");
            let cellMetData = event.target.closest(".meta-data");
            if (cellMetData && !clickByMarker) {
                let elemTr = event.target.closest("tr");                                        // строка таблицы - сотрудника
                let userId = elemTr.dataset.userId;                                             // ID сотрудника
                let date = cellMetData.dataset.date;                                            // дата
                let day = new Date(date).getDate();                                             // день - номер
                // координаты мыши в момент возникновения события
                let coordinates = {
                    x: event.clientX,
                    y: event.clientY
                }
     
                // вывод окна с комментариями и звонками
                this.infoData.render(coordinates, userId, date, date, this.duration, cellMetData);  
            }
        })

    }

    // обновление данных таблицы
    render(data, params) {
        this.data = data;                                               // данные статистики
        this.workingDays = params.countWorking;                         // список рабочих дней в месяце
        this.countWorking = params.countWorking.length;                 // количество рабочих дней
        this.year = params.actualYear;                                  // год статистических данных
        this.month = params.actualMonth;                                // месяц статистических данных
        this.headDepart = params.headDepart;                            // руководители подразделений
        this.countDay = new Date(this.year, this.month, 0).getDate();   // количество дней в месяце
        this.duration = params.duration;                                // минимальная длительность звонка
        this.statusStatusDay = params.statusStatusDay;                  // право на доступ к изменению статуса дня
        this.statusVerivicationMsg = params.statusVerivicationMsg;      // право на доступ к верификации сообщений

        // вывод данных и отрисовка таблицы
        this.renderTable();
        
        $('.table-by-day-fixed-column').css({
            "left": this.container.scrollLeft
        })

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
        let styleGridTemplateColumns = ["200px", "65px", "65px"];
        let actualDate = new Date();

        let col = 0;
        let rowOne = "";
        let rowTwo = "";
        let rowTree = "";
        let rowFour = "";

        for (let num = 1; num <= this.countDay; num++) {
            
            if (!this.workingDays.includes(num)) {
                continue;
            }
            col++;
            let keyDay = String(num);
            let date = new Date(this.year, +this.month - 1, num);
            let cssClassCell = "";
            
            let titleColOneRow = `${num} ${this.monthObj[this.month]}`;
            let numColStart = 2 * col + 2;
            let numColEnd = 2 * col + 4;

            let countMeetingFact = this.getSummaryDataInDay(this.data, keyDay, "meetings_fact");
            let countCallsFact = this.getSummaryDataInDay(this.data, keyDay, "calls_fact");
            let countCallsPlan = this.getSummaryDataInDay(this.data, keyDay, "calls_plan");

            if (actualDate > date) {
                cssClassCell = countCallsPlan <= countCallsFact ? "green-cell" : "red-cell";
            }

            rowOne += templateTheadColumnDayRowOne(titleColOneRow, numColStart, numColEnd);
            rowTwo += templateTheadColumnDayRowTwo();
            rowTree += templateTheadColumnDayRowTree(countCallsPlan);
            rowFour += templateTheadColumnDayRowFour(countMeetingFact, countCallsFact, cssClassCell);

            styleGridTemplateColumns.push("65px");
            styleGridTemplateColumns.push("65px");
        }
        
        let contentHTML = templateThead(rowOne, rowTwo, rowTree, rowFour);

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
        let countDaysPlanIsCompleted = 0;           // количесьво дней - план по звонкам выполнен
        let countDaysPlanNotIsCompleted = 0;        // количесьво дней - план по звонкам не выполнен
        for (let num = 1; num <= this.countDay; num++) {
            let keyDay = String(num);
            if (!this.workingDays.includes(num)) continue;
            let date = new Date(this.year, +this.month - 1, num);

            let countCallsFactDepart = this.getSummaryDataInDayByDepart(depart.data, keyDay, "calls_fact");         // сумма звонков по подразделению за день
            let countCallsPlanDepart = this.getSummaryDataInDayByDepart(depart.data, keyDay, "calls_plan");         // план звонков отдела на день
            let countMeetingDepart = this.getSummaryDataInDayByDepart(depart.data, keyDay, "meetings_fact");        // сумма встреч по подразделению
            
            let cssClassCell = "";
            if (!isNaN(+countCallsPlanDepart) && actualDate > date) {
                if (+countCallsPlanDepart <= +countCallsFactDepart) {
                    cssClassCell = "green-cell";
                    countDaysPlanIsCompleted++;
                } else {
                    cssClassCell = "red-cell";
                    countDaysPlanNotIsCompleted++;
                }
            }

            contentHTML += templateTbodyColumnDayRowDepart(countMeetingDepart, countCallsFactDepart, cssClassCell);
        }

        // Фамилия + Имя сотрудника
        let head = `${depart.headLastname} ${depart.headName}`;
        return templateTbodyRowDepart(head, depart.departId, countDaysPlanIsCompleted, countDaysPlanNotIsCompleted, contentHTML);
    }

    // вывод списка сотрудников подразделения
    renderRowEmployeeDepart(depart) {
        let contentHTML = "";
        let actualDate = new Date();
        for (let dataEmployee of depart.data) {
            let contentEmploeeHTML = "";
            let countDaysPlanIsCompleted = 0;           // количество дней - план по звонкам выполнен
            let countDaysPlanNotIsCompleted = 0;        // количество дней - план по звонкам не выполнен
 
            // вывод статистики по дням месяца
            for (let num = 1; num <= this.countDay; num++) {
                if (!this.workingDays.includes(num)) continue;

                let date = new Date(this.year, +this.month - 1, num);
                let keyDay = String(num);

                let countMeeting = dataEmployee.meetings_fact[keyDay] || 0;
                let countCalls = dataEmployee.calls_fact[keyDay] || 0;
                let countCallsPlan = dataEmployee.calls_plan[keyDay];
                let countComments = dataEmployee.comments[keyDay] || 0;
                let planCompleted = dataEmployee.completed_plan[keyDay];

                let styleMarkerPlanTrue = "";
                if (planCompleted) {
                    styleMarkerPlanTrue = "count-calls-depart-marker-plan-true";
                }

                let cssClassCell = "";
                // проверка выполнения плана по звонкам
                if (!isNaN(+countCallsPlan) && actualDate > date) {
                    if (+countCallsPlan <= +countCalls) {
                        cssClassCell = "green-cell";
                    } else {
                        cssClassCell = "red-cell";
                    }
                }
                
                // 
                if (!isNaN(+countCallsPlan) && actualDate > date) {
                    if (+countCallsPlan <= +countCalls || planCompleted) {
                        countDaysPlanIsCompleted++;
                    } else {
                        countDaysPlanNotIsCompleted++;
                    }
                }

                let cssIsComments = countComments ? "is-comments" : "";
                let dateStr = this.toDateStringMy(date);
                contentEmploeeHTML += templateTbodyColumnDayRowEmploye(countMeeting, countCalls, countComments, dateStr, cssClassCell, cssIsComments, styleMarkerPlanTrue, countCallsPlan);
            }
            
            
            let employe = `${dataEmployee.LAST_NAME} ${dataEmployee.NAME}`;
            contentHTML += templateTbodyRowEmploye(employe, dataEmployee.ID, countDaysPlanIsCompleted, countDaysPlanNotIsCompleted, contentEmploeeHTML);            
        }
      
        return contentHTML;  
    }

    // возвращает сумму данных по всем подразделениям за день
    getSummaryDataInDayByDepart(data, day, field) {
        let accum = 0;
        for (let user of data) {
            let count = user[field][day] || 0;
            accum += count;
        }
        return accum;
    }

    // возвращает сумму данных по всем подразделениям за день
    getSummaryDataInDay(data, day, field) {
        let accum = 0;
        for (let depart of data) {
            for (let user of depart.data) {
                let count = user[field][day] || 0;
                accum += count;
            }
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

    // преобразование объекта даты в строку формата: гггг-мм-дд
    toDateStringMy(date) {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        return `${year}-${+month + 1}-${day}`;
    }
}



