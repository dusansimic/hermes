const electron = require('electron');
const config = require('./config');

const fileSubmenu = [
	{
		label: 'Auto Hide Menu Bar',
		type: 'checkbox',
		checked: config.get('autoHideMenuBar'),
		click(item, focusedWindow) {
			config.set('autoHideMenuBar', item.checked);
			focusedWindow.setAutoHideMenuBar(item.checked);
			focusedWindow.setMenuBarVisibility(!item.checked);
		}
	}
];

const tpl = [
	{
		label: 'File',
		submenu: fileSubmenu
	}
];

module.exports = electron.Menu.buildFromTemplate(tpl);
