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
import { Warning } from '../model/model';
import { Visitor } from './estree-visitor';
import { JavaScriptDocument } from './javascript-document';
import { JavaScriptScanner } from './javascript-scanner';
import { ScannedNamespace } from './namespace';
/**
 * Find namespaces from source code.
 */
export declare class NamespaceScanner implements JavaScriptScanner {
    scan(document: JavaScriptDocument, visit: (visitor: Visitor) => Promise<void>): Promise<{
        features: ScannedNamespace[];
        warnings: Warning[];
    }>;
}