# homebridge-squeezebox v 0.1.6

Work in progress, may or may not work for you.

When switching the player on, it starts playing, i.e. 

1. the player is switched on, and
2. replay is started

When the player is switched off,

1. replay is paused, and
2. the player is switched off


Example config.json

```
{
	"bridge": {
		"name": "Homebridge",
		"username": "CC:22:3D:E3:CE:30",
		"port": 51826,
		"pin": "031-45-154"
	},
	"platforms": [
		{
			"platform": "Squeezebox",
			"name": "Squeezebox",
			"host": "127.0.0.1",
			"port": 9000,
			"username": "username",
			"password": "password"
		}
	}
}
```

host/port for your Logitech Media Server
