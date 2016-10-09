ServiceConfiguration.configurations.update( /* Configure server with correct spotify credentials */
	{ "service": "spotify" },
	{
		$set: {
			"clientId": "a1990ba28ee8492b919e9977721afd70",
			"secret": "227a8fbe5af64f40943758c849325898"
		}
	},
	{ upsert: true }
)

Accounts.config({
   loginExpirationInDays: null
}) 