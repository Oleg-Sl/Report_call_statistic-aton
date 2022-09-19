export default class UpdatingEmploye {
    constructor(container, requests, bx) {
        this.container = container;
        this.requests = requests;                                                                       // объект Requests для выполнения запросов к серверу
        this.bx = bx;

        // УВЕДОМЛЕНИЯ
        this.alertGetEmployeProcActive = this.container.querySelector(".status-get-employe-process-active");                // уведомление - ПОЛУЧЕНИЕ ДАННЫХ
        this.alertGetEmployeProcCompleted = this.container.querySelector(".status-get-employe-process-completed");          // уведомление - ПОЛУЧЕНИЕ ДАННЫХ
        this.alertUpdateEmployeProcActive = this.container.querySelector(".status-update-employe-process-active");          // уведомление - ОБНОВЛЕНИЕ ДАННЫХ
        this.alertUpdateEmployeProcCompleted = this.container.querySelector(".status-update-employe-process-completed");    // уведомление - ОБНОВЛЕНИЕ ДАННЫХ
        this.elemUpdatedValue = this.alertUpdateEmployeProcActive.querySelector("strong");                                  // элемент с текущим обновляемым пользователем

        // ПРОГРЕССБАР
        this.containerProgressBar = this.container.querySelector(".indicator-container");               // контейнер индикатора загрузки
        this.progressBar = this.containerProgressBar.querySelector(".indicator-item");                  // индикатор загрузки

        // КНОПКИ
        this.btnUpdate = this.container.querySelector(".btn-start-update-employe");                     // кнопка - обновить
        this.btnCancel = this.container.querySelector(".btn-stop-update-employe");                      // кнопка - отмена
        
        this.cancelProcess = false;
    }

    init() {
        this.initHandler();
    }

    initHandler() {
        // обновление данных на сервере
        this.btnUpdate.addEventListener("click", async (event) => {
            // СОКРЫТИЕ УВЕДОМЛЕНИЙ И ПРОГРЕССБАРА
            this.alertGetEmployeProcActive.classList.add("d-none");
            this.alertGetEmployeProcCompleted.classList.add("d-none");
            this.alertUpdateEmployeProcActive.classList.add("d-none");
            this.alertUpdateEmployeProcCompleted.classList.add("d-none");
            this.containerProgressBar.classList.add("d-none");                          // сокрытие прогрессбара
            this.displayActualUpdateValue(0);
            // this.progressBar.classList.add("d-none");

            // this.containerProgressBar.remove("d-none");
            this.btnUpdate.classList.add("d-none");                                     // сокрытие кнопки обновление

            // ПОЛУЧЕНИЕ ДАННЫХ
            this.alertGetEmployeProcActive.classList.remove("d-none");                  // вывод уведомления - ПОЛУЧЕНИЕ ДАННЫХ
            let users = await this.getUsers();                                          // список пользователей
            // console.log("users = ", users);
            this.alertGetEmployeProcActive.classList.add("d-none");                     // скрытие уведомления - ДАННЫЕ ПОЛУЧЕНЫ
            this.alertGetEmployeProcCompleted.classList.remove("d-none");               // вывод уведомления - ПОЛУЧЕНИЕ ДАННЫХ

            // ОБНОВЛЕНИЕ ДАННЫХ
            this.containerProgressBar.classList.remove("d-none");                       // показ прогрессбара
            this.alertUpdateEmployeProcActive.classList.remove("d-none");               // вывод уведомления - ОБНОВЛЕНИЕ ДАННЫХ
            await this.updateUsers(users);                                              // обновление данных пользователей на сервере
            this.alertUpdateEmployeProcActive.classList.add("d-none");                  // скрытие уведомления - ОБНОВЛЕНИЕ ДАННЫХ
            this.alertUpdateEmployeProcCompleted.classList.remove("d-none");            // вывод уведомления - ДАННЫЕ ОБНОВЛЕНЫ

            this.btnUpdate.classList.remove("d-none");                                  // сокрытие кнопки обновление
            this.cancelProcess = false;
        })

        this.btnCancel.addEventListener("click", async (event) => {
            // console.log("CANCEL");
            this.cancelProcess = true;
        })
    }

        // получение списка пользователей
        async getUsers() {
            let res = await this.bx.longBatchMethod(
                "user.get",
                { 
                    sort: "ID",
                    order: "DESC",
                }
            )
            return res;
        }
    
        // обновление списка активностей на сервере
        async updateUsers(users) {
            let count = 0;
            let countAll = users.length;                                            // общее количество объектов
            this.progressBar.classList.remove("d-none");                            // вывод прогрессбара
            for (let user of users) {
                if (this.cancelProcess) {
                    return;                                                         // прерывание обновления по кнопке ОТМЕНА
                }
                let data = user;
                let percent = Math.round(count * 100 / countAll);
                // console.log("percent = ", percent);
                // console.log("user = ", user);
                let title = `${user.LAST_NAME} ${user.NAME}`;
                this.displayActualUpdateValue(title);                               // вывод информации о текущем объекте
                this.updateValueProgressBar(percent);                               // вывод текущего значения прогресса
                let res = await this.requests.POST("create-user-2", data);          // обновление данных на сервере
                // console.log("res = ", res);
                count++;
            }
            this.updateValueProgressBar(100);                                       // вывод 100% прогресса
        }
    
        // вывод информации о текущем обновляемом объекте
        displayActualUpdateValue(value) {
            this.elemUpdatedValue.innerHTML = value;
        }
    
        // обновление прогресса индикатора
        updateValueProgressBar(percent) {
            this.progressBar.style.width = `${percent}%`;
        }

}



    
// let container = document.querySelector("#modalUpdateEmploye");
// let selectDataByStatistic = new UpdatingEmploye(container);
// selectDataByStatistic.init();


