exports.test = require('tape-promise').default(require('tape'));
exports.browser = require('webextension-polyfill');
exports.userCall = (instructions, callback) => {
	return new Promise(resolve => {
		console.log(`%cType ok, press Enter and then ${instructions}`, 'padding: 1em; font-weight: bold');
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
	});
};

Object.defineProperty(window, 'bye', {
	get() {
		return chrome.management.uninstallSelf();
	}
});

exports.test.onFinish(() => console.log('%cSuccess!!', 'text-shadow: 0 0 1em lightgreen; font-weight: bold; font-size: 3em; padding: 2em'));
exports.test.onFailure(() => console.warn('You might want to uninstall the extension before re-testing. Type bye to uninstall'));
