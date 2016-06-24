ServiceConfiguration.configurations.update( /* Configure server with correct spotify credentials */
	{ "service": "spotify" },
	{
		$set: {
			"clientId": "a1990ba28ee8492b919e9977721afd70",
			"secret": "1606660678ba4e92bdfacac252181202"
		}
	},
	{ upsert: true }
)