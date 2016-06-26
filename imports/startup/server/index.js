ServiceConfiguration.configurations.update( /* Configure server with correct spotify credentials */
	{ "service": "spotify" },
	{
		$set: {
			"clientId": "",
			"secret": ""
		}
	},
	{ upsert: true }
)
