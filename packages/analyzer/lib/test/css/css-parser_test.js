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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = require("fs");
const path = require("path");
const css_document_1 = require("../../css/css-document");
const css_parser_1 = require("../../css/css-parser");
const index_1 = require("../../index");
const test_utils_1 = require("../test-utils");
suite('CssParser', () => {
    suite('parse()', () => {
        const fileContents = fs.readFileSync(path.join(test_utils_1.fixtureDir, 'stylesheet.css'), 'utf8');
        let parser;
        setup(() => {
            parser = new css_parser_1.CssParser();
        });
        test('parses css', () => {
            const document = parser.parse(fileContents, test_utils_1.resolvedUrl `/static/stylesheet.css`, new index_1.PackageUrlResolver());
            chai_1.assert.instanceOf(document, css_document_1.ParsedCssDocument);
            chai_1.assert.equal(document.url, '/static/stylesheet.css');
            chai_1.assert(document.ast != null);
        });
        test('stringifies css', () => {
            const document = parser.parse(fileContents, test_utils_1.resolvedUrl `/static/stylesheet.css`, new index_1.PackageUrlResolver());
            chai_1.assert.deepEqual(document.stringify(), fileContents);
        });
    });
});
//# sourceMappingURL=css-parser_test.js.map