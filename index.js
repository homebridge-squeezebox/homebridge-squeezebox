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
		Characteristic.call(this, 'Volume', '91288267-5678-49B2-8D22-F57BE995AA93');
		this.setProps({
			format: Characteristic.Formats.INT,
			unit: Characteristic.Units.PERCENTAGE,
			maxValue: 100,
			minValue: 0,
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
	Squeezebox.players[this.config.playerid].power(state);
	callback(null);
};
SqueezeboxAccessory.prototype.setVolume = function(value,callback){
	Squeezebox.players[this.config.playerid].setVolume(value);
	callback(null);
};

SqueezeboxAccessory.prototype.getServices = function(){
	this.informationService = new Service.AccessoryInformation();
	
	this.informationService
		.setCharacteristic(Characteristic.Name, this.config.name)
		.setCharacteristic(Characteristic.Manufacturer, this.log.prefix)
		.setCharacteristic(Characteristic.Model, this.config.model)
		.setCharacteristic(Characteristic.SerialNumber, this.config.playerid);
	
	this.radioService = new Service.Switch(this.config.name);
	this.radioService
		.getCharacteristic(Characteristic.On)
		.on('set', this.setPowerState.bind(this));
		
	this.radioService
		.addCharacteristic(VolumeCharacteristic)
		.on('set', this.setVolume.bind(this));
	
	return [this.informationService, this.radioService];
};
