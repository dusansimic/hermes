const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		lastWindowState: {
			width: 800,
			height: 600
		},
		autoHideMenuBar: false,
		showOnStartup: true
	}
});
