'use strict';
if (typeof AudioHelper === 'undefined') {
    throw new Error('explosion.js requires helpers.js'); 
}


// (global) Array of particles
var particles = [];

var canvas, context;

var Game = {fps:50};

//Game Loop (At this moment only to draw explosion smoothly)
Game.run = function() {
	update(13);
};

window.onload = function(){
	//auto login (remove)
	// document.getElementById("username").value = "something";
	// document.getElementById("login-button").click();

	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	// Start the loop
	Game._intervalId = setInterval(Game.run, 1000 / Game.fps);

	// To stop the loop, use:
	// clearInterval(Game._intervalId);
}

//A single explosion particle
function Particle (){
	this.scale = 1.0;
	this.x = 0;
	this.y = 0;
	this.radius = 40;
	this.color = "#000";
	this.velocityX = 0;
	this.velocityY = 0;
	this.scaleSpeed = 0.5;

	this.update = function(ms){
		// shrinking
		this.scale -= this.scaleSpeed * ms / 1000.0;

		if (this.scale <= 0){
			this.scale = 0;
		}
		// moving away from explosion center
		this.x += this.velocityX * ms/1000.0;
		this.y += this.velocityY * ms/1000.0;
	};

	this.draw = function(context2D){
		var hR = (context2D.width)/(context2D.height);
		var wR = (context2D.height)/(context2D.width);

		// translating the 2D context to the particle coordinates
		context2D.save();
		context2D.translate(this.x, this.y);
		context2D.scale(this.scale, this.scale);

		context2D.beginPath();
		context2D.arc(0, 0, this.radius, 0, Math.PI*2, true);
		context2D.closePath();

		context2D.fillStyle = this.color;
		context2D.fill();

		context2D.restore();
	};
}

//Update method that redraws explosion particles
function update (frameDelay){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	// update and draw particles
	for (var i=0; i<particles.length; i++){
		var particle = particles[i];
		particle.update(frameDelay);
		particle.draw(context);
	}
}

//Triggers the provided number of explosions, spaced 
//out by the given number of milliseconds
function goKaput(limit, delay){
	AudioHelper.play('boom');
	explosionSet();
	var timesRun = 0;
	var interval = setInterval(function(){
	    timesRun += 1;
	    if(timesRun === limit-1){
	        clearInterval(interval);
	    }
	    explosionSet();
	}, delay);
	StyleHelper.fadeOut('.circle', 75);
}

function explosionSet(){
	AudioHelper.restart('shortBoom');
	var w = context.canvas.width;
	var h = context.canvas.height;
	var x = randomFloat(150, w-25);
	var y = randomFloat(50, h-50);
	createExplosion(x, y, "#525252");
	createExplosion(x, y, "#F22800");
	createExplosion(x, y, "#FFA318");
}

//Advanced Explosion effect
function createExplosion(x, y, color){
	var minSize = 10;
	var maxSize = 30;
	var count = 10;
	var minSpeed = 60.0;
	var maxSpeed = 250.0;
	var minScaleSpeed = 1.0;
	var maxScaleSpeed = 4.0;

	for (var angle=0; angle<360; angle += Math.round(360/count)){
		var particle = new Particle();
		particle.x = x;
		particle.y = y;
		particle.radius = randomFloat(minSize, maxSize);
		particle.color = color;
		particle.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);

		var speed = randomFloat(minSpeed, maxSpeed);
		particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
		particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);

		particles.push(particle);
	}
}

function randomFloat (min, max){
	return min + Math.random()*(max-min);
}