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
const class_scanner_1 = require("../../javascript/class-scanner");
const model_1 = require("../../model/model");
const test_utils_1 = require("../test-utils");
// tslint:disable: no-any This test is pretty hacky, uses a lot of any.
suite('Class', () => {
    let analyzer;
    let underliner;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        ({ analyzer, underliner } = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir));
    }));
    function getScannedFeatures(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const { features } = yield test_utils_1.runScanner(analyzer, new class_scanner_1.ClassScanner(), filename);
            return features;
        });
    }
    function getScannedClasses(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const features = yield getScannedFeatures(filename);
            return features.filter((e) => e instanceof model_1.ScannedClass);
        });
    }
    function getClasses(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = yield analyzer.analyze([filename]);
            const classes = Array.from(analysis.getFeatures({ kind: 'class' }));
            return { classes, analysis };
        });
    }
    function getMethod(m) {
        const method = { name: m.name, description: m.description };
        if (m.params && m.params.length > 0) {
            method.params = m.params.map((p) => {
                const param = { name: p.name };
                if (p.description != null) {
                    param.description = p.description;
                }
                if (p.type != null) {
                    param.type = p.type;
                }
                if (p.defaultValue != null) {
                    param.defaultValue = p.defaultValue;
                }
                if (p.rest != null) {
                    param.rest = p.rest;
                }
                return param;
            });
        }
        if (m.return) {
            method.return = m.return;
        }
        const maybeMethod = m;
        if (maybeMethod.inheritedFrom) {
            method.inheritedFrom = maybeMethod.inheritedFrom;
        }
        return method;
    }
    function getTestProps(class_) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                name: class_.name,
                description: class_.description,
                privacy: class_.privacy
            };
            if (class_.properties.size > 0) {
                result.properties = [];
                for (const { name } of class_.properties.values()) {
                    result.properties.push({ name });
                }
            }
            if (class_.methods.size > 0) {
                result.methods = [...class_.methods.values()].map(getMethod);
            }
            if (class_.mixins.length > 0) {
                result.mixins = [];
                for (const { identifier } of class_.mixins) {
                    result.mixins.push({ identifier });
                }
            }
            if (class_.warnings.length > 0) {
                result.warnings = yield underliner.underline(class_.warnings);
            }
            if (class_.superClass) {
                result.superClass = class_.superClass.identifier;
            }
            if (class_.constructorMethod) {
                result.constructorMethod = getMethod(class_.constructorMethod);
            }
            return result;
        });
    }
    suite('scanning', () => {
        test('finds classes and their names and comment blocks', () => __awaiter(this, void 0, void 0, function* () {
            const classes = yield getScannedClasses('class/class-names.js');
            chai_1.assert.deepEqual(classes.map((c) => c.name), [
                'Declaration',
                'VarDeclaration',
                'Assignment',
                'Namespace.AlsoAssignment',
                'Declared.AnotherAssignment',
                'ClassWithNoJsDoc',
                'ExportedClass',
                undefined,
                'ExportedConstClass',
            ]);
            chai_1.assert.deepEqual(yield Promise.all(classes.map((c) => getTestProps(c))), [
                {
                    name: 'Declaration',
                    description: 'A simple declaration',
                    privacy: 'public',
                },
                {
                    description: 'The variable\'s name is used.',
                    name: 'VarDeclaration',
                    privacy: 'public',
                },
                {
                    description: 'The left hand side of the assignment is used.',
                    name: 'Assignment',
                    privacy: 'public',
                },
                {
                    description: 'Namespaced assignments work too',
                    name: 'Namespace.AlsoAssignment',
                    privacy: 'public',
                },
                {
                    description: 'Declared namespace works too',
                    name: 'Declared.AnotherAssignment',
                    privacy: 'public',
                },
                {
                    description: '',
                    name: 'ClassWithNoJsDoc',
                    privacy: 'public',
                },
                {
                    description: 'An exported class.',
                    name: 'ExportedClass',
                    privacy: 'public',
                    methods: [{ description: '', name: 'method1', return: { type: 'void' } }]
                },
                {
                    description: 'A default exported class.',
                    name: undefined,
                    privacy: 'public',
                    methods: [{ description: '', name: 'method2', return: { type: 'void' } }]
                },
                {
                    description: '',
                    name: 'ExportedConstClass',
                    privacy: 'public',
                    methods: [{ description: '', name: 'method3', return: { type: 'void' } }]
                }
            ]);
        }));
        test('finds properties', () => __awaiter(this, void 0, void 0, function* () {
            const cls = (yield getScannedClasses('class/class-properties.js'))[0];
            chai_1.assert.deepInclude(cls.properties.get('customPropertyGetterType'), {
                name: 'customPropertyGetterType',
                type: 'boolean',
                description: 'A boolean getter',
                readOnly: true
            });
            chai_1.assert.deepInclude(cls.properties.get('customPropertyWithGetterSetter'), {
                name: 'customPropertyWithGetterSetter',
                description: 'a property with a getter/setter',
                readOnly: false
            });
            chai_1.assert.deepInclude(cls.properties.get('customPropertyWithReadOnlyGetter'), { name: 'customPropertyWithReadOnlyGetter', readOnly: true });
            chai_1.assert.deepInclude(cls.properties.get('customPropertyOnProto'), { name: 'customPropertyOnProto', type: 'string' });
            chai_1.assert.deepInclude(cls.properties.get('customPropertyOnProtoValue'), { name: 'customPropertyOnProtoValue', type: 'number' });
            chai_1.assert.deepInclude(cls.properties.get('customPropertyOnProtoDoc'), {
                name: 'customPropertyOnProtoDoc',
                description: 'A property',
                type: '(boolean | number)',
                privacy: 'private',
                readOnly: true
            });
            chai_1.assert.deepInclude(cls.properties.get('__customPropertyOnProtoPrivate'), { name: '__customPropertyOnProtoPrivate', privacy: 'private' });
            chai_1.assert.deepInclude(cls.properties.get('constructorJSDocGetter'), {
                name: 'constructorJSDocGetter',
                description: 'a getter with constructor jsdoc'
            });
            chai_1.assert.deepEqual(yield getTestProps(cls), {
                name: 'Class',
                constructorMethod: { description: '', name: 'constructor' },
                description: '',
                privacy: 'public',
                properties: [
                    { name: 'customPropertyWithValue' },
                    { name: 'customPropertyWithJSDoc' },
                    { name: 'constructorJSDocGetter' },
                    { name: 'customPropertyGetter' },
                    { name: 'customPropertyGetterType' },
                    { name: 'customPropertyWithGetterSetter' },
                    { name: 'customPropertyWithSetterFirst' },
                    { name: 'customPropertyWithReadOnlyGetter' },
                    { name: 'customPropertyOnProto' },
                    { name: 'customPropertyOnProtoValue' },
                    { name: 'customPropertyOnProtoDoc' },
                    { name: '__customPropertyOnProtoPrivate' }
                ]
            });
        }));
        test('finds methods', () => __awaiter(this, void 0, void 0, function* () {
            const classes = yield getScannedClasses('class/class-methods.js');
            chai_1.assert.deepEqual(yield Promise.all(classes.map((c) => getTestProps(c))), [
                {
                    name: 'Class',
                    description: '',
                    privacy: 'public',
                    properties: [{ name: 'customInstanceGetter' }],
                    constructorMethod: {
                        description: 'This is the description of the constructor',
                        name: 'constructor',
                        params: [
                            {
                                name: 'num',
                                type: 'number',
                                description: 'A number constructor parameter'
                            },
                            {
                                name: 'truth',
                                type: 'boolean',
                                description: 'Another constructor parameter'
                            }
                        ]
                    },
                    methods: [
                        {
                            name: 'customInstanceFunction',
                            description: '',
                        },
                        {
                            name: 'methodWithDefaultParam',
                            description: '',
                            params: [{ name: 'x', defaultValue: '12' }],
                        },
                        {
                            name: 'methodWithComplexDefaultParam',
                            description: '',
                            params: [{ name: 'a', defaultValue: '[1, 2, 3]' }],
                            return: { type: 'void' }
                        },
                        {
                            name: 'customInstanceFunctionWithJSDoc',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithJSDoc.',
                            return: {
                                desc: 'The number 5, always.',
                                type: 'Number',
                            },
                        },
                        {
                            name: 'customInstanceFunctionWithParams',
                            description: '',
                            params: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
                        },
                        {
                            name: 'customInstanceFunctionWithParamsAndJSDoc',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithParamsAndJSDoc.',
                            params: [
                                {
                                    name: 'a',
                                    type: 'Number',
                                    description: 'The first argument',
                                },
                                {
                                    name: 'b',
                                    type: 'Number',
                                },
                                {
                                    name: 'c',
                                    type: 'Number',
                                    description: 'The third argument',
                                }
                            ],
                            return: {
                                desc: 'The number 7, always.',
                                type: 'Number',
                            },
                        },
                        {
                            name: 'customInstanceFunctionWithParamsAndPrivateJSDoc',
                            description: 'This is the description for\n' +
                                'customInstanceFunctionWithParamsAndPrivateJSDoc.',
                        },
                        {
                            name: 'customInstanceFunctionWithRestParam',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithRestParam.',
                            params: [
                                {
                                    name: 'a',
                                    type: 'Number',
                                    description: 'The first argument.',
                                },
                                {
                                    name: 'b',
                                    type: '...Number',
                                    rest: true,
                                    description: 'The second argument.',
                                }
                            ],
                            return: {
                                desc: 'The number 9, always.',
                                type: 'Number',
                            },
                        },
                        {
                            name: 'customInstanceFunctionWithParamDefault',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithParamDefault.',
                            params: [
                                {
                                    name: 'a',
                                    type: 'Number',
                                    description: 'The first argument.',
                                },
                                {
                                    name: 'b',
                                    type: 'Number',
                                    defaultValue: '0',
                                    description: 'The second argument.',
                                }
                            ],
                            return: {
                                desc: 'The number 10, always.',
                                type: 'Number',
                            },
                        },
                        {
                            description: undefined,
                            name: 'customInstanceFunctionOnProto',
                            params: [{ description: 'a bool', name: 'foo', type: 'boolean' }],
                            return: { type: 'void' }
                        },
                        {
                            description: undefined,
                            name: '__customInstanceFunctionOnProtoPrivate'
                        },
                        {
                            description: undefined,
                            name: 'customInstanceFunctionOnProtoWithBody'
                        },
                        {
                            description: 'Returns the sum of two numbers',
                            name: 'customInstanceFunctionOnProtoWithBodyDoc',
                            params: [
                                { description: 'some number', name: 'a', type: 'number' },
                                { description: 'another number', name: 'b', type: 'number' }
                            ],
                            return: { type: 'number' }
                        },
                    ]
                },
            ]);
        }));
        test('deals with super classes correctly', () => __awaiter(this, void 0, void 0, function* () {
            const classes = yield getScannedClasses('class/super-class.js');
            chai_1.assert.deepEqual(classes.map((f) => f.name), ['Base', 'Subclass', 'AnotherSubclass']);
            chai_1.assert.deepEqual(yield Promise.all(classes.map((c) => getTestProps(c))), [
                {
                    name: 'Base',
                    description: '',
                    privacy: 'public',
                    constructorMethod: {
                        description: '',
                        name: 'constructor',
                        return: { type: 'Base' },
                    },
                    methods: [
                        {
                            description: 'This is a base method.',
                            name: 'baseMethod',
                            return: { type: 'void' },
                        },
                        {
                            description: 'Will be overriden by Subclass.',
                            name: 'overriddenMethod',
                            return: { type: 'void' },
                        }
                    ]
                },
                {
                    name: 'Subclass',
                    description: '',
                    privacy: 'public',
                    superClass: 'Base',
                    constructorMethod: {
                        description: '',
                        name: 'constructor',
                        return: { type: 'Subclass' },
                    },
                    methods: [
                        {
                            description: 'Overrides the method on Base.',
                            name: 'overriddenMethod',
                            return: { type: 'void' },
                        },
                        {
                            description: 'This method only exists on Subclass.',
                            name: 'subMethod',
                            return: { type: 'void' },
                        }
                    ]
                },
                {
                    name: 'AnotherSubclass',
                    description: 'Class that inherits all methods from base',
                    privacy: 'public',
                    superClass: 'Base'
                }
            ]);
        }));
        const testName = 'does not produce duplicate classes for elements or mixins';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const scannedFeatures = yield getScannedFeatures('class/more-specific-classes.js');
            // Ensures no duplicates
            chai_1.assert.deepEqual(scannedFeatures.map((f) => f.name), ['Element', 'AnnotatedElement', 'Mixin', 'AnnotatedMixin']);
            // Ensures we get the more specific types
            // TODO(rictic): these should probably not be Polymer specific.
            chai_1.assert.deepEqual(scannedFeatures.map((f) => f.constructor.name), [
                'ScannedPolymerElement',
                'ScannedPolymerElement',
                'ScannedPolymerElementMixin',
                'ScannedPolymerElementMixin'
            ]);
        }));
    });
    suite('resolving', () => {
        test('finds classes and their names and descriptions', () => __awaiter(this, void 0, void 0, function* () {
            const { classes } = yield getClasses('class/class-names.js');
            chai_1.assert.deepEqual(classes.map((c) => c.name), [
                'Declaration',
                'VarDeclaration',
                'Assignment',
                'Namespace.AlsoAssignment',
                'Declared.AnotherAssignment',
                'ClassWithNoJsDoc',
                'ExportedClass',
                undefined,
                'ExportedConstClass',
            ]);
            chai_1.assert.deepEqual(yield Promise.all(classes.map((c) => getTestProps(c))), [
                {
                    name: 'Declaration',
                    description: 'A simple declaration',
                    privacy: 'public',
                },
                {
                    description: 'The variable\'s name is used.',
                    name: 'VarDeclaration',
                    privacy: 'public',
                },
                {
                    description: 'The left hand side of the assignment is used.',
                    name: 'Assignment',
                    privacy: 'public',
                },
                {
                    description: 'Namespaced assignments work too',
                    name: 'Namespace.AlsoAssignment',
                    privacy: 'public',
                },
                {
                    description: 'Declared namespace works too',
                    name: 'Declared.AnotherAssignment',
                    privacy: 'public',
                },
                {
                    description: '',
                    name: 'ClassWithNoJsDoc',
                    privacy: 'public',
                },
                {
                    description: 'An exported class.',
                    name: 'ExportedClass',
                    privacy: 'public',
                    methods: [{ description: '', name: 'method1', return: { type: 'void' } }]
                },
                {
                    description: 'A default exported class.',
                    name: undefined,
                    privacy: 'public',
                    methods: [{ description: '', name: 'method2', return: { type: 'void' } }]
                },
                {
                    description: '',
                    name: 'ExportedConstClass',
                    privacy: 'public',
                    methods: [{ description: '', name: 'method3', return: { type: 'void' } }]
                }
            ]);
        }));
        test('finds methods', () => __awaiter(this, void 0, void 0, function* () {
            const { classes } = yield getClasses('class/class-methods.js');
            chai_1.assert.deepEqual(yield Promise.all(classes.map((c) => getTestProps(c))), [
                {
                    name: 'Class',
                    description: '',
                    privacy: 'public',
                    properties: [{ name: 'customInstanceGetter' }],
                    constructorMethod: {
                        description: 'This is the description of the constructor',
                        name: 'constructor',
                        params: [
                            {
                                name: 'num',
                                type: 'number',
                                description: 'A number constructor parameter'
                            },
                            {
                                name: 'truth',
                                type: 'boolean',
                                description: 'Another constructor parameter'
                            }
                        ]
                    },
                    methods: [
                        {
                            name: 'customInstanceFunction',
                            description: '',
                        },
                        {
                            name: 'methodWithDefaultParam',
                            description: '',
                            params: [{ name: 'x', defaultValue: '12' }],
                        },
                        {
                            name: 'methodWithComplexDefaultParam',
                            description: '',
                            params: [{ name: 'a', defaultValue: '[1, 2, 3]' }],
                            return: { type: 'void' }
                        },
                        {
                            name: 'customInstanceFunctionWithJSDoc',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithJSDoc.',
                            return: {
                                desc: 'The number 5, always.',
                                type: 'Number',
                            },
                        },
                        {
                            name: 'customInstanceFunctionWithParams',
                            description: '',
                            params: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
                        },
                        {
                            name: 'customInstanceFunctionWithParamsAndJSDoc',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithParamsAndJSDoc.',
                            params: [
                                {
                                    name: 'a',
                                    type: 'Number',
                                    description: 'The first argument',
                                },
                                {
                                    name: 'b',
                                    type: 'Number',
                                },
                                {
                                    name: 'c',
                                    type: 'Number',
                                    description: 'The third argument',
                                }
                            ],
                            return: {
                                desc: 'The number 7, always.',
                                type: 'Number',
                            },
                        },
                        {
                            name: 'customInstanceFunctionWithParamsAndPrivateJSDoc',
                            description: 'This is the description for\n' +
                                'customInstanceFunctionWithParamsAndPrivateJSDoc.',
                        },
                        {
                            name: 'customInstanceFunctionWithRestParam',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithRestParam.',
                            params: [
                                {
                                    name: 'a',
                                    type: 'Number',
                                    description: 'The first argument.',
                                },
                                {
                                    name: 'b',
                                    type: '...Number',
                                    rest: true,
                                    description: 'The second argument.',
                                }
                            ],
                            return: {
                                desc: 'The number 9, always.',
                                type: 'Number',
                            },
                        },
                        {
                            name: 'customInstanceFunctionWithParamDefault',
                            description: 'This is the description for ' +
                                'customInstanceFunctionWithParamDefault.',
                            params: [
                                {
                                    name: 'a',
                                    type: 'Number',
                                    description: 'The first argument.',
                                },
                                {
                                    name: 'b',
                                    type: 'Number',
                                    defaultValue: '0',
                                    description: 'The second argument.',
                                }
                            ],
                            return: {
                                desc: 'The number 10, always.',
                                type: 'Number',
                            },
                        },
                        {
                            description: undefined,
                            name: 'customInstanceFunctionOnProto',
                            params: [{ description: 'a bool', name: 'foo', type: 'boolean' }],
                            return: { type: 'void' }
                        },
                        {
                            description: undefined,
                            name: '__customInstanceFunctionOnProtoPrivate'
                        },
                        {
                            description: undefined,
                            name: 'customInstanceFunctionOnProtoWithBody'
                        },
                        {
                            description: 'Returns the sum of two numbers',
                            name: 'customInstanceFunctionOnProtoWithBodyDoc',
                            params: [
                                { description: 'some number', name: 'a', type: 'number' },
                                { description: 'another number', name: 'b', type: 'number' }
                            ],
                            return: { type: 'number' }
                        },
                    ]
                },
            ]);
        }));
        test('deals with super classes correctly', () => __awaiter(this, void 0, void 0, function* () {
            const { classes } = yield getClasses('class/super-class.js');
            chai_1.assert.deepEqual(classes.map((f) => f.name), ['Base', 'Subclass', 'AnotherSubclass']);
            chai_1.assert.deepEqual(yield Promise.all(classes.map((c) => getTestProps(c))), [
                {
                    name: 'Base',
                    description: '',
                    privacy: 'public',
                    constructorMethod: {
                        description: '',
                        name: 'constructor',
                        return: { type: 'Base' },
                    },
                    methods: [
                        {
                            description: 'This is a base method.',
                            name: 'baseMethod',
                            return: { type: 'void' },
                        },
                        {
                            description: 'Will be overriden by Subclass.',
                            name: 'overriddenMethod',
                            return: { type: 'void' },
                        }
                    ]
                },
                {
                    name: 'Subclass',
                    description: '',
                    privacy: 'public',
                    superClass: 'Base',
                    constructorMethod: {
                        description: '',
                        name: 'constructor',
                        return: { type: 'Subclass' },
                    },
                    methods: [
                        {
                            description: 'This is a base method.',
                            name: 'baseMethod',
                            inheritedFrom: 'Base',
                            return: { type: 'void' },
                        },
                        {
                            description: 'Overrides the method on Base.',
                            name: 'overriddenMethod',
                            return: { type: 'void' },
                        },
                        {
                            description: 'This method only exists on Subclass.',
                            name: 'subMethod',
                            return: { type: 'void' },
                        },
                    ]
                },
                {
                    name: 'AnotherSubclass',
                    description: 'Class that inherits all methods from base',
                    privacy: 'public',
                    superClass: 'Base',
                    constructorMethod: {
                        description: '',
                        inheritedFrom: 'Base',
                        name: 'constructor',
                        return: { type: 'Base' }
                    },
                    methods: [
                        {
                            description: 'This is a base method.',
                            inheritedFrom: 'Base',
                            name: 'baseMethod',
                            return: { type: 'void' }
                        },
                        {
                            description: 'Will be overriden by Subclass.',
                            inheritedFrom: 'Base',
                            name: 'overriddenMethod',
                            return: { type: 'void' }
                        }
                    ]
                }
            ]);
        }));
        const testName = 'does not produce duplicate classes for elements or mixins';
        test(testName, () => __awaiter(this, void 0, void 0, function* () {
            const features = (yield analyzer.analyze([
                'class/more-specific-classes.js'
            ])).getFeatures();
            const interestingFeatures = Array.from(features).filter((f) => f instanceof model_1.Element || f instanceof model_1.ElementMixin ||
                f instanceof model_1.Class);
            // Ensures no duplicates
            chai_1.assert.deepEqual(interestingFeatures.map((f) => f.name), ['Element', 'AnnotatedElement', 'Mixin', 'AnnotatedMixin']);
            // Ensures we get the more specific types
            // TODO(rictic): these should probably not be Polymer specific.
            chai_1.assert.deepEqual(interestingFeatures.map((f) => f.constructor.name), [
                'PolymerElement',
                'PolymerElement',
                'PolymerElementMixin',
                'PolymerElementMixin'
            ]);
        }));
        test('recognizes class and constructor annotations', () => __awaiter(this, void 0, void 0, function* () {
            const classes = (yield getClasses('class/annotated-classes.js'))
                .classes
                // Mixin functions are classes too, but we don't care
                // about them here.
                .filter((c) => !c.kinds.has('element-mixin'));
            chai_1.assert.deepEqual(yield Promise.all(classes.map(getTestProps)), [
                {
                    name: 'hasConstructorAnnotation',
                    description: '',
                    privacy: 'public',
                },
                {
                    name: 'hasConstructorExtendsMixinAnnotations',
                    description: '',
                    privacy: 'public',
                    superClass: 'HTMLElement',
                    mixins: [
                        { identifier: 'someMixin' },
                    ],
                },
                {
                    name: 'hasEphemeralSuperclass1',
                    description: '',
                    privacy: 'public',
                    superClass: 'HTMLElement',
                    mixins: [
                        { identifier: 'someMixin' },
                    ],
                },
                {
                    name: 'hasEphemeralSuperclass2',
                    description: '',
                    privacy: 'public',
                },
                {
                    name: 'Polymer.notEphemeralSuperclass',
                    description: '',
                    privacy: 'private',
                },
                {
                    name: 'hasNotEphemeralSuperclass',
                    description: '',
                    superClass: 'Polymer.notEphemeralSuperclass',
                    privacy: 'public'
                }
            ]);
        }));
        test('we index classes by their canonical statements', () => __awaiter(this, void 0, void 0, function* () {
            const filename = 'class/class-names.js';
            const { classes, analysis } = yield getClasses(filename);
            chai_1.assert.deepEqual(classes.map((c) => c.statementAst && c.statementAst.type), [
                'ClassDeclaration',
                'VariableDeclaration',
                'ExpressionStatement',
                'ExpressionStatement',
                'ExpressionStatement',
                'ClassDeclaration',
                'ExportNamedDeclaration',
                'ExportDefaultDeclaration',
                'ExportNamedDeclaration'
            ]);
            const result = analysis.getDocument(filename);
            if (result.successful === false) {
                throw new Error('Could not get document');
            }
            const document = result.value;
            for (const class_ of classes) {
                const features = document.getFeatures({ statement: class_.statementAst, kind: 'class' });
                chai_1.assert.deepEqual([...features].map((c) => c.name), [class_.name]);
            }
        }));
        test('we resolve superclasses by scope when possible', () => __awaiter(this, void 0, void 0, function* () {
            const filename = 'class/super-class-scoped.js';
            const { classes } = yield getClasses(filename);
            chai_1.assert.deepEqual(classes.map((c) => c.name), [
                'Foo',
                'Foo',
                'One',
                'Foo',
                'Two',
                'Three',
            ]);
            const subclasses = classes.filter((c) => c.superClass !== undefined);
            chai_1.assert.deepEqual(subclasses.map(((c) => c.name)), ['One', 'Two', 'Three']);
            // Despite the fact that their superclasses all have the same name,
            // we're able to use JS scoping rules to resolve them to the correct
            // referant.
            chai_1.assert.deepEqual(subclasses.map((c) => [...c.methods.keys()]), [['method1'], ['method2'], ['method3']]);
        }));
        test('we resolve imported super classes', () => __awaiter(this, void 0, void 0, function* () {
            const filename = 'class/super-class-imported.js';
            const analysis = yield analyzer.analyze([filename]);
            const result = analysis.getDocument(filename);
            if (result.successful === false) {
                throw new Error('Could not get document');
            }
            const document = result.value;
            const classes = Array.from(document.getFeatures({ kind: 'class' }));
            chai_1.assert.deepEqual(classes.map((c) => c.name), [
                'CL1',
                'CL2',
                'CL3',
                'CL4',
                'CL5',
                'CL6',
            ]);
            chai_1.assert.deepEqual(classes.map((c) => [...c.methods.keys()]), [
                ['method1'],
                ['method2'],
                ['method3'],
                ['method1'],
                ['method1'],
                ['method1']
            ]);
        }));
    });
});
//# sourceMappingURL=class-scanner_test.js.map