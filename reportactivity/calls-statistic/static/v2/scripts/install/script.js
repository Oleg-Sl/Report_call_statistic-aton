let DOMAIN = "https://otchet.atonlab.ru/calls-statistic/api/v1";
let URL__CREATE_USER = `${DOMAIN}/create-user/`;
let URL__CREATE_CALLS = `${DOMAIN}/create-update-calls/`;
let URL__CREATE_ACTIVITY = `${DOMAIN}/create-update-activity/`;


BX24.init(async function(){
	BX24.callMethod(
		'event.bind', 
		{
			"event": "ONCRMACTIVITYADD", 
			"handler": URL__CREATE_ACTIVITY, 
		},
		(res) => {
			BX24.callMethod(
				'event.bind', 
				{
					"event": "ONCRMACTIVITYUPDATE", 
					"handler": URL__CREATE_ACTIVITY, 
				},
				(res) => {
					BX24.callMethod(
						'event.bind', 
						{
							"event": "ONVOXIMPLANTCALLEND", 
							"handler": URL__CREATE_CALLS, 
						},
						(res) => {
							BX24.callMethod(
								'event.bind', 
								{
									"event": "ONUSERADD", 
									"handler": URL__CREATE_USER, 
								},
								(res) => {
									BX24.installFinish();
								}
							);
						}
					);
				}
			);
		}
	);

});
