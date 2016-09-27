var inherits = require('util').inherits,
	LMS = require('squeezenode'),
	Squeezebox;

var Accessory, Characteristic, Service, VolumeCharacteristic, UUIDGen;

module.exports = function(homebridge) {
	// Accessory must be created from PlatformAccessory Constructor
	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;

	makeVolumeCharacteristic();
	homebridge.registerPlatform("homebridge-squeezebox", "Squeezebox", SqueezeboxPlatform, true);
};

function makeVolumeCharacteristic(){
	VolumeCharacteristic = function(){
		Characteristic.call(this, 'Volume', '00001001-0000-1000-8000-135D67EC4377');
		this.setProps({
			format: Characteristic.Formats.INT,
			unit: Characteristic.Units.PERCENTAGE,
			minValue: 0,
			maxValue: 100,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(VolumeCharacteristic, Characteristic);
}



function SqueezeboxPlatform(log,config,api){
	this.log = log;
	this.config = config;
}

SqueezeboxPlatform.prototype.accessories = function(callback){
	var self = this;

	Squeezebox = new LMS('http://'+this.config.host, this.config.port);

	Squeezebox.on('register', function(){
		Squeezebox.getPlayers(function(response){
			var players = [];
			if (response.ok && response.result.length){
				response.result.forEach(function(player){
					// add more magic?
					var accessory = new SqueezeboxAccessory(self.log, player);
					players.push(accessory);
				});
				callback(players);
			}
		});
	});
};



function SqueezeboxAccessory(log, config){
	this.log = log;
	this.name = config.name;
	this.config = config;
}

SqueezeboxAccessory.prototype.setPlayState = function(state, callback){
	if (state){
		Squeezebox.players[this.config.playerid].play();
	} else {
		Squeezebox.players[this.config.playerid].pause();
	}
	callback(null);
};
SqueezeboxAccessory.prototype.setPowerState = function(state, callback){
	try {
		Squeezebox.players[this.config.playerid].power(state);
		callback(null);
	} catch(e){
		this.log(e);
	}
};

SqueezeboxAccessory.prototype.getPowerState = function(callback){
	Squeezebox.players[this.config.playerid].getStatus(function(res){
		try {
			var on = (Number(res.result.power) == 1);
			callback(null, on);
		} catch(e){
			this.log(e)
		}
	});
};

SqueezeboxAccessory.prototype.getVolume = function(callback){
	Squeezebox.players[this.config.playerid].getVolume(function(res){
		try {
			var volume = Number(res.result);
			callback(null, volume);
		} catch(e){
			this.log(e);
		}
	});
};
SqueezeboxAccessory.prototype.setVolume = function(value,callback){
	try {
		Squeezebox.players[this.config.playerid].setVolume(value);
		callback(null);
	} catch(e){
		this.log(e);
	}
};

SqueezeboxAccessory.prototype.getServices = function(){
	this.informationService = new Service.AccessoryInformation();

	this.informationService
		.setCharacteristic(Characteristic.Name, this.config.name)
		.setCharacteristic(Characteristic.Manufacturer, this.log.prefix)
		.setCharacteristic(Characteristic.Model, this.config.model)
		.setCharacteristic(Characteristic.SerialNumber, this.config.playerid);

	// Power state
	this.playerService = new Service.Switch(this.config.name);
	this.playerService
		.getCharacteristic(Characteristic.On)
		.on('set', this.setPowerState.bind(this))
		.on('get', this.getPowerState.bind(this));

	// Volume
	this.playerService
		.addCharacteristic(VolumeCharacteristic)
		.on('get', this.getVolume.bind(this))
		.on('set', this.setVolume.bind(this));

	return [this.informationService, this.playerService];
};
