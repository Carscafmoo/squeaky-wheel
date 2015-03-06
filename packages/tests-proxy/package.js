Package.describe({
	name: "velocity:test-proxy",
	summary: "Dynamically created package to expose test files to mirrors",
	version: "0.0.4",
	debugOnly: true
});

Package.onUse(function (api) {
	api.use("coffeescript", ["client", "server"]);
	api.add_files("tests/mocha/client/a.js",["client"]);
	api.add_files("tests/mocha/client/axle.js",["client"]);
	api.add_files("tests/mocha/client/squeak.js",["client"]);
	api.add_files("tests/mocha/client/user.js",["client"]);
	api.add_files("tests/mocha/server/activity.js",["server"]);
	api.add_files("tests/mocha/server/axle.js",["server"]);
	api.add_files("tests/mocha/server/squeak.js",["server"]);
	api.add_files("tests/mocha/server/user.js",["server"]);
});