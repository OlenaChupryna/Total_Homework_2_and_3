"use strict";

function SimpleEquipment(name) {	
	this._name = name;
	this._OnOffState = false;
	this.switcher = switcher;			
}
	
SimpleEquipment.prototype.changeState = function() {
	this._OnOffState = this.switcher.turn(this._OnOffState);		
}			


function Lamp(name) {
	SimpleEquipment.call(this, name);
}
Lamp.prototype = Object.create(SimpleEquipment.prototype);
Lamp.prototype.constructor = Lamp;


function Chandelier(name) {
	SimpleEquipment.call(this, name);
	this.warningMaker = warningMaker;
	this._currentVolume = 50;
	this.maxVolume = 100;
	this.minVolume = 0;
	this.step = 10;
}
Chandelier.prototype = Object.create(SimpleEquipment.prototype);
Chandelier.prototype.constructor = Chandelier;
Chandelier.prototype.setLightVolume = function(newVolume) {
	if (this._OnOffState == true) {
		this._currentVolume = newVolume;
	} else {
		this.warningMaker.alarm("Turn me on!");
	}
}


function Washer(name) {
	SimpleEquipment.call(this, name);
	this.pattern = "washerPattern";	
	this.programmes = [
		{
			name: "Cotton",
			temperature: "40",
			squeezingSpeed: "1000",
			washingTime: 4000,
			squeezingTime: 3000
			
		},
		{
			name: "Synthetic",
			temperature: "30",
			squeezingSpeed: "800",
			washingTime: 3000,
			squeezingTime: 1000
		}
	];		
	this.programmeName = "Cotton";
	this.programmeState = "waiting";
	this.programmeTemperature = "40";
	this.programmesqueezingSpeed = "1000";	
	this.programmeWashingTime = 4000;
	this.programmesqueezingTime = 3000;
	this.timeLost = (this.programmeWashingTime + this.programmesqueezingTime) / 1000;
	
}
Washer.prototype = Object.create(SimpleEquipment.prototype);
Washer.prototype.constructor = Washer;
Washer.prototype.selectProgramme = function(chosenProgramme) {
	this.programmeName = chosenProgramme.name;
	this.programmeTemperature = chosenProgramme.temperature;
	this.programmesqueezingSpeed = chosenProgramme.squeezingSpeed;
	this.programmeWashingTime = chosenProgramme.washingTime;
	this.programmesqueezingTime = chosenProgramme.squeezingTime;
	this.timeLost = (this.programmeWashingTime + this.programmesqueezingTime) / 1000;
}
Washer.prototype.changeProgrammeState = function(newState) {
	this.programmeState = newState;
}

Washer.prototype.runProgramme = function() {
	var that = this;
	function _start(){
		var washingTime = that.programmeWashingTime;
		var squeezingTime = that.programmesqueezingTime;
		_startWashing(washingTime, squeezingTime, 
			(washingTime, squeezingTime) => _washing(
				washingTime, squeezingTime, 
				(squeezingTime) => _squeezing 
					(squeezingTime, 
						() => _autoOff()
					)
				)
			);
		/*_startWashing(washingTime, squeezingTime, _washing
			(washingTime, squeezingTime, _squeezing 
				(squeezingTime, 
					_autoOff.bind(that)).bind(that)).bind.that);*/	}
	
	_start();

	function _startWashing(washingTime, squeezingTime, callback) {		
		that.changeProgrammeState("washing");
		callback(washingTime, squeezingTime);
	}	
						
	function _washing(washingTime, squeezingTime, callback) {	
		function wash() {
			that.changeProgrammeState("squeezing");
			callback(squeezingTime); 	
		}
		setTimeout(wash, washingTime);	
	}
	
	function _squeezing(squeezingTime, callback) {
		function squeeze() {
			that.changeProgrammeState("finished");
			callback();				
		}
		setTimeout(squeeze, squeezingTime);				
	}
	
	function _autoOff() {		
		function wait() {
			that.changeProgrammeState("waiting");
			that.changeState(); 	
		}
		setTimeout(wait, 3000);		
	}
}	
	
var switcher = {
	turn: function(state) {
		if (state == true) {
		return false;
		} else {
		return true;
		}
	}
}

var warningMaker = {
	alarm: function(alarmText) {
		alert(alarmText);
	}
}

class HtmlSimpleEquipment {
	constructor (object){
		console.log(object);
		for (let key in object) {
			this[key] = object[key];
			
		}
		this.changeState = object.changeState;
		this.htmlEquipment = "";
		this.htmlSwitcher = "";		
	}
	
	createHtmlItem() {
		this.htmlEquipment = document.getElementById(this.pattern).cloneNode(true);
		this.htmlEquipment.id = this._name;
		this.htmlEquipment.style.display = "block";
		this.htmlEquipment.children[0].innerHTML = this._name;
		
		document.body.appendChild(this.htmlEquipment);
		
		this.htmlSwitcher = this.htmlEquipment.children[1].children[0];
		this.htmlSwitcher.onchange = () => {		
			this.changeState();
			this.createSwitcherHtmlEffect()
		}
	}
	
	createSwitcherHtmlEffect() {}			
}

class HtmlLamp extends HtmlSimpleEquipment {
	constructor(object) {
		super(object);
		this.pattern = "lampPattern";
	}
	createSwitcherHtmlEffect() {
		let lampImg = this.htmlEquipment.getElementsByTagName("img")[0];
		if (this._OnOffState == true) {
			lampImg.setAttribute("src", "./images/lamp_on.jpg");				
			lampImg.setAttribute("alt", "Lamp is on");
		} else {
			lampImg.setAttribute("src", "./images/lamp_off.jpg");				
			lampImg.setAttribute("alt", "Lamp is off");			
		}
	}
}

class HtmlChandelier extends HtmlSimpleEquipment {
	constructor (object){
		super(object);
		this.htmlRegulator = "";
		this.pattern = "chandelierPattern";			
		this.setLightVolume = object.setLightVolume;
	}	
	
	createHtmlItem() {
		super.createHtmlItem();
		this.htmlRegulator = this.htmlEquipment.children[2].children[0];
		this.htmlRegulator.min = this.minVolume;
		this.htmlRegulator.max = this.maxVolume;
		this.htmlRegulator.step = this.step;
		this.htmlRegulator.value = this._currentVolume;
		this.htmlRegulator.onchange = () => {
			this.setLightVolume(this.htmlRegulator.value);
			let spanVolume = this.htmlRegulator.nextElementSibling.children[0];
			spanVolume.innerText = this._currentVolume;
		}
		document.body.appendChild(this.htmlEquipment);
	}
	
	createSwitcherHtmlEffect() {
		if (this._OnOffState == true) {
			this.htmlSwitcher.nextElementSibling.innerHTML = "light is on";
		} else {
			this.htmlSwitcher.nextElementSibling.innerHTML = "light is off";
		}
	}	
}
	
class HtmlWasher extends HtmlSimpleEquipment {
	constructor (object){
		super(object);
		this.pattern = "washerPattern";	
		this.selectProgramme = object.selectProgramme;
		this._washing =	object._washing;
		this._squeezing =	object._squeezing;
		this._autoOff = object._autoOff;
		this.changeProgrammeState = object.changeProgrammeState;
		this.runProgramme = object.runProgramme;
		this.htmlTablo = "";
		this.htmlStartButton = "";
		this.htmlProgrammesList = [];		
	}		
	
	createHtmlItem() {
		super.createHtmlItem();	
		this.htmlProgrammesList = this.htmlEquipment.children[2].children[0].children[1].children[0].children;
			console.log (this.htmlProgrammesList);
			console.log (this.htmlProgrammesList[0]);
		for (let i = 0; i < this.htmlProgrammesList.length; i++) {
			this.htmlProgrammesList[i].onchange = () => {
				this.selectProgramme(this.programmes[i]);
				tabloTimerFunc();
			}
		}
		
		this.htmlStartButton = this.htmlEquipment.children[3].children[0];
		
		this.htmlStartButton.onclick = () => {
			if (this._OnOffState == true) {
				this.runProgramme();
				setInterval(
				() => {
					tabloTimerFunc();
					this.createSwitcherHtmlEffect();
				}, 500);			
			} 			
		}
		
		this.htmlTablo = this.htmlEquipment.children[4];
		
		let tabloTimerFunc = () => {
		this.htmlTablo.children[0].children[0].innerHTML = this.programmeName;
		this.htmlTablo.children[1].children[0].innerHTML = this.programmeState;
		this.htmlTablo.children[2].children[0].innerHTML = this.programmeTemperature;
		this.htmlTablo.children[3].children[0].innerHTML = this.programmesqueezingSpeed;
		this.htmlTablo.children[4].children[0].innerHTML = this.timeLost;
		} 
				
		tabloTimerFunc()
	}
	
	createSwitcherHtmlEffect() {
		if (this._OnOffState == true) {
			this.htmlSwitcher.nextElementSibling.innerHTML = "Washer is on";
			this.htmlTablo.style.display = "block";
			this.htmlSwitcher.checked = true;
		} else {
			this.htmlSwitcher.nextElementSibling.innerHTML = "Washer is off";
			this.htmlTablo.style.display = "none";
			this.htmlSwitcher.checked = false;
		}
	}		
}

var lamp = [];
var htmlLamp = [];
var lampCounter = 0;
function createLamps (){
 	lamp[lampCounter] = new Lamp("lamp " + (lampCounter + 1));
	console.log(lamp[lampCounter]);
	htmlLamp[lampCounter] = new HtmlLamp (lamp[lampCounter]); 
	htmlLamp[lampCounter].createHtmlItem();
	lampCounter++;
}

var chandelier = [];
var htmlChandelier = [];
var ChandelierCounter = 0;
function createChandeliers (){
 	chandelier[ChandelierCounter] = new Chandelier("chandelier " + (ChandelierCounter + 1), "chandelierPattern");
	htmlChandelier[ChandelierCounter] = new HtmlChandelier(chandelier[ChandelierCounter]);
	htmlChandelier[ChandelierCounter].createHtmlItem();
	ChandelierCounter++;
}

var washer = [];
var htmlWasher = [];
var washerCounter = 0;
function createWashers (){
 	washer[washerCounter] = new Washer("washer " + (washerCounter + 1));
	htmlWasher[washerCounter] = new HtmlWasher(washer[washerCounter]);
	htmlWasher[washerCounter].createHtmlItem();
	washerCounter++;
}