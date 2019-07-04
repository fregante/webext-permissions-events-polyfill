/* eslint-disable no-throw-literal, no-async-promise-executor  */

const browser = require('webextension-polyfill');

exports.browser = browser;
exports.test = require('tape-promise').default(require('tape'));

exports.userCall = (instructions, callback) => {
	return new Promise(async resolve => {
		if (navigator.userAgent.includes('Firefox/')) {
			const id = await browser.contextMenus.create({
				title: '--- Click me ---',
				contexts: ['all']
			});

			console.log(`%c\nVisit https://www.google.com \nRight click anywhere\n"Click me"\n${instructions}`, 'padding: 1em; font-weight: bold');

			browser.contextMenus.onClicked.addListener(async info => {
				if (info.menuItemId === id) {
					resolve(await callback());
					browser.contextMenus.remove(id);
				}
			});
		} else {
			console.log(`%cType ok\nPress Enter\n${instructions}`, 'padding: 1em; font-weight: bold');
			Object.defineProperty(window, 'ok', {
				get() {
					(async () => {
						resolve(await callback());
					})();

					delete window.ok;
					return 'Thanks!';
				},
				configurable: true
			});
		}
	});
};

Object.defineProperty(window, 'bye', {
	get() {
		return chrome.management.uninstallSelf();
	}
});

exports.test.onFinish(() => console.log('%cSuccess!!', 'text-shadow: 0 0 1em lightgreen; font-weight: bold; font-size: 3em; padding: 2em'));
exports.test.onFailure(() => {
	throw 'You might want to uninstall the extension before re-testing. Type bye to uninstall';
});
