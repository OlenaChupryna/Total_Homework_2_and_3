"use strict";

class SimpleEquipment {
	constructor (name){
		this._name = name;
		this._OnOffState = false;
		this.switcher = Switcher;			
	}
	changeState() {
		this._OnOffState = this.switcher.turn(this._OnOffState);		
	}			
}

class Lamp extends SimpleEquipment {}

class Chandelier extends SimpleEquipment {
	constructor (name){
		super(name);
		this.warningMaker = WarningMaker;
		this._currentVolume = 50;
		this.maxVolume = 100;
		this.minVolume = 0;
		this.step = 10;		
	}
	
	setLightVolume(newVolume) {
		if (this._OnOffState == true) {
			this._currentVolume = newVolume;
		} else {
			this.warningMaker.alarm("Turn me on!");
		}
	}		
}

class Washer extends SimpleEquipment {
	constructor (name){
		super(name);
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
				squeezingTime: 2000
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

	selectProgramme(chosenProgramme) {
		this.programmeName = chosenProgramme.name;
		this.programmeTemperature = chosenProgramme.temperature;
		this.programmesqueezingSpeed = chosenProgramme.squeezingSpeed;
		this.programmeWashingTime = chosenProgramme.washingTime;
		this.programmesqueezingTime = chosenProgramme.squeezingTime;	
		this.timeLost = (this.programmeWashingTime + this.programmesqueezingTime) / 1000;
	}
	
	changeProgrammeState(newState) {
		this.programmeState = newState;
	}
		
	runProgramme(washingTime = this.programmeWashingTime, squeezingTime = this.programmesqueezingTime) {	
		let that = this;
		function* promiseGenerator(washingTime, squeezingTime) { 
			let squeezingTimeRes = yield that._washing(washingTime, squeezingTime); 
			let onOffStateRes = yield that._squeezing(squeezingTimeRes); 
			yield that._autoOff(onOffStateRes);	
		}
		let pg = promiseGenerator(washingTime, squeezingTime);
		pg.next(washingTime, squeezingTime).value.then(
			(squeezingTimeRes) => pg.next(squeezingTimeRes).value.then(
				(onOffStateRes) => pg.next(onOffStateRes)				
			)
		);			
	}	
	
	_washing(washingTime, squeezingTime) {
		return new Promise((resolve) => {
			this.changeProgrammeState("washing");
			setTimeout( 
				() => {
					resolve(squeezingTime);
				},
				washingTime
			);
		});
	}

	
	_squeezing(squeezingTime) {
		return new Promise((resolve) => {
			this.changeProgrammeState("squeezing");
			setTimeout(
				() => resolve(true),
				squeezingTime
			);
		});
	}

	_autoOff() {
		return new Promise((resolve) => {
			this.changeProgrammeState("finished");
			setTimeout(
				() => {
					this.changeProgrammeState("waiting");
					this.changeState(); 					
				},
				3000
			);
		});
	}		
}

class Switcher {
	static turn(state) {
		if (state == true) {
		return false;
		} else {
		return true;
		}
	}
}

class WarningMaker {
	static alarm (alarmText) {
		alert(alarmText);
	}
}

class HtmlSimpleEquipment {
	constructor (object){
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
				}, 1000);				
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


let lamp = [];
let htmlLamp = [];
let lampCounter = 0;
function createLamps (){
 	lamp[lampCounter] = new Lamp("lamp " + (lampCounter + 1));
	htmlLamp[lampCounter] = new HtmlLamp (lamp[lampCounter]); 
	htmlLamp[lampCounter].createHtmlItem();
	lampCounter++;
}

let chandelier = [];
let htmlChandelier = [];
let ChandelierCounter = 0;
function createChandeliers (){
 	chandelier[ChandelierCounter] = new Chandelier("chandelier " + (ChandelierCounter + 1), "chandelierPattern");
	htmlChandelier[ChandelierCounter] = new HtmlChandelier(chandelier[ChandelierCounter]);
	htmlChandelier[ChandelierCounter].createHtmlItem();
	ChandelierCounter++;
}

let washer = [];
let htmlWasher = [];
let washerCounter = 0;
function createWashers (){
 	washer[washerCounter] = new Washer("washer " + (washerCounter + 1));
	htmlWasher[washerCounter] = new HtmlWasher(washer[washerCounter]);
	htmlWasher[washerCounter].createHtmlItem();
	washerCounter++;
}