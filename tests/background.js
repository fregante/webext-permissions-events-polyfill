const {browser, test, userCall} = require('./helper');

require('../index.ts');

function complete(permissions) {
	return {
		...permissions,
		permissions: [
			'contextMenus'
		]
	};
}
const onlyGoogle = {
	origins: [
		'https://www.google.com/*'
	]
};

const onlyYouTube = {
	origins: [
		'https://youtube.com/*'
	]
};

const jointPermissions = {
	origins: [
		'https://www.google.com/*',
		'https://youtube.com/*'
	]
};

test('Config tape', async t => {
	t.deepEqual(await browser.permissions.getAll(), complete(onlyGoogle));
});

test('onAdded: false', async t => {
	const user = userCall('DENY the permission request', () =>
		browser.permissions.request({
			origins: ['https://youtube.com/*']
		})
	);
	t.false(await user);
	t.deepEqual(await browser.permissions.getAll(), complete(onlyGoogle));
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
	t.deepEqual(await listener, onlyYouTube);
	t.deepEqual(await browser.permissions.getAll(), complete(jointPermissions));
});

test('onAdded: true (already there)', async t => {
	chrome.permissions.onAdded.addListener(t.fail);
	const user = browser.permissions.request({
		origins: ['https://youtube.com/*']
	});
	t.true(await user);
	t.deepEqual(await browser.permissions.getAll(), complete(jointPermissions));
});

test('onRemoved: true', async t => {
	const listener = new Promise(resolve => {
		chrome.permissions.onRemoved.addListener(resolve);
	});
	const request = browser.permissions.remove({
		origins: ['https://youtube.com/*']
	});
	t.true(await request);
	t.deepEqual(await listener, onlyYouTube);
	t.deepEqual(await browser.permissions.getAll(), complete(onlyGoogle));
});

test('onRemoved: true (already not there)', async t => {
	chrome.permissions.onRemoved.addListener(t.fail);
	const request = browser.permissions.remove({
		origins: ['https://youtube.com/*']
	});
	t.true(await request);
	t.deepEqual(await browser.permissions.getAll(), complete(onlyGoogle));
});
