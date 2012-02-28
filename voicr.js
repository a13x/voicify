exports.init = init;

var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var player = models.player;
var voice_url = 'http://lenny.a13x.net/tw/voice';

/*
	Models and Collections
*/

window.User = Backbone.Model.extend({
	
});

window.UserList = Backbone.Collection.extend({
	model: User,
	localStorage: new Store("users")
});

window.Users = new UserList;

window.UserView = Backbone.View.extend({
	tagName: 'li',
	template: '<li id="{{ id }}">{{ name }} ({{ phone }})</li>',
	render: function() {
		$(this.el).html(Mustache.to_html(this.template, this.model.toJSON()));
		return this;
	}
});

function init () {
	displayPlayedTrack();
	player.observe(models.EVENT.CHANGE, function (ev) {
		if (ev.data.curtrack == true) {
			callEveryone();
		}
	});
	console.log("starting the app...");
	Users.fetch();
	displayAllUsers();
	console.log("app started...");
	$("#add").on("click", addOne);
	Users.on("add", function(user) {
		displayOne(user);
		clear();		
	});
}

function addOne(ev) {
	var name = $("#name").val();
	var phone = $("#number").val();
	var addedUser = Users.create({
		name: name,
		phone: phone
	});
}

function clear() {
	$("#name").val('');
	$("#number").val('');
}

function displayAllUsers() {
	Users.each(displayOne);
}

function displayOne(user) {
	var view = new UserView({model: user});
	$("#calls").append(view.render().el);
}

function displayPlayedTrack () {
	var track = player.track;
	if (track != null) {
		$('#info').html(track.name);
	}
}

function callOne(user, song) {
	var us = user.toJSON();
	var params = {"name": us.name, "number": us.phone, "song": player.track.name};
	$.post(voice_url, params, function () {
		console.log("called user " + params.name);
	});
}

function callEveryone () {
	var track = player.track;
	if (track != null) {
		Users.each(callOne);		
	}
}