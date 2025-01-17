"use strict";
/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
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
const dependency_graph_1 = require("../../core/dependency-graph");
const chaiAsPromised = require("chai-as-promised");
const test_utils_1 = require("../test-utils");
chai_1.use(chaiAsPromised);
suite('DependencyGraph', () => {
    function assertStringSetsEqual(actual, expected, message) {
        chai_1.assert.deepEqual(Array.from(actual).sort(), Array.from(expected).sort(), message);
    }
    test('can calculate dependants', () => {
        // Testing building up and then tearing back down the graph:
        // base.html -> a.html -> common.html
        // base.html -> b.html -> common.html
        let graph = new dependency_graph_1.DependencyGraph();
        assertStringSetsEqual(graph.getAllDependantsOf(test_utils_1.resolvedUrl `common.html`), []);
        graph.addDocument(test_utils_1.resolvedUrl `a.html`, [test_utils_1.resolvedUrl `common.html`]);
        assertStringSetsEqual(graph.getAllDependantsOf(test_utils_1.resolvedUrl `common.html`), ['a.html']);
        graph.addDocument(test_utils_1.resolvedUrl `b.html`, [test_utils_1.resolvedUrl `common.html`]);
        assertStringSetsEqual(graph.getAllDependantsOf(test_utils_1.resolvedUrl `common.html`), ['a.html', 'b.html']);
        graph.addDocument(test_utils_1.resolvedUrl `base.html`, ['a.html', 'b.html']);
        assertStringSetsEqual(graph.getAllDependantsOf(test_utils_1.resolvedUrl `common.html`), ['a.html', 'b.html', 'base.html']);
        graph = graph.invalidatePaths([test_utils_1.resolvedUrl `a.html`]);
        assertStringSetsEqual(graph.getAllDependantsOf(test_utils_1.resolvedUrl `common.html`), ['b.html', 'base.html']);
        graph = graph.invalidatePaths([test_utils_1.resolvedUrl `b.html`]);
        assertStringSetsEqual(graph.getAllDependantsOf(test_utils_1.resolvedUrl `common.html`), []);
        assertIsValidGraph(graph);
    });
    /**
     * Like many integration tests this is a bit dirty, but it catches many
     * interesting bugs in the way that we construct the dependency graph in
     * practice.
     */
    suite('as used in the Analyzer', () => {
        let analyzer;
        setup(() => __awaiter(this, void 0, void 0, function* () {
            const created = yield test_utils_1.createForDirectory(test_utils_1.fixtureDir);
            analyzer = created.analyzer;
        }));
        function assertImportersOf(path, expectedDependants) {
            return __awaiter(this, void 0, void 0, function* () {
                const graph = yield getLatestDependencyGraph(analyzer);
                assertStringSetsEqual(graph.getAllDependantsOf(analyzer.resolveUrl(path)), expectedDependants.map((u) => analyzer.resolveUrl(u)));
            });
        }
        test('works with a basic document with no dependencies', () => __awaiter(this, void 0, void 0, function* () {
            yield analyzer.analyze(['dependencies/leaf.html']);
            yield assertImportersOf('dependencies/leaf.html', []);
            const graph = yield getLatestDependencyGraph(analyzer);
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
        }));
        test('works with a simple tree of dependencies', () => __awaiter(this, void 0, void 0, function* () {
            yield analyzer.analyze(['dependencies/root.html']);
            yield assertImportersOf('dependencies/root.html', []);
            yield assertImportersOf('dependencies/leaf.html', ['dependencies/root.html']);
            yield assertImportersOf('dependencies/subfolder/subfolder-sibling.html', [
                'dependencies/subfolder/in-folder.html',
                'dependencies/inline-and-imports.html',
                'dependencies/root.html'
            ]);
            const graph = yield getLatestDependencyGraph(analyzer);
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
        }));
    });
    suite('whenReady', () => {
        test('resolves for a single added document', () => __awaiter(this, void 0, void 0, function* () {
            const graph = new dependency_graph_1.DependencyGraph();
            const done = graph.whenReady(test_utils_1.resolvedUrl `a`);
            graph.addDocument(test_utils_1.resolvedUrl `a`, []);
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
            yield done;
        }));
        test('resolves for a single rejected document', () => __awaiter(this, void 0, void 0, function* () {
            const graph = new dependency_graph_1.DependencyGraph();
            const done = graph.whenReady(test_utils_1.resolvedUrl `a`);
            graph.rejectDocument(test_utils_1.resolvedUrl `a`, new Error('because'));
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
            yield done;
        }));
        test('resolves for a document with an added dependency', () => __awaiter(this, void 0, void 0, function* () {
            const graph = new dependency_graph_1.DependencyGraph();
            const done = graph.whenReady(test_utils_1.resolvedUrl `a`);
            graph.addDocument(test_utils_1.resolvedUrl `a`, [test_utils_1.resolvedUrl `b`]);
            graph.addDocument(test_utils_1.resolvedUrl `b`, []);
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
            yield done;
        }));
        test('resolves for a document with a rejected dependency', () => __awaiter(this, void 0, void 0, function* () {
            const graph = new dependency_graph_1.DependencyGraph();
            const done = graph.whenReady(test_utils_1.resolvedUrl `a`);
            graph.addDocument(test_utils_1.resolvedUrl `a`, [test_utils_1.resolvedUrl `b`]);
            graph.rejectDocument(test_utils_1.resolvedUrl `b`, new Error('because'));
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
            yield done;
        }));
        test('resolves for a simple cycle', () => __awaiter(this, void 0, void 0, function* () {
            const graph = new dependency_graph_1.DependencyGraph();
            const promises = [graph.whenReady(test_utils_1.resolvedUrl `a`), graph.whenReady(test_utils_1.resolvedUrl `b`)];
            graph.addDocument(test_utils_1.resolvedUrl `a`, ['b']);
            graph.addDocument(test_utils_1.resolvedUrl `b`, ['a']);
            yield Promise.all(promises);
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
        }));
        test('does not resolve early for a cycle with a leg', () => __awaiter(this, void 0, void 0, function* () {
            const graph = new dependency_graph_1.DependencyGraph();
            let cResolved = false;
            const aReady = graph.whenReady(test_utils_1.resolvedUrl `a`).then(() => {
                chai_1.assert.isTrue(cResolved);
            });
            const bReady = graph.whenReady(test_utils_1.resolvedUrl `b`).then(() => {
                chai_1.assert.isTrue(cResolved);
            });
            graph.addDocument(test_utils_1.resolvedUrl `a`, ['b', 'c']);
            graph.addDocument(test_utils_1.resolvedUrl `b`, ['a']);
            yield Promise.resolve();
            cResolved = true;
            graph.addDocument(test_utils_1.resolvedUrl `c`, []);
            yield Promise.all([aReady, bReady]);
            assertGraphIsSettled(graph);
            assertIsValidGraph(graph);
        }));
    });
});
/**
 * Asserts that all records in the graph have had all of their dependencies
 * resolved or rejected.
 */
function assertGraphIsSettled(graph) {
    for (const record of graph['_documents'].values()) {
        if (!(record.dependenciesDeferred.resolved ||
            record.dependenciesDeferred.rejected)) {
            chai_1.assert.fail(false, true, `found unsettled record for url '${record.url}' in graph that should be settled`);
        }
    }
}
/**
 * Asserts that for every record in the graph, each outgoing link is matched
 * by an incoming link on the other side, and vice versa.
 *
 * Since DependencyGraph tracks both incoming and outgoing links (dependencies
 * and dependants), when there is a dependency A -> B, both A and B should be
 * aware of that dependency link.
 */
function assertIsValidGraph(graph) {
    for (const record of graph['_documents'].values()) {
        for (const dependency of record.dependencies) {
            const dependencyRecord = graph['_documents'].get(dependency);
            chai_1.assert.isTrue(dependencyRecord !== undefined, `dependency record for ${dependency} should exist,` +
                ` as it is referenced by ${record.url}.`);
            chai_1.assert.isTrue(dependencyRecord.dependants.has(record.url), `${dependency} should know about its dependant ${record.url}`);
        }
        for (const dependant of record.dependants) {
            const dependantRecord = graph['_documents'].get(dependant);
            chai_1.assert.isTrue(dependantRecord !== undefined, `dependant record for ${dependant} should exist,` +
                ` as it is referenced by ${record.url}.`);
            chai_1.assert.isTrue(dependantRecord.dependencies.has(record.url), `${dependant} should know about its dependency ${record.url}`);
        }
    }
}
function getLatestDependencyGraph(analyzer) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield analyzer['_analysisComplete'];
        return context['_cache'].dependencyGraph;
    });
}
//# sourceMappingURL=dependency-graph_test.js.map