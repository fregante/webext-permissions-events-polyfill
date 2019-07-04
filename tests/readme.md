# tests

Tests are not automated. Run this command to enable bundling of the test files (watches for changes)

```sh
npm run test-manually
```

## Firefox

1. Load the `manifest.json` in `about:debugging`
2. Click `debug`
3. Follow the instructions given in the Console tab
4. **Remove** the extension between tests; reloading it isn't enough

## Chrome

1. `Load unpacked` in `chrome://extensions/`
2. Click `background page` to inspect it
3. Follow the instructions given in the Console tab
4. **Remove** the extension between tests; reloading it isn't enough
