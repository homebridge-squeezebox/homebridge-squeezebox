# homebridge-squeezebox

Work in progress, may or may not work for you.
Tested with Squeezebox Radio and Squeezebox Duet.

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
			"port": 9000
		}
	}
}
```

host/port for your Logitech Media Server