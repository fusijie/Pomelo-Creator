var pomelo = require('pomelo');
var dispatcher = require('./app/util/dispatcher');
var abuseFilter = require('./app/servers/chat/filter/abuseFilter');

// route definition for chat server
var chatRoute = function(session, msg, app, cb) {
  var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}
	var res = dispatcher.dispatch(session.get('rid'), chatServers);
	cb(null, res.id);
};

// route for time server
var timeRoute = function(routeParam, msg, app, cb) {
  var timeServers = app.getServersByType('time');
  cb(null, timeServers[routeParam % timeServers.length].id);
}

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'HelloWorld');

// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true
    });
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
      connector : pomelo.connectors.hybridconnector,
      useDict : true,
      useProtobuf : true
		});
});

app.configure('production|development', 'chat', function() {
	app.filter(abuseFilter());
});

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('chat', chatRoute);

	// filter configures
	app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
