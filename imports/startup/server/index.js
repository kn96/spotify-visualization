ServiceConfiguration.configurations.update( /* Configure server with correct spotify credentials */
	{ "service": "spotify" },
	{
		$set: {
			"clientId": "<your client ID>",
			"secret": "<your secret>"
		}
	},
	{ upsert: true }
)

Accounts.config({
   loginExpirationInDays: null
})
