import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');
    const testFiles = await glob('**/*.test.js', { cwd: testsRoot });

    testFiles.forEach((file) => mocha.addFile(path.resolve(testsRoot, file)));

    await new Promise<void>((resolve, reject) => {
        mocha.run((failures) => {
            if (failures > 0) {
                reject(new Error(`${failures} tests failed.`));
                return;
            }
            resolve();
        });
    });
}
