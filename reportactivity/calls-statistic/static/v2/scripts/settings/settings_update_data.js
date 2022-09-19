export default class UpdatingStatisticsData {
    constructor(container, requests, bx) {
        this.container = container;
        this.requests = requests;                                                                               // объект Requests для выполнения запросов к серверу
        this.bx = bx;



        // ПОЛЯ
        this.inputPeriodStart = this.container.querySelector(".parametr-period-start input");           // поле ввода - начало периода
        this.inputPeriodEnd = this.container.querySelector(".parametr-period-end input");               // поле ввода - конец периода
        this.inputEmploye = this.container.querySelector(".parametr-employe input");                    // поле выбора - сотрудник

        // ВАЛИДАЦИЯ
        this.containerTooltipPeriodStart = this.container.querySelector(".parametr-period-start .invalid-tooltip");     // поле ввода - начало периода
        this.containerTooltipPeriodEnd = this.container.querySelector(".parametr-period-end .invalid-tooltip");         // поле ввода - конец периода

        // УВЕДОМЛЕНИЯ
        this.alertGetDataProcActive = this.container.querySelector(".status-get-data-process-active");                  // уведомление - ПОЛУЧЕНИЕ ДАННЫХ
        this.alertGetDataProcCompleted = this.container.querySelector(".status-get-data-process-completed");            // уведомление - ДАННЫЕ ПОЛУЧЕНЫ
        this.alertUpdateDataProcActive = this.container.querySelector(".status-update-data-process-active");            // уведомление - ОБНОВЛЕНИЕ ДАННЫХ
        this.alertUpdateDataProcCompleted = this.container.querySelector(".status-update-data-process-completed");      // уведомление - ДАННЫЕ ОБНОВЛЕНЫ
        this.elemUpdatedActivity = this.alertUpdateDataProcActive.querySelector("strong");                              // элемент с текущей обновляемой активностью

        // ПРОГРЕССБАР
        this.containerProgressBar = this.container.querySelector(".indicator-container");               // контейнер индикатора загрузки
        this.progressBar = this.containerProgressBar.querySelector(".indicator-item");                  // индикатор загрузки

        // КНОПКИ
        this.btnUpdate = this.container.querySelector(".btn-start-update-statistics");                  // кнопка - обновить
        this.btnCancel = this.container.querySelector(".btn-stop-update-statistics");                   // кнопка - отмена
        

        this.cancelProcess = false;
    }

    init() {
        this.initHandler();
    }

    initHandler() {
        // обновление данных на сервере
        this.btnUpdate.addEventListener("click", async (event) => {
            // СОКРЫТИЕ УВЕДОМЛЕНИЙ И ПРОГРЕССБАРА
            this.alertGetDataProcActive.classList.add("d-none");
            this.alertGetDataProcCompleted.classList.add("d-none");
            this.alertUpdateDataProcActive.classList.add("d-none");
            this.alertUpdateDataProcCompleted.classList.add("d-none");
            this.containerProgressBar.classList.add("d-none");                          // сокрытие прогрессбара
            this.updateValueProgressBar(0);

            let validationStatus = this.validationField();                              // проверка валидности данных полей ввода
            // console.log("validationStatus = ", validationStatus);
            if (!validationStatus) {
                return;
            }
            let period = this.getPeriod();                                              // период массив дат [начало, конец]
            let employe = this.getEmploye();                                            // id сотрудника
            
            this.btnUpdate.classList.add("d-none");                                     // сокрытие кнопки обновление

            // ПОЛУЧЕНИЕ ДАННЫХ
            this.alertGetDataProcActive.classList.remove("d-none");                     // вывод уведомления - ПОЛУЧЕНИЕ ДАННЫХ
            // let activities = await this.getActivities(employe, period[0], period[1]);   // список активностей
            let calls = await this.getCalls(employe, period[0], period[1]);             // список звонков
            this.alertGetDataProcActive.classList.add("d-none");                        // скрытие уведомления - ДАННЫЕ ПОЛУЧЕНЫ
            this.alertGetDataProcCompleted.classList.remove("d-none");                  // вывод уведомления - ПОЛУЧЕНИЕ ДАННЫХ

            // ОБНОВЛЕНИЕ ДАННЫХ
            this.containerProgressBar.classList.remove("d-none");                       // показ прогрессбара
            this.alertUpdateDataProcActive.classList.remove("d-none");                  // вывод уведомления - ОБНОВЛЕНИЕ ДАННЫХ
            // await this.updateActivities(activities);                                    // обновление статистики на сервере
            await this.updateCalls(calls);                                              // обновление статистики на сервере
            this.alertUpdateDataProcActive.classList.add("d-none");                     // скрытие уведомления - ОБНОВЛЕНИЕ ДАННЫХ
            this.alertUpdateDataProcCompleted.classList.remove("d-none");               // вывод уведомления - ДАННЫЕ ОБНОВЛЕНЫ

            this.btnUpdate.classList.remove("d-none");                                  // сокрытие кнопки обновление
            this.cancelProcess = false;
        })

        this.btnCancel.addEventListener("click", async (event) => {
            // console.log("CANCEL");
            this.cancelProcess = true;
        })

    }

    // валидация полей ввода данных
    validationField() {
        let status = true;

        // валидация поля - начало периода
        if (!this.inputPeriodStart.value) {
            this.containerTooltipPeriodStart.style.display = "block";
            status = false;
        } else {
            this.containerTooltipPeriodStart.style.display = "none";
        }

        // валидация поля - конец периода
        if (!this.inputPeriodEnd.value) {
            this.containerTooltipPeriodEnd.style.display = "block";
            status = false;
        } else {
            this.containerTooltipPeriodEnd.style.display = "none";
        }

        return status;
    }

    // возвращает массив дат [нач. периода, кон. периода]
    getPeriod() {
        let periodStart = this.inputPeriodStart.value;
        let periodEnd = this.inputPeriodEnd.value;
        return [periodStart, periodEnd];
    }

    // возвращает ID сотрудника
    getEmploye() {
        return this.inputEmploye.value;
    }

    // получение фильтрованного списка активностей
    async getActivities(employeId, dateStart, dateEnd) {
        let filter = {
            "TYPE_ID": 2,           // только звонки
            ">CREATED": dateStart,  // дата начала периода
            "<CREATED": dateEnd,    // дата окнчания периода (не включительно)
        }
        if (employeId) {
            let employeList = employeId.split(" ").join("").split(",");
            filter.RESPONSIBLE_ID = employeList;
        }
        // console.log("filter = ", filter);
        let res = await this.bx.longBatchMethod(
            "crm.activity.list",
            { 
                order:{ "ID": "DESC" },
                filter: filter,
                select:["ID"]
            }
        )
        return res;
    }

    // получение фильтрованного списка звонков
    async getCalls(employeId, dateStart, dateEnd) {
        let filter = {
            "CALL_TYPE": 1,                 // только исхоляшие
            ">CALL_START_DATE": dateStart,  // дата начала периода
            "<CALL_START_DATE": dateEnd,    // дата окнчания периода (не включительно)
        }
        if (employeId) {
            let employeList = employeId.split(" ").join("").split(",");
            filter.PORTAL_USER_ID = employeList;
        }
        let res = await this.bx.longBatchMethod(
            "voximplant.statistic.get",
            { 
                filter: filter,
                SORT: "ID",
                ORDER: "ASC"
            }
        )
        return res;
    }

    // обновление списка активностей на сервере
    async updateActivities(activities) {
        let count = 0;
        let countActivities = activities.length;                                    // количество активностей
        this.progressBar.classList.remove("d-none");                                // вывод прогрессбара
        for (let activity of activities) {
            if (this.cancelProcess) {
                return;                                                             // прерывание обновления по кнопке ОТМЕНА
            }
            let data = {
                "data[FIELDS][ID]": activity.ID
            }
            let percent = Math.round(count * 100 / countActivities);
            // console.log("percent = ", percent);
            this.displayActualUpdateActivityId(activity.ID);                        // вывод текущей акстивности
            this.updateValueProgressBar(percent);                                   // вывод текущего значения прогресса
            let res = await this.requests.POST("create-update-activity", data);     // обновление данных на сервере
            // console.log("res = ", res);
            count++;
        }
        this.updateValueProgressBar(100);                                           // вывод 100% прогресса
    }

    // обновление списка активностей на сервере
    async updateCalls(calls) {
        let count = 0;
        let countCalls = calls.length;                                              // количество 
        this.progressBar.classList.remove("d-none");                                // вывод прогрессбара
        for (let call of calls) {
            if (this.cancelProcess) {
                return;                                                             // прерывание обновления по кнопке ОТМЕНА
            }
            let data = call;
            let percent = Math.round(count * 100 / countCalls);
            // console.log("percent = ", percent);
            this.displayActualUpdateActivityId(call.ID);                            // вывод текущей акстивности
            this.updateValueProgressBar(percent);                                   // вывод текущего значения прогресса
            let res = await this.requests.POST("create-update-calls-2", data);      // обновление данных на сервере
            // console.log("res = ", res);
            count++;
        }
        this.updateValueProgressBar(100);                                           // вывод 100% прогресса
    }

    // вывод ID текущей обновляемой активности
    displayActualUpdateActivityId(activityId) {
        this.elemUpdatedActivity.innerHTML = activityId;
    }

    // обновление прогресса индикатора
    updateValueProgressBar(percent) {
        this.progressBar.style.width = `${percent}%`;
    }
    
}



// let container = document.querySelector("#modalUpdateData");
// let selectDataByStatistic = new UpdatingStatisticsData(container);
// selectDataByStatistic.init();



