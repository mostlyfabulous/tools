"use strict";
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_utils_1 = require("../test-utils");
suite('CssCustomPropertyScanner', () => {
    let analyzer;
    let underliner;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        ({ analyzer, underliner } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir));
    }));
    test('finds custom property assignments', () => __awaiter(this, void 0, void 0, function* () {
        const result = yield analyzer.analyze(['some-styles.html']);
        const assignments = [...result.getFeatures({ kind: 'css-custom-property-assignment' })];
        chai_1.assert.deepEqual(yield Promise.all(assignments.map((a) => underliner.underline(a.sourceRange))), [
            `
      --primary-text-color: var(--light-theme-text-color);
      ~~~~~~~~~~~~~~~~~~~~`,
            `
      --primary-background-color: var(--light-theme-background-color, --orange);
      ~~~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
      --light-theme-background-color: #ffffff;
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
        ]);
        chai_1.assert.deepEqual(assignments.map((a) => a.name), [
            '--primary-text-color',
            '--primary-background-color',
            '--light-theme-background-color'
        ]);
    }));
    test('finds custom property uses', () => __awaiter(this, void 0, void 0, function* () {
        const result = yield analyzer.analyze(['some-styles.html']);
        const assignments = [...result.getFeatures({ kind: 'css-custom-property-use' })];
        chai_1.assert.deepEqual(yield Promise.all(assignments.map((a) => underliner.underline(a.sourceRange))), [
            `
        @apply(--layout-inline);
               ~~~~~~~~~~~~~~~`,
            `
        @apply --layout-center-center;
               ~~~~~~~~~~~~~~~~~~~~~~`,
            `
      --primary-text-color: var(--light-theme-text-color);
                                ~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
      --primary-background-color: var(--light-theme-background-color, --orange);
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
            `
      --primary-background-color: var(--light-theme-background-color, --orange);
                                                                      ~~~~~~~~`,
        ]);
        chai_1.assert.deepEqual(assignments.map((a) => a.name), [
            '--layout-inline',
            '--layout-center-center',
            '--light-theme-text-color',
            '--light-theme-background-color',
            '--orange'
        ]);
    }));
});
//# sourceMappingURL=css-custom-property-scanner_test.js.map