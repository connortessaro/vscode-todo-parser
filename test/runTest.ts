import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        delete process.env.ELECTRON_RUN_AS_NODE;
        const extensionDevelopmentPath = path.resolve(__dirname, '../..');
        const extensionTestsPath = path.resolve(__dirname, './suite/index');
        const workspacePath = process.env.CODE_TESTS_WORKSPACE
            ? path.resolve(extensionDevelopmentPath, process.env.CODE_TESTS_WORKSPACE)
            : path.resolve(extensionDevelopmentPath, 'test');

        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [workspacePath, '--disable-extensions']
        });
    } catch (error) {
        console.error('Failed to run tests');
        console.error(error);
        process.exit(1);
    }
}

main();
