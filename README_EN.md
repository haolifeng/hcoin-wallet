# HCoinWallet

A desktop wallet built with **Electron + Vite + React + MobX**.

[简体中文](./README.md) | English

---

## Requirements

| Dependency    | Version                  | Notes                                                        |
| ------------- | ------------------------ | ------------------------------------------------------------ |
| Node          | 20 / 22                  | **Use Node 22 for packaging** (some electron-builder 26 dependencies require ≥22.12). **Do not use Node 23+** (e.g. v26) — it breaks Electron / electron-builder compatibility and produces many warnings |
| npm           | >= 9                     | —                                                            |
| OS            | Windows / macOS / Linux  | —                                                            |

> Switch versions with nvm:
>
> ```bash
> nvm install 22
> nvm use 22
> ```

---

## Quick Start

```bash
# 1. Install dependencies (the Electron binary is downloaded automatically)
npm install

# 2. Start the dev environment (Vite + Electron window)
npm run electron:dev
```

`electron:dev` runs `vite`; `vite-plugin-electron` compiles the main process / preload script and launches Electron automatically.

---

## Scripts

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `npm run dev`             | Start the Vite dev server only (no Electron)                |
| `npm run electron:dev`    | Start Vite and launch Electron (development)                |
| `npm run build`           | TypeScript compile + Vite build into `dist/`                |
| `npm run icons`           | Generate app icons into `build/` (ico / icns / png)         |
| `npm run dist`            | Package for the current platform (= `electron:build`)       |
| `npm run dist:win`        | Package for Windows (NSIS installer + portable)             |
| `npm run dist:mac`        | Package for macOS (dmg + zip, arm64 / x64)                  |
| `npm run dist:linux`      | Package for Linux (AppImage + deb + tar.gz)                 |
| `npm run dist:all`        | Build all three platforms in one run                        |
| `npm run dist:dir`        | Build unpacked directories only — fast way to validate the packaging config |
| `npm run electron:install`| Re-download / repair the Electron binary                    |

---

## Mirrors & Network

`.npmrc` in the project root points to a mirror to speed up dependency and binary downloads:

```ini
registry=https://registry.npmmirror.com
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
ignore-scripts=false
```

- `electron_mirror`: download URL for the Electron binary (~100 MB).
- `electron_builder_binaries_mirror`: download URL for the tools electron-builder needs.
- `ignore-scripts=false`: **required**, otherwise the `postinstall` hook that downloads Electron never runs.

> To use another mirror temporarily, set environment variables (they take precedence over `.npmrc`):
>
> ```bash
> export ELECTRON_MIRROR="https://your-mirror.example.com/electron/"
> npm run electron:install
> ```

---

## Security Design

The core assumption of this wallet is: **the renderer process is not trusted**. Private keys and signing live only in the main process, and every transfer requires re-entering the password.

| Mechanism | Where | Description |
| --- | --- | --- |
| Keys stay in the main process | `electron/session.ts` | Mnemonic decryption, key derivation and signing happen in the main process; only addresses are sent to the UI |
| Re-authentication before signing | `electron/main.ts` (`wallet:send`) | Every transaction must carry the payment password; the main process verifies it via AES-GCM authentication, and failures count toward rate limiting |
| Auto lock | `electron/main.ts` | Private keys in memory are discarded after 5 minutes of system idle time, on screen lock, and on suspend; the UI returns to the unlock screen |
| Manual lock | Header **Lock** button | Destroys the session immediately; later send requests fail with "wallet locked" |
| IPC sender validation | `electron/security.ts` | Every IPC channel checks that `senderFrame.url` is one of the app's own pages |
| Password policy (enforced in main) | `electron/security.ts` | ≥8 chars with upper/lower case, digit and special character; bypassing the UI and calling IPC directly is rejected too |
| Auth rate limiting | `electron/security.ts` | After 5 failures the wallet locks for 15s, with exponential backoff up to 5 minutes |
| Mnemonic encryption | `electron/db/index.ts` | AES-256-GCM + scrypt(N=131072, r=8, p=1, 128MB), derived asynchronously so the main process never blocks |
| Renderer hardening | `electron/main.ts` | `contextIsolation` + `sandbox`, Node disabled, DevTools disabled in production, navigation and new windows intercepted |
| CSP | `vite.config.ts` (production only) | No remote scripts, no inline scripts, no arbitrary outbound requests; `connect-src` allows only the price API |
| Amount & fee guards | `electron/bitcoin.ts`, `electron/solana.ts` | Amounts exceeding the precision are rejected (never silently truncated); BTC fee rate is clamped to 1–1000 sat/vB; outbound requests time out after 15s |

> Compatibility: after raising the scrypt parameters, existing accounts can still be unlocked — decryption uses the parameters recorded inside the ciphertext.

**Not covered yet (recommended next steps)**: installer code signing / notarization, auto-update, multi-source cross-validation for RPC and block explorer APIs, hardware wallet support.

---

## Packaging & Distribution

Packaging uses electron-builder; the config lives in the `build` field of `package.json`, and icon assets live in `build/`.

### Build all three platforms at once

```bash
npm run dist:all
```

Or build a single platform:

```bash
npm run dist:win     # Windows
npm run dist:mac     # macOS
npm run dist:linux   # Linux
npm run dist         # current platform only
```

Artifacts are written to `release/<version>/`:

| Platform | Artifact | Notes |
| --- | --- | --- |
| Windows | `HCoinWallet-1.0.0-x64-setup.exe` | NSIS installer, custom install directory |
| Windows | `HCoinWallet-1.0.0-x64-portable.exe` | Portable build, no installation |
| macOS | `HCoinWallet-1.0.0-arm64.dmg` / `-x64.dmg` | Apple silicon / Intel disk images |
| macOS | `HCoinWallet-1.0.0-<arch>.zip` | ZIP archive (easy distribution / auto-update) |
| Linux | `HCoinWallet-1.0.0-x86_64.AppImage` | Self-contained executable |
| Linux | `HCoinWallet-1.0.0-amd64.deb` | Debian / Ubuntu package |
| Linux | `HCoinWallet-1.0.0-x64.tar.gz` | Archive |

> To validate the packaging config quickly without producing installers: `npm run dist:dir`.

### Build machine requirements

| Target | Build machine | Notes |
| --- | --- | --- |
| Windows | Windows / macOS / Linux | electron-builder downloads NSIS and wine automatically; no cross toolchain needed |
| Linux | Linux / macOS | — |
| macOS | **macOS only** | dmg depends on `hdiutil`, and signing / notarization can only be done on macOS |

So **run `npm run dist:all` on macOS to produce all three platforms**; for full automation, build each platform on its own machine (or container) in CI.

### Icons

Icons under `build/` are generated by a zero-dependency script (no sharp / ImageMagick / iconutil, works on Windows and Linux too):

```bash
npm run icons                        # skipped if already present
node scripts/gen-icons.js --force    # force rebuild after changing the design
```

- `build/icon.ico`: Windows
- `build/icon.icns`: macOS
- `build/icon.png` + `build/icons/*.png`: Linux
- `build/icon.svg`: vector source (for preview only, not packaged)

Edit `DESIGN` at the top of `scripts/gen-icons.js` to change colors and glyphs.

### Code signing

The default configuration is **unsigned** (`build.mac.identity: null`) so local builds work out of the box:

- On macOS the first launch shows "developer cannot be verified": right-click → Open, or run
  `xattr -dr com.apple.quarantine /Applications/HCoinWallet.app`.
- On Windows SmartScreen warns for unsigned binaries and the user must click "Run anyway".

For a real release:

```bash
# macOS: remove the null value of build.mac.identity and provide a certificate
export CSC_LINK=/path/to/cert.p12
export CSC_KEY_PASSWORD=******
# Notarization (optional, requires an Apple developer account)
export APPLE_ID=you@example.com
export APPLE_APP_SPECIFIC_PASSWORD=****
export APPLE_TEAM_ID=XXXXXXXXXX
npm run dist:mac

# Windows: provide a pfx certificate through the same CSC_LINK / CSC_KEY_PASSWORD
npm run dist:win
```

### Packaging internals

- `build.files` contains only `dist/`, `dist-electron/` and `package.json`; production dependencies are collected automatically by electron-builder, so devDependencies never end up in the installer.
- Native modules such as `classic-level` (`.node`) are unpacked via `asarUnpack` into `app.asar.unpacked/`, because they cannot be `dlopen`ed from inside an asar.
- `npmRebuild: false`: native modules use official prebuilt binaries (`classic-level` `prebuilds/` cover `win32-x64`, `linux-x64`, `darwin-x64+arm64`), so no local build toolchain is required.
- `electronDownload.mirror` points to npmmirror to avoid stalls when fetching Electron from GitHub.

---

## FAQ

### 1. `Electron failed to install correctly, please delete node_modules/electron and try installing again`

**Cause**: the Electron binary download was incomplete — `node_modules/electron/dist/` misses `electron.exe` (or the corresponding executable) and `path.txt` was not generated. Usually caused by a network interruption during install.

**Fix**:

```bash
# Clear the @electron/get cache
rm -rf "$LOCALAPPDATA/electron/Cache"     # Windows
rm -rf ~/Library/Caches/electron          # macOS

# Remove the incomplete electron
rm -rf node_modules/electron

# Reinstall (through the mirror)
npm install

# If it still fails, install it separately (the script cleans up leftovers and reruns the official installer)
npm run electron:install
```

**Verify** (both should print `True` / the path):

```bash
test -f node_modules/electron/path.txt
test -f node_modules/electron/dist/electron        # macOS/Linux
```

Then run `npm run electron:dev` again.

### 2. npm prints `Unknown project config "electron_mirror"`

This is only a **warning** about an unknown npm config key. The Electron install script still reads it; safe to ignore.

### 3. Errors caused by a too-new Node version

This project requires Node `>=20 <23`; use Node 22 for packaging (some electron-builder 26 dependencies require ≥22.12). On Node 23+, switch to 22 with nvm.

### 4. Downloads fail behind a proxy / intranet

```bash
export HTTPS_PROXY="http://your-proxy:port"
export HTTP_PROXY="http://your-proxy:port"
npm run electron:install
```

---

## Project Structure (partial)

```
.
├── build/                   # packaging assets (icons, generated by scripts/gen-icons.js)
│   ├── icon.ico             # Windows icon
│   ├── icon.icns            # macOS icon
│   ├── icon.png             # Linux icon (512×512)
│   └── icons/               # Linux icons in several sizes
├── electron/
│   ├── main.ts              # Electron main process (IPC, window hardening, auto lock)
│   ├── preload.ts           # preload script (whitelisted API)
│   ├── security.ts          # IPC sender validation, password policy, auth rate limiting
│   ├── session.ts           # in-memory unlocked session (private keys live only here)
│   └── db/                  # LevelDB + encrypted mnemonic storage
├── scripts/
│   ├── gen-icons.js         # app icon generator (zero dependency)
│   └── install-electron.js  # stable Electron binary installer
├── src/                     # React renderer source
├── release/                 # packaging output (git ignored)
├── .npmrc                   # mirror configuration
├── vite.config.ts           # Vite + vite-plugin-electron configuration
└── package.json             # dependencies, scripts and electron-builder config
```
