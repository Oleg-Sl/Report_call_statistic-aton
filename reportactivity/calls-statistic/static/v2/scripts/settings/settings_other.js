export default class OtherSettings {
    constructor(container, requests, bx) {
        this.container = container;
        this.requests = requests;                                                                               // объект Requests для выполнения запросов к серверу
        this.bx = bx;
        
        this.myModal = new bootstrap.Modal(this.container, {});                                                 // объект bootstrap модального окна с настройками

        // КОНТЕЙНЕРЫ
        this.inputDurationCalls = this.container.querySelector(".other-settings-min-duration-calls input");     // поле INPUT - длительность звонка
        this.inputCountDays = this.container.querySelector(".other-settings-count-days input");                 // поле INPUT - количество дней
        this.inputPeriodUpdate = this.container.querySelector(".other-settings-periopd-update input");          // поле INPUT - периоб одбновления
        
        this.btnSave = this.container.querySelector(".other-settings-button-save");                             // кнопка - СОХРАНИТЬ
        this.btnCancel = this.container.querySelector(".other-settings-button-cancel");                         // кнопка - ОТМЕНИТЬ

        // КЛЮЧИ для получения данных из хранилища приложения в Битрик
        this.keyStorageDuration = "duration";
        this.keyStorageCountDays = "deadline";
        this.keyStoragePeriod = "period";

    }

    async init() {
        await this.setInitValue();
        this.initHandler();
    }

    initHandler() {
        // сохранить настройки
        this.btnSave.addEventListener("click", async (event) => {
            this.saveData();                            // сохранение введенных значений
        })

        // событие - открытие модального окна
        this.container.addEventListener("show.bs.modal", async () => {
            this.setInitValue();                        // установка сохраненных значений настроек
        })

    }
    
    // установка сохраненных значений
    async setInitValue() {
        this.durationCalls = await BX24.appOption.get(this.keyStorageDuration);
        this.countDays = await BX24.appOption.get(this.keyStorageCountDays);
        this.periodUpdate = await BX24.appOption.get(this.keyStoragePeriod);
        this.inputDurationCalls.value = this.durationCalls || 0;
        this.inputCountDays.value = this.countDays || 1;
        this.inputPeriodUpdate.value = this.periodUpdate || 1;

    }

    // сохранение введенных значений
    saveData() {
            this.durationCalls = this.inputDurationCalls.value;                  // длительность звонка
            this.countDays = this.inputCountDays.value;                          // количества дней
            this.periodUpdate = this.inputPeriodUpdate.value;                    // периода обновления

            BX24.appOption.set(this.keyStorageDuration, this.durationCalls);    // сохранение списка подразделений в настройках приложения
            BX24.appOption.set(this.keyStorageCountDays, this.countDays);       // сохранение длительности звонка в настройках приложения
            BX24.appOption.set(this.keyStoragePeriod, this.periodUpdate);       // сохранение количества дней в настройках приложения

            this.myModal.hide();                                                // скрыть модальное окно с настройками праложения
    }


    getSaveDurationCalls() {
        return this.durationCalls;
    }
    getSaveCountDays() {
        return this.countDays;
    }
    getSavePeriodUpdate() {
        return this.periodUpdate;
    }

}


// let container = document.querySelector("#modalOtherSettings");
// let selectDataByStatistic = new OtherSettings(container);
// selectDataByStatistic.init();

