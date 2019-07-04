type PermissionChangeCallback = (callback: chrome.permissions.Permissions) => void;

const events = [
	['request', 'onAdded'],
	['remove', 'onRemoved']
] as const;

const isFirefox = navigator.userAgent.includes('Firefox/');

if (chrome.permissions && !chrome.permissions.onAdded) {
	for (const [action, event] of events) {
		const act = chrome.permissions[action];
		const listeners = new Set<PermissionChangeCallback>();

		// Collect
		chrome.permissions[event] = {
			addListener(callback) {
				listeners.add(callback);
			}
		};

		// Listen into requests and fire callbacks
		chrome.permissions[action] = async (permissions, callback) => {
			const initial = browser.permissions.contains(permissions);
			const expected = action === 'request';
			act(permissions, async successful => {
				if (callback) {
					callback(successful);
				}

				if (!successful) {
					return;
				}

				// Only fire events if they changed
				if (await initial !== expected) {
					const fullPermissions = {origins: [], permissions: [], ...permissions};

					// Firefox won't run asynchronous functions without this
					chrome.permissions.getAll(() => {
						for (const listener of listeners) {
							setTimeout(listener, 0, fullPermissions); // Run all listeners even if one errors
						}
					});
				}
			});
		};

		if (isFirefox) {
			browser.permissions[event] = chrome.permissions[event];
			browser.permissions[action] = (permissions: chrome.permissions.Permissions) => new Promise((resolve, reject) => {
				chrome.permissions[action](permissions, result => {
					if (chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						resolve(result);
					}
				});
			});
		}
	}
}
