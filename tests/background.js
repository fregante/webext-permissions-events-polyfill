const {browser, test, userCall} = require('./helper');

require('..');

const onlyGooglePermission = {
	origins: [
		'https://www.google.com/*'
	],
	permissions: []
};

const onlyYouTubePermission = {
	origins: [
		'https://youtube.com/*'
	],
	permissions: []
};

const jointPermissions = {
	origins: [
		'https://www.google.com/*',
		'https://youtube.com/*'
	],
	permissions: []
};

test('Config tape', async t => {
	t.deepEqual(await browser.permissions.getAll(), onlyGooglePermission);
});

test('onAdded: false', async t => {
	const user = userCall('DENY the permission request', () =>
		browser.permissions.request({
			origins: ['https://youtube.com/*']
		})
	);
	t.false(await user);
	t.deepEqual(await browser.permissions.getAll(), onlyGooglePermission);
});

test('onAdded: true', async t => {
	const listener = new Promise(resolve => {
		chrome.permissions.onAdded.addListener(resolve);
	});
	const user = userCall('ALLOW the permission request', () =>
		browser.permissions.request({
			origins: ['https://youtube.com/*']
		})
	);
	t.true(await user);
	t.deepEqual(await listener, onlyYouTubePermission);
	t.deepEqual(await browser.permissions.getAll(), jointPermissions);
});
