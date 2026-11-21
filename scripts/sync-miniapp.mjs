#!/usr/bin/env node
/**
 * Syncs miniapp-src/app from src/app.
 *
 * src/app is the main application (source of truth). miniapp-src/app is the VK
 * mini app built from the same components, except that it:
 *   - reads data from static JSON files (assets/app_*.json, assets/api_item_*.json)
 *     instead of the backend;
 *   - runs without authentication (no AuthService / TokenStorageService / RouterEventsService);
 *   - has its own shell (app.component, app.module, app-routing.module, shared.module,
 *     environments), which this script never touches.
 *
 * The script copies files/directories listed in COPY_* into miniapp-src/app, applying
 * replacement rules (TRANSFORMS) to the listed files. If a rule no longer matches the
 * source file (the src code has changed), the sync aborts BEFORE writing anything —
 * update the rule in TRANSFORMS.
 *
 * Usage:
 *   node scripts/sync-miniapp.mjs              apply the sync
 *   node scripts/sync-miniapp.mjs --dry-run    show what would change, write nothing
 *   node scripts/sync-miniapp.mjs --check      CI mode: exit 1 if miniapp-src drifts from src
 *   node scripts/sync-miniapp.mjs --clean      additionally remove files that exist in
 *                                              miniapp-src but not in src (inside synced dirs)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_ROOT = join(ROOT, 'src/app');
const DEST_ROOT = join(ROOT, 'miniapp-src/app');

// ---------------------------------------------------------------------------
// What to sync (paths relative to app/)
// ---------------------------------------------------------------------------

// Directories copied recursively "as is"
const COPY_DIRS = [
    'apis/models',
    'apps/models',
    'apps/components/app-adult-validation',
    'apps/components/app-block-element',
    'apps/components/elements',
    'apps/modal-topup-balance',
    'shared/alert',
    'shared/confirm',
    'shared/file-upload',
    'shared/pagination',
    'shared/percent',
    'shared/pipes',
    'shared/share-item',
    'not-found',
];

// Individual files (their parent directories cannot be copied wholesale —
// src contains services/files that do not exist in miniapp)
const COPY_FILES = [
    'helpers/custom-title-strategy.ts',
    'services/messages.service.ts',
    'services/modal.service.ts',
    'services/user-balance.service.ts',
    'services/vk-bridge.service.ts',
    'services/websocket.service.ts',
    'services/api.service.ts',           // + transforms
    'services/application.service.ts',   // + transforms
    'services/data.service.abstract.ts', // + transforms
    'apps/app-shared/app-shared.component.ts',   // + transforms
    'apps/app-shared/app-shared.component.html', // + transforms
];

// Files inside synced directories that are never removed (--clean)
const PROTECTED = [];

// Locales: miniapp-src/locale is a strict subset of src/locale (no keys of its own),
// so they are copied "as is"
const LOCALE_FILES = [
    'messages.json',
    'messages.ru.json',
    'messages.de.json',
    'messages.es.json',
    'messages.fr.json',
    'messages.uk.json',
];

// ---------------------------------------------------------------------------
// Transform rules: exact string replacements applied to the SRC file content.
// `from` must occur exactly `count` times (default 1), otherwise it is an error.
// ---------------------------------------------------------------------------
const TRANSFORMS = {
    'services/api.service.ts': [
        {
            desc: 'API: serve data from static assets instead of the backend',
            from: `        this.requestUrl = \`\${BASE_URL}\${this.locale}/api/v1/api_items\`;\n`,
            to: `        this.requestUrl = 'assets/api_item_';\n`,
        },
    ],
    'services/application.service.ts': [
        {
            desc: 'Applications: serve data from static assets instead of the backend',
            from: `        this.requestUrl = \`\${BASE_URL}\${this.locale}/api/v1/applications\`;\n`,
            to: `        this.requestUrl = \`assets/app_\`;\n`,
        },
    ],
    'services/data.service.abstract.ts': [
        {
            desc: 'Shared item: read {uuid}.json from assets',
            from: `        const url = \`\${this.requestUrl}/\${itemUuid}/shared\`;\n`,
            to: `        const url = \`\${this.requestUrl}\${itemUuid}.json\`;\n`,
        },
    ],
    'apps/app-shared/app-shared.component.ts': [
        {
            desc: 'import: drop TokenStorageService (no auth in the mini app)',
            from: `import { TokenStorageService } from '../../services/token-storage.service';\n`,
            to: '',
        },
        {
            desc: 'import: drop RouterEventsService (no router history in the mini app)',
            from: `import { RouterEventsService } from '../../services/router-events.service';\n`,
            to: '',
        },
        {
            desc: 'import: drop AuthService (no auth in the mini app)',
            from: `import { AuthService } from '../../services/auth.service';\n`,
            to: '',
        },
        {
            desc: 'constructor: drop tokenStorageService parameter',
            from: `        protected tokenStorageService: TokenStorageService,\n`,
            to: '',
        },
        {
            desc: 'constructor: drop routerEventsService parameter',
            from: `        protected routerEventsService: RouterEventsService,\n`,
            to: '',
        },
        {
            desc: 'constructor: drop authService parameter',
            from: `        protected authService: AuthService,\n`,
            to: '',
        },
        {
            desc: 'ngOnInit: static "data" item + VK init instead of router uuid/auth bootstrap',
            from: `    ngOnInit(): void {
        this.data.blocks = [];
        this.isLoggedIn = !!this.tokenStorageService.getToken();
        this.authService.userSubject
            .pipe(takeUntil(this.destroyed$))
            .subscribe((user) => {
                const userId = user ? parseInt(user.url.split('/').pop()) : 0;
                this.isOwner = !!user && this.data.user_id === userId;
                this.isLoggedIn = !!user;
                this.cdr.markForCheck();
            });
        if (!this.itemUuid) {
            this.itemUuid = this.route.snapshot.paramMap.get('uuid');
        }
        if (this.needBackButton === null) {
            this.needBackButton = !!this.routerEventsService.getPreviousUrl();
        }
        if (this.itemUuid) {
            this.getData();
        }
`,
            to: `    ngOnInit(): void {
        this.itemUuid = 'data';
        this.getData();
        if (typeof vkBridge !== 'undefined' && window['isVKApp']) {
            this.isVkApp = true;
            this.vkAppInit();
        }
`,
        },
        {
            desc: 'createAppOptions: drop owner detection via auth (age check stays on ApplicationService.getUserData, as in src)',
            from: `    createAppOptions(): void {
        this.checkExistenceTab();
        const currentUser = this.tokenStorageService.getUser();
        const currentUserId = currentUser ? parseInt(currentUser.url.split('/').pop()) : 0;
        this.isOwner = this.data.user_id === currentUserId;

        if (this.data.adultsOnly) {
`,
            to: `    createAppOptions(): void {
        this.checkExistenceTab();

        if (this.data.adultsOnly) {
`,
        },
        {
            desc: 'startPayment: no redirect to the login page',
            from: `        if (!this.isLoggedIn && !this.isVkApp) {
            this.authService.navigateAuthPage('login');
            return;
        }
`,
            to: `        if (!this.isLoggedIn && !this.isVkApp) {
            return;
        }
`,
        },
        {
            desc: 'navigateBack: no router history — the back button is not used',
            from: `    navigateBack(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        const url = this.routerEventsService.getPreviousUrl(true);
        const queryParams = this.routerEventsService.getPreviousQueryParams();
        this.router.navigate([url], {queryParams});
    }
`,
            to: `    navigateBack(event?: MouseEvent) {

    }
`,
        },
    ],
    'apps/app-shared/app-shared.component.html': [
        {
            desc: 'header: no extra offset for the back button',
            from: `        <div class="flex justify-center gap-3 items-center"
            [ngClass]="{'pl-8 xl:pl-0': needBackButton}">
`,
            to: `        <div class="flex justify-center gap-3 items-center">
`,
        },
        {
            desc: 'header: no owner edit button (isOwner)',
            from: `                <div *ngIf="isOwner">
                    <a class="p-2 rounded-md border border-blue-500 text-blue-500 hover:border-blue-700 hover:text-blue-700 text-md cursor-pointer"
                       [href]="appEditUrl"
                       target="_blank"
                       title="Edit" i18n-title>
                        <i class="bi bi-pencil"></i>
                    </a>
                </div>
`,
            to: '',
        },
        {
            desc: 'layout: no fixed back button (needBackButton)',
            from: `<div class="fixed top-2 left-2 lg:top-4 lg:left-4 z-20" *ngIf="needBackButton">
    <button type="button"
            class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg px-2 py-1 lg:px-4 lg:py-2 text-2xl"
            title="Back"
            i18n-title
            (click)="navigateBack($event)">
        <i class="bi bi-chevron-left"></i>
    </button>
</div>
`,
            to: '',
        },
        {
            desc: 'layout: drop the appAutoScrollOnValue directive (full app only)',
            from: `                                <div [appAutoScrollOnValue]="element"
                                     [ngClass]="{
`,
            to: `                                <div [ngClass]="{
`,
        },
    ],
};

// ---------------------------------------------------------------------------
// Script logic
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CHECK = args.includes('--check');
const CLEAN = args.includes('--clean');

function walk(dir, base = dir) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            out.push(...walk(full, base));
        } else {
            out.push(relative(base, full));
        }
    }
    return out.sort();
}

// The main app must never import from miniapp-src — otherwise `ng build
// api2app-frontend` compiles miniapp files as its own (duplicate selectors,
// template errors leaking between the two apps).
function findCrossImports() {
    const hits = [];
    const scan = (dir) => {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                scan(full);
            } else if (full.endsWith('.ts') || full.endsWith('.html')) {
                const text = readFileSync(full, 'utf8');
                const re = /from\s+['"][^'"]*miniapp-src[^'"]*['"]/g;
                if (re.test(text)) {
                    hits.push(relative(ROOT, full));
                }
            }
        }
    };
    scan(SRC_ROOT);
    return hits;
}

function applyTransforms(relPath, content) {
    const rules = TRANSFORMS[relPath] || [];
    const applied = [];
    for (const rule of rules) {
        const expected = rule.count ?? 1;
        const found = content.split(rule.from).length - 1;
        if (found !== expected) {
            throw new Error(
                `Rule did not match: ${relPath}\n` +
                `  "${rule.desc}" — expected occurrences: ${expected}, found: ${found}\n` +
                `  Update the rule in TRANSFORMS (the src code has changed).`
            );
        }
        content = content.split(rule.from).join(rule.to);
        applied.push(rule.desc);
    }
    return { content, applied };
}

function main() {
    if (!existsSync(SRC_ROOT) || !existsSync(DEST_ROOT)) {
        console.error('src/app or miniapp-src/app not found');
        process.exit(2);
    }

    // Build the file sync list
    const syncSet = new Map(); // relPath -> true
    for (const dir of COPY_DIRS) {
        for (const file of walk(join(SRC_ROOT, dir))) {
            syncSet.set(`${dir}/${file}`.replace(/\\/g, '/'), true);
        }
    }
    for (const file of COPY_FILES) {
        syncSet.set(file, true);
    }
    for (const file of LOCALE_FILES) {
        syncSet.set(`locale/${file}`, true);
    }

    const crossImports = findCrossImports();
    if (crossImports.length) {
        console.error('ERROR: src imports from miniapp-src — the main app would compile miniapp files:');
        crossImports.forEach((f) => console.error(`  ${f}`));
        process.exit(2);
    }

    const results = { created: [], updated: [], unchanged: 0, errors: [] };
    const outputs = new Map(); // destAbs -> content

    const resolvePair = (relPath) => {
        if (relPath.startsWith('locale/')) {
            const file = relPath.slice('locale/'.length);
            return {
                src: join(SRC_ROOT, '..', 'locale', file),
                dest: join(DEST_ROOT, '..', 'locale', file),
            };
        }
        return { src: join(SRC_ROOT, relPath), dest: join(DEST_ROOT, relPath) };
    };

    // Phase 1: compute all changes (no writes)
    for (const relPath of [...syncSet.keys()].sort()) {
        const { src: srcFile, dest: destFile } = resolvePair(relPath);
        if (!existsSync(srcFile)) {
            results.errors.push(`Source file not found: ${relPath}`);
            continue;
        }
        let content = readFileSync(srcFile, 'utf8');
        try {
            const out = applyTransforms(relPath, content);
            content = out.content;
        } catch (error) {
            results.errors.push(error.message);
            continue;
        }
        if (!existsSync(destFile)) {
            results.created.push(relPath);
            outputs.set(destFile, content);
        } else {
            const current = readFileSync(destFile, 'utf8');
            if (current !== content) {
                results.updated.push(relPath);
                outputs.set(destFile, content);
            } else {
                results.unchanged++;
            }
        }
    }

    // Phase 2: files present in miniapp-src but missing in src (deletion candidates)
    const unmanaged = [];
    if (CLEAN || CHECK || DRY_RUN) {
        for (const dir of COPY_DIRS) {
            for (const file of walk(join(DEST_ROOT, dir))) {
                const relPath = `${dir}/${file}`.replace(/\\/g, '/');
                if (!syncSet.has(relPath) && !PROTECTED.includes(relPath)) {
                    unmanaged.push(relPath);
                }
            }
        }
    }

    // Report
    const mode = CHECK ? 'CHECK' : DRY_RUN ? 'DRY-RUN' : 'SYNC';
    console.log(`\n=== sync-miniapp [${mode}] ===`);
    console.log(`Managed files: ${syncSet.size}, transforms: ${Object.values(TRANSFORMS).reduce((n, r) => n + r.length, 0)}`);
    if (results.created.length) {
        console.log(`\nTo create (${results.created.length}):`);
        results.created.forEach((f) => console.log(`  + ${f}`));
    }
    if (results.updated.length) {
        console.log(`\nTo update (${results.updated.length}):`);
        results.updated.forEach((f) => console.log(`  ~ ${f}`));
    }
    if (unmanaged.length) {
        console.log(`\nExtra files in miniapp-src (not in src)${CLEAN ? ' — deleting' : ' (remove with --clean)'}:`);
        unmanaged.forEach((f) => console.log(`  - ${f}`));
    }
    console.log(`\nUnchanged: ${results.unchanged}`);

    if (results.errors.length) {
        console.error(`\nERRORS (${results.errors.length}):`);
        results.errors.forEach((e) => console.error(`\n${e}`));
        console.error('\nNo files were written.');
        process.exit(2);
    }

    if (CHECK) {
        const drift = results.created.length + results.updated.length + (CLEAN ? unmanaged.length : 0);
        if (drift > 0) {
            console.error(`\nminiapp-src is out of sync with src (${drift} files). Run: npm run sync:miniapp`);
            process.exit(1);
        }
        console.log('\nminiapp-src is in sync with src.');
        return;
    }

    if (DRY_RUN) {
        console.log('\n(dry-run: no files written)');
        return;
    }

    // Phase 3: write
    for (const [destFile, content] of outputs) {
        mkdirSync(dirname(destFile), { recursive: true });
        writeFileSync(destFile, content, 'utf8');
    }
    if (CLEAN) {
        for (const relPath of unmanaged) {
            rmSync(join(DEST_ROOT, relPath));
        }
    }
    const changed = results.created.length + results.updated.length + (CLEAN ? unmanaged.length : 0);
    console.log(`\nDone: ${changed} file(s) written/removed. Review the changes: git diff -- miniapp-src`);
}

main();
