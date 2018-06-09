const path = require('path');
const electron = require('electron');
const tray = require('./tray');
const config = require('./config');
const appMenu = require('./menu');

const domain = 'web.whatsapp.com';
const {app, ipcMain, Menu, nativeImage} = electron;

app.setAppUserModelId('me.dusansimic.hermes');

let mainWindow;
let isQuiting = false;

const isAlreadyRunning = app.makeSingleInstance(() => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

if (isAlreadyRunning) {
	app.quit();
}

function updateBadge(title, titlePrefix) {
	if (title.indexOf(titlePrefix) === -1) {
		return;
	}

	let messageCount = (/\((\d+)\)/).exec(title);
	messageCount = messageCount ? Number(messageCount[1]) : 0;

	if (process.platform === 'darwin' || process.platform === 'linux') {
		if (config.get('showUnreadBadge')) {
			app.setBadgeCount(messageCount);
		}
	}

	if ((process.platform === 'linux' || process.platform === 'win32') && config.get('showUnreadBadge', true)) {
		tray.setBadge(messageCount);
	}
}

function createMainWindow() {
	const lastWindowState = config.get('lastWindowState');
	const mainURL = `https://${domain}/`;
	const titlePrefix = 'WhatsApp';

	const win = new electron.BrowserWindow({
		title: app.getName(),
		show: config.get('showOnStartup'),
		x: lastWindowState.x,
		y: lastWindowState.y,
		width: lastWindowState.width,
		height: lastWindowState.height,
		icon: process.platform === 'linux' && path.join(__dirname, 'static/Icon.png'),
		minWidth: 400,
		minHeight: 200,
		autoHideMenuBar: config.get('autoHideMenuBar'),
		webPreferences: {
			preload: path.join(__dirname, 'browser.js'),
			nodeIntegration: false,
			plugins: true
		}
	});

	if (process.platform === 'darwin') {
		win.setSheetOffset(40);
	}

	win.loadURL(mainURL);

	win.on('close', e => {
		if (!isQuiting) {
			e.preventDefault();

			win.blur();

			if (process.platform === 'darwin') {
				app.hide();
			} else {
				win.hide();
			}
		}
	});

	win.on('page-title-updated', (e, title) => {
		e.preventDefault();
		updateBadge(title, titlePrefix);
	});

	win.on('focus', () => {
		win.flashFrame(false);
	});

	return win;
}

app.on('ready', () => {
	electron.Menu.setApplicationMenu(appMenu);
	mainWindow = createMainWindow();
	tray.create(mainWindow);

	const {webContents} = mainWindow;

	webContents.on('will-navigate', (e, url) => {
		const {hostname} = new URL(url);
		if (hostname === 'web.whatsapp.com') {
			return;
		}

		e.preventDefault();
		electron.shell.openExternal(url);
	});
});

app.on('activate', () => {
	mainWindow.show();
});

app.on('before-quit', () => {
	isQuiting = true;

	if (!mainWindow.isFullScreen()) {
		config.set('lastWindowState', mainWindow.getBounds());
	}
});
