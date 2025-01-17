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
const path = require("path");
const function_1 = require("../../javascript/function");
const function_scanner_1 = require("../../javascript/function-scanner");
const test_utils_1 = require("../test-utils");
suite('FunctionScanner', () => {
    let analyzer;
    let underliner;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        const testFilesDir = path.resolve(test_utils_1.fixtureDir, 'namespaces/');
        ({ analyzer, underliner } = yield test_utils_1.createForDirectory(testFilesDir));
    }));
    function getNamespaceFunctions(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const { features } = yield test_utils_1.runScanner(analyzer, new function_scanner_1.FunctionScanner(), filename);
            const scannedFunctions = [];
            for (const feature of features) {
                if (feature instanceof function_1.ScannedFunction) {
                    scannedFunctions.push(feature);
                }
            }
            return scannedFunctions;
        });
    }
    function getTestProps(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                name: fn.name,
                description: fn.description,
                summary: fn.summary,
                warnings: fn.warnings,
                params: fn.params,
                return: fn.return,
                codeSnippet: yield underliner.underline(fn.sourceRange),
                privacy: fn.privacy
            };
        });
    }
    test('recognizies functions', () => __awaiter(this, void 0, void 0, function* () {
        const namespaceFunctions = yield getNamespaceFunctions('memberof-functions.js');
        const functionData = yield Promise.all(namespaceFunctions.map(getTestProps));
        chai_1.assert.deepEqual(functionData, [
            {
                name: 'Polymer.aaa',
                description: 'aaa',
                summary: '',
                warnings: [],
                params: [{
                        desc: 'This is the first argument',
                        name: 'a',
                        type: 'Number',
                    }],
                privacy: 'public',
                return: undefined,
                codeSnippet: `
function aaa(a) {
~~~~~~~~~~~~~~~~~
  return a;
~~~~~~~~~~~
}
~`,
            },
            {
                name: 'Polymer.bbb',
                description: 'bbb',
                summary: '',
                warnings: [],
                params: [],
                return: { type: 'void' },
                privacy: 'public',
                codeSnippet: `
Polymer.bbb = function bbb() {
              ~~~~~~~~~~~~~~~~


};
~`,
            },
            {
                name: 'Polymer.ccc',
                description: 'ccc',
                summary: '',
                warnings: [],
                params: [],
                return: { type: 'void' },
                privacy: 'protected',
                codeSnippet: `
  function ccc() {
  ~~~~~~~~~~~~~~~~
  }
~~~`,
            },
            {
                name: 'Polymer._ddd',
                description: 'ddd',
                summary: '',
                warnings: [],
                privacy: 'protected',
                params: [],
                return: { type: 'void' },
                codeSnippet: `
  _ddd: function() {
        ~~~~~~~~~~~~


  },
~~~`,
            },
            {
                name: 'Polymer.eee',
                description: 'eee',
                summary: '',
                warnings: [],
                params: [],
                return: { type: 'void' },
                privacy: 'private',
                codeSnippet: `
  eee: () => {},
       ~~~~~~~~`,
            },
            {
                name: 'Polymer.fff',
                description: 'fff',
                summary: '',
                warnings: [],
                params: [],
                return: { type: 'void' },
                privacy: 'public',
                codeSnippet: `
  fff() {
  ~~~~~~~


  },
~~~`,
            },
            {
                name: 'Polymer.ggg',
                description: 'ggg',
                summary: '',
                warnings: [],
                params: [],
                return: undefined,
                privacy: 'public',
                codeSnippet: `
  ggg: someFunction,
  ~~~~~~~~~~~~~~~~~`,
            },
            {
                name: 'Polymer.hhh_',
                description: 'hhh_ should be private',
                summary: '',
                warnings: [],
                params: [],
                return: undefined,
                privacy: 'private',
                codeSnippet: `
  hhh_: someOtherFunc,
  ~~~~~~~~~~~~~~~~~~~`,
            },
            {
                name: 'Polymer.__iii',
                description: '__iii should be private too',
                summary: '',
                warnings: [],
                params: [],
                return: { type: 'void' },
                privacy: 'private',
                codeSnippet: `
  __iii() { },
  ~~~~~~~~~~~`,
            },
            {
                name: 'Polymer.jjj',
                description: 'jjj',
                summary: '',
                warnings: [],
                params: [],
                return: { type: 'void' },
                privacy: 'public',
                codeSnippet: `
var jjj = function() {
          ~~~~~~~~~~~~


};
~`,
            },
            {
                name: 'lll',
                description: 'lol\n ',
                summary: '',
                warnings: [],
                params: [],
                return: { type: 'void' },
                privacy: 'public',
                codeSnippet: `
export function lll() {
       ~~~~~~~~~~~~~~~~


};
~`,
            },
        ]);
    }));
    test('handles @global, @memberof, @function annotations', () => __awaiter(this, void 0, void 0, function* () {
        const functions = yield getNamespaceFunctions('annotated-functions.js');
        chai_1.assert.deepEqual(functions.map((fn) => fn.name), [
            'globalFn',
            'SomeNamespace.memberofFn',
            'overrideNameFn',
        ]);
    }));
    test('handles @template annotation', () => __awaiter(this, void 0, void 0, function* () {
        const functions = yield getNamespaceFunctions('templated-functions.js');
        chai_1.assert.deepEqual(functions.map((fn) => [fn.name, fn.templateTypes]), [
            ['templateFn', ['T']],
            ['multiTemplateFn', ['A', 'B', 'C']],
        ]);
    }));
    test('does return void inference', () => __awaiter(this, void 0, void 0, function* () {
        const functions = yield getNamespaceFunctions('function-return-inference.js');
        chai_1.assert.deepEqual(functions.map((fn) => [fn.name, fn.return]), [
            ['noReturn', { type: 'void' }],
            ['returnWithNoArgument', { type: 'void' }],
            ['returnValue', undefined],
            ['mixedReturnStyle', undefined],
            ['voidWithNonVoidInside', { type: 'void' }],
            ['isAsync', undefined],
            ['isGenerator', undefined],
            ['annotationOverride', { type: 'string' }],
            ['arrowNoReturn', { type: 'void' }],
            ['arrowReturnWithNoArgument', { type: 'void' }],
            ['arrowReturnValueConcise', undefined],
        ]);
    }));
});
//# sourceMappingURL=function-scanner_test.js.map