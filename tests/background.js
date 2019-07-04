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
		browser.permissions.onAdded.addListener(resolve);
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

test('onAdded: true (already there)', async t => {
	browser.permissions.onAdded.addListener(t.fail);
	const user = browser.permissions.request({
		origins: ['https://youtube.com/*']
	});
	t.true(await user);
	t.deepEqual(await browser.permissions.getAll(), jointPermissions);
});

test('onRemoved: true', async t => {
	const listener = new Promise(resolve => {
		browser.permissions.onRemoved.addListener(resolve);
	});
	const request = browser.permissions.remove({
		origins: ['https://youtube.com/*']
	});
	t.true(await request);
	t.deepEqual(await listener, onlyYouTubePermission);
	t.deepEqual(await browser.permissions.getAll(), onlyGooglePermission);
});

test('onRemoved: true (already not there)', async t => {
	browser.permissions.onAdded.addListener(t.fail);
	const request = browser.permissions.remove({
		origins: ['https://youtube.com/*']
	});
	t.true(await request);
	t.deepEqual(await browser.permissions.getAll(), onlyGooglePermission);
});
