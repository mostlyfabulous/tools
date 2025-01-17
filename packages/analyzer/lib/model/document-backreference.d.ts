/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
import { Document } from './document';
import { ScannedFeature } from './feature';
/**
 * The `DocumentBackreference` is added to the set of features
 * for an inline/imported document to provide a link to its containing/importer
 * document.
 */
export declare class DocumentBackreference extends ScannedFeature {
    readonly document: Document;
    kinds: Set<string>;
    identifiers: Set<string>;
    constructor(document: Document);
}
