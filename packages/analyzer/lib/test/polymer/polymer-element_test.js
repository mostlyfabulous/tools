"use strict";
/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
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
const model_1 = require("../../model/model");
const test_utils_1 = require("../test-utils");
suite('PolymerElement', () => {
    let analyzer;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        ({ analyzer } =
            yield test_utils_1.createForDirectory(path.resolve(test_utils_1.fixtureDir, 'polymer2/')));
    }));
    function getElements(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (yield analyzer.analyze([filename])).getDocument(filename);
            if (!result.successful) {
                throw new Error(`Could not get filename: ${filename}`);
            }
            const document = result.value;
            const elements = document.getFeatures({ kind: 'polymer-element' });
            return elements;
        });
    }
    function getTestProps(element) {
        return {
            className: element.className,
            superClass: element.superClass && element.superClass.identifier,
            tagName: element.tagName,
            description: element.description,
            properties: Array.from(element.properties.values()).map((p) => {
                const prop = { name: p.name, inheritedFrom: p.inheritedFrom };
                p.reflectToAttribute &&
                    (prop.reflectToAttribute = p.reflectToAttribute);
                p.readOnly && (prop.readOnly = p.readOnly);
                p.default && (prop.default = p.default);
                return prop;
            }),
            attributes: Array.from(element.attributes.values()).map((a) => ({
                name: a.name,
            })),
            methods: Array.from(element.methods.values()).map((m) => ({
                name: m.name,
                params: m.params,
                return: m.return,
                inheritedFrom: m.inheritedFrom
            })),
        };
    }
    test('Scans and resolves base and sub-class', () => __awaiter(this, void 0, void 0, function* () {
        const elements = yield getElements('test-element-3.js');
        const elementData = Array.from(elements).map(getTestProps);
        chai_1.assert.deepEqual(elementData, [
            {
                tagName: undefined,
                className: 'BaseElement',
                superClass: 'Polymer.Element',
                description: '',
                properties: [{
                        name: 'foo',
                        inheritedFrom: undefined,
                    }],
                attributes: [{
                        name: 'foo',
                    }],
                methods: [],
            },
            {
                tagName: 'sub-element',
                className: 'SubElement',
                superClass: 'BaseElement',
                description: '',
                properties: [
                    {
                        name: 'foo',
                        inheritedFrom: 'BaseElement',
                    },
                    {
                        name: 'bar',
                        inheritedFrom: undefined,
                    },
                ],
                attributes: [
                    {
                        name: 'foo',
                    },
                    {
                        name: 'bar',
                    },
                ],
                methods: [],
            },
            {
                tagName: undefined,
                className: 'WindowBaseElement',
                superClass: 'Polymer.Element',
                description: '',
                properties: [],
                attributes: [],
                methods: [],
            },
            {
                tagName: undefined,
                className: 'WindowSubElement',
                superClass: 'Polymer.WindowBaseElement',
                description: '',
                properties: [],
                attributes: [],
                methods: [],
            },
        ]);
    }));
    test('Computes correct property information', () => __awaiter(this, void 0, void 0, function* () {
        const elements = yield getElements('test-element-17.js');
        const elementData = Array.from(elements).map(getTestProps);
        chai_1.assert.deepEqual(elementData, [
            {
                tagName: undefined,
                className: 'BaseElement',
                superClass: 'Polymer.Element',
                description: '',
                properties: [{
                        name: 'foo',
                        inheritedFrom: undefined,
                        reflectToAttribute: true,
                        readOnly: true,
                        default: '"foo"'
                    }],
                attributes: [{
                        name: 'foo',
                    }],
                methods: [],
            },
        ]);
    }));
    test('Handles inner classes properly', () => __awaiter(this, void 0, void 0, function* () {
        const elements = yield getElements('test-element-18.js');
        const elementData = Array.from(elements).map(getTestProps);
        chai_1.assert.deepEqual(elementData, [
            {
                tagName: 'hello-world',
                className: 'HelloWorld',
                superClass: 'Polymer.Element',
                description: '',
                properties: [],
                attributes: [],
                methods: [],
            },
        ]);
    }));
    test('Elements inherit from mixins and base classes', () => __awaiter(this, void 0, void 0, function* () {
        const elements = yield getElements('test-element-7.js');
        const elementData = Array.from(elements).map(getTestProps);
        chai_1.assert.deepEqual(elementData, [
            {
                tagName: undefined,
                className: 'BaseElement',
                superClass: 'Polymer.Element',
                description: '',
                properties: [
                    {
                        name: 'one',
                        inheritedFrom: undefined,
                    },
                    {
                        name: 'two',
                        inheritedFrom: undefined,
                    }
                ],
                attributes: [
                    {
                        name: 'one',
                    },
                    {
                        name: 'two',
                    }
                ],
                methods: [{
                        name: 'customMethodOnBaseElement',
                        params: [],
                        return: undefined,
                        inheritedFrom: undefined
                    }],
            },
            {
                tagName: 'sub-element',
                className: 'SubElement',
                superClass: 'BaseElement',
                description: '',
                properties: [
                    {
                        name: 'one',
                        inheritedFrom: 'BaseElement',
                    },
                    {
                        name: 'two',
                        inheritedFrom: 'Mixin',
                    },
                    {
                        name: 'three',
                        inheritedFrom: 'Mixin',
                    },
                    {
                        name: 'four',
                        inheritedFrom: undefined,
                    },
                    {
                        inheritedFrom: undefined,
                        name: 'five',
                    },
                ],
                attributes: [
                    {
                        name: 'one',
                    },
                    {
                        name: 'two',
                    },
                    {
                        name: 'three',
                    },
                    {
                        name: 'four',
                    },
                    {
                        name: 'five',
                    },
                ],
                methods: [
                    {
                        name: 'customMethodOnBaseElement',
                        params: [],
                        return: undefined,
                        inheritedFrom: 'BaseElement'
                    },
                    {
                        name: 'customMethodOnMixin',
                        params: [],
                        return: undefined,
                        inheritedFrom: 'Mixin'
                    },
                    {
                        name: 'customMethodOnSubElement',
                        params: [],
                        return: undefined,
                        inheritedFrom: undefined
                    },
                ],
            },
        ]);
    }));
    suite('multiple-doc-comments', () => {
        function getElement(filename) {
            return __awaiter(this, void 0, void 0, function* () {
                const elements = yield getElements(filename);
                chai_1.assert.equal(elements.size, 1, `${filename} contained ${elements.size} elements`);
                return [...elements][0];
            });
        }
        test('Elements with only one doc comment have no warning', () => __awaiter(this, void 0, void 0, function* () {
            const element = yield getElement('test-element-14.html');
            const warning = element.warnings.find((w) => w.code === 'multiple-doc-comments');
            chai_1.assert.isUndefined(warning);
        }));
        test('Elements with more than one doc comment have warning', () => __awaiter(this, void 0, void 0, function* () {
            const element = yield getElement('test-element-15.html');
            const warning = element.warnings.find((w) => w.code === 'multiple-doc-comments');
            chai_1.assert.isDefined(warning);
            chai_1.assert.deepEqual(warning.severity, model_1.Severity.WARNING);
            chai_1.assert.deepEqual(warning.message, 'ScannedPolymerElement has both HTML doc and JSDoc comments.');
            chai_1.assert.deepEqual(warning.sourceRange, element.sourceRange);
        }));
    });
});
//# sourceMappingURL=polymer-element_test.js.map