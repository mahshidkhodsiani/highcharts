/* *
 *
 *  Networkgraph series
 *
 *  (c) 2010-2021 Paweł Fus
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import type Point from '../../Core/Series/Point';
import H from '../../Core/Globals.js';
import U from '../../Core/Utilities.js';
const {
    extend
} = U;

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {
        class QuadTree {
            public constructor(
                x: number,
                y: number,
                width: number,
                height: number
            );
            public box: Record<string, number>;
            public maxDepth: number;
            public root: QuadTreeNode;
            public calculateMassAndCenter(): void;
            public insertNodes(nodes: Array<Point>): void;
            public visitNodeRecursive(
                node: (QuadTreeNode|null),
                beforeCallback?: (Function|null),
                afterCallback?: (Function|null)
            ): void;
        }
        class QuadTreeNode {
            public constructor(box: Record<string, number>);
            public body: (boolean|Point);
            public box: Record<string, number>;
            public boxSize: number;
            public isEmpty: boolean;
            public isInternal: boolean;
            public isRoot?: boolean;
            public mass?: number;
            public nodes: Array<QuadTreeNode>;
            public plotX?: number;
            public plotY?: number;
            public divideBox(): void;
            public getBoxPosition(node: Point): number;
            public insert(point: Point, depth?: number): void;
            public updateMassAndCenter(): void;
        }
    }
}

/* eslint-disable no-invalid-this, valid-jsdoc */

/**
 * The QuadTree node class. Used in Networkgraph chart as a base for Barnes-Hut
 * approximation.
 *
 * @private
 * @class
 * @name Highcharts.QuadTreeNode
 *
 * @param {Highcharts.Dictionary<number>} box Available space for the node
 */
const QuadTreeNode = H.QuadTreeNode = function (
    this: Highcharts.QuadTreeNode,
    box: Record<string, number>
): void {
    /**
     * Read only. The available space for node.
     *
     * @name Highcharts.QuadTreeNode#box
     * @type {Highcharts.Dictionary<number>}
     */
    this.box = box;
    /**
     * Read only. The minium of width and height values.
     *
     * @name Highcharts.QuadTreeNode#boxSize
     * @type {number}
     */
    this.boxSize = Math.min(box.width, box.height);
    /**
     * Read only. Array of subnodes. Empty if QuadTreeNode has just one Point.
     * When added another Point to this QuadTreeNode, array is filled with four
     * subnodes.
     *
     * @name Highcharts.QuadTreeNode#nodes
     * @type {Array<Highcharts.QuadTreeNode>}
     */
    this.nodes = [];
    /**
     * Read only. Flag to determine if QuadTreeNode is internal (and has
     * subnodes with mass and central position) or external (bound to Point).
     *
     * @name Highcharts.QuadTreeNode#isInternal
     * @type {boolean}
     */
    this.isInternal = false;
    /**
     * Read only. If QuadTreeNode is an external node, Point is stored in
     * `this.body`.
     *
     * @name Highcharts.QuadTreeNode#body
     * @type {boolean|Highcharts.Point}
     */
    this.body = false;
    /**
     * Read only. Internal nodes when created are empty to reserve the space. If
     * Point is added to this QuadTreeNode, QuadTreeNode is no longer empty.
     *
     * @name Highcharts.QuadTreeNode#isEmpty
     * @type {boolean}
     */
    this.isEmpty = true;
} as any;

extend(
    QuadTreeNode.prototype,
    /** @lends Highcharts.QuadTreeNode.prototype */
    {
        /**
         * Insert recursively point(node) into the QuadTree. If the given
         * quadrant is already occupied, divide it into smaller quadrants.
         *
         * @param {Highcharts.Point} point
         *        Point/node to be inserted
         * @param {number} depth
         *        Max depth of the QuadTree
         */
        insert: function (
            this: Highcharts.QuadTreeNode,
            point: Point,
            depth: number
        ): void {
            let newQuadTreeNode: Highcharts.QuadTreeNode;

            if (this.isInternal) {
                // Internal node:
                this.nodes[this.getBoxPosition(point)].insert(point, depth - 1);
            } else {
                this.isEmpty = false;

                if (!this.body) {
                    // First body in a quadrant:
                    this.isInternal = false;
                    this.body = point;
                } else {
                    if (depth) {
                        // Every other body in a quadrant:
                        this.isInternal = true;
                        this.divideBox();
                        // Reinsert main body only once:
                        if (this.body !== true) {
                            this.nodes[this.getBoxPosition(this.body)]
                                .insert(this.body, depth - 1);
                            this.body = true;
                        }
                        // Add second body:
                        this.nodes[this.getBoxPosition(point)]
                            .insert(point, depth - 1);
                    } else {
                        // We are below max allowed depth. That means either:
                        // - really huge number of points
                        // - falling two points into exactly the same position
                        // In this case, create another node in the QuadTree.
                        //
                        // Alternatively we could add some noise to the
                        // position, but that could result in different
                        // rendered chart in exporting.
                        newQuadTreeNode = new QuadTreeNode({
                            top: point.plotX,
                            left: point.plotY,
                            // Width/height below 1px
                            width: 0.1,
                            height: 0.1
                        });

                        newQuadTreeNode.body = point;
                        newQuadTreeNode.isInternal = false;

                        this.nodes.push(newQuadTreeNode);
                    }

                }
            }
        },
        /**
         * Each quad node requires it's mass and center position. That mass and
         * position is used to imitate real node in the layout by approximation.
         */
        updateMassAndCenter: function (this: Highcharts.QuadTreeNode): void {
            let mass = 0,
                plotX = 0,
                plotY = 0;

            if (this.isInternal) {
                // Calcualte weightened mass of the quad node:
                this.nodes.forEach(function (
                    pointMass: Highcharts.QuadTreeNode
                ): void {
                    if (!pointMass.isEmpty) {
                        mass += (pointMass.mass as any);
                        plotX +=
                            (pointMass.plotX as any) * (pointMass.mass as any);
                        plotY +=
                            (pointMass.plotY as any) * (pointMass.mass as any);
                    }
                });
                plotX /= mass;
                plotY /= mass;
            } else if (this.body) {
                // Just one node, use coordinates directly:
                mass = (this.body as any).mass;
                plotX = (this.body as any).plotX;
                plotY = (this.body as any).plotY;
            }

            // Store details:
            this.mass = mass;
            this.plotX = plotX;
            this.plotY = plotY;
        },
        /**
         * When inserting another node into the box, that already hove one node,
         * divide the available space into another four quadrants.
         *
         * Indexes of quadrants are:
         * ```
         * -------------               -------------
         * |           |               |     |     |
         * |           |               |  0  |  1  |
         * |           |   divide()    |     |     |
         * |     1     | ----------->  -------------
         * |           |               |     |     |
         * |           |               |  3  |  2  |
         * |           |               |     |     |
         * -------------               -------------
         * ```
         */
        divideBox: function (this: Highcharts.QuadTreeNode): void {
            const halfWidth = this.box.width / 2,
                halfHeight = this.box.height / 2;

            // Top left
            this.nodes[0] = new QuadTreeNode({
                left: this.box.left,
                top: this.box.top,
                width: halfWidth,
                height: halfHeight
            });

            // Top right
            this.nodes[1] = new QuadTreeNode({
                left: this.box.left + halfWidth,
                top: this.box.top,
                width: halfWidth,
                height: halfHeight
            });

            // Bottom right
            this.nodes[2] = new QuadTreeNode({
                left: this.box.left + halfWidth,
                top: this.box.top + halfHeight,
                width: halfWidth,
                height: halfHeight
            });

            // Bottom left
            this.nodes[3] = new QuadTreeNode({
                left: this.box.left,
                top: this.box.top + halfHeight,
                width: halfWidth,
                height: halfHeight
            });
        },
        /**
         * Determine which of the quadrants should be used when placing node in
         * the QuadTree. Returned index is always in range `< 0 , 3 >`.
         * @private
         */
        getBoxPosition: function (
            this: Highcharts.QuadTreeNode,
            point: Point
        ): number {
            let left =
                    (point.plotX as any) < this.box.left + this.box.width / 2,
                top =
                    (point.plotY as any) < this.box.top + this.box.height / 2,
                index: number;

            if (left) {
                if (top) {
                    // Top left
                    index = 0;
                } else {
                    // Bottom left
                    index = 3;
                }
            } else {
                if (top) {
                    // Top right
                    index = 1;
                } else {
                    // Bottom right
                    index = 2;
                }
            }

            return index;
        }
    }
);
/**
 * The QuadTree class. Used in Networkgraph chart as a base for Barnes-Hut
 * approximation.
 *
 * @private
 * @class
 * @name Highcharts.QuadTree
 *
 * @param {number} x left position of the plotting area
 * @param {number} y top position of the plotting area
 * @param {number} width width of the plotting area
 * @param {number} height height of the plotting area
 */
const QuadTree = H.QuadTree = function (
    this: Highcharts.QuadTree,
    x: number,
    y: number,
    width: number,
    height: number
): void {
    // Boundary rectangle:
    this.box = {
        left: x,
        top: y,
        width: width,
        height: height
    };

    this.maxDepth = 25;

    this.root = new QuadTreeNode(this.box, '0');

    this.root.isInternal = true;
    this.root.isRoot = true;
    this.root.divideBox();
} as any;


extend(
    QuadTree.prototype,
    /** @lends Highcharts.QuadTree.prototype */
    {
        /**
         * Insert nodes into the QuadTree
         *
         * @param {Array<Highcharts.Point>} points
         */
        insertNodes: function (
            this: Highcharts.QuadTree,
            points: Array<Point>
        ): void {
            points.forEach(function (point: Point): void {
                this.root.insert(point, this.maxDepth);
            }, this);
        },
        /**
         * Depfth first treversal (DFS). Using `before` and `after` callbacks,
         * we can get two results: preorder and postorder traversals, reminder:
         *
         * ```
         *     (a)
         *     / \
         *   (b) (c)
         *   / \
         * (d) (e)
         * ```
         *
         * DFS (preorder): `a -> b -> d -> e -> c`
         *
         * DFS (postorder): `d -> e -> b -> c -> a`
         *
         * @param {Highcharts.QuadTreeNode|null} node
         * @param {Function} [beforeCallback] function to be called before
         *                      visiting children nodes
         * @param {Function} [afterCallback] function to be called after
         *                      visiting children nodes
         */
        visitNodeRecursive: function (
            this: Highcharts.QuadTree,
            node: (Highcharts.QuadTreeNode|null),
            beforeCallback?: (Function|null),
            afterCallback?: (Function|null)
        ): void {
            let goFurther: (boolean|undefined);

            if (!node) {
                node = this.root;
            }

            if (node === this.root && beforeCallback) {
                goFurther = beforeCallback(node);
            }

            if (goFurther === false) {
                return;
            }

            node.nodes.forEach(
                function (
                    this: Highcharts.QuadTree,
                    qtNode: Highcharts.QuadTreeNode
                ): void {
                    if (qtNode.isInternal) {
                        if (beforeCallback) {
                            goFurther = beforeCallback(qtNode);
                        }
                        if (goFurther === false) {
                            return;
                        }
                        this.visitNodeRecursive(
                            qtNode,
                            beforeCallback,
                            afterCallback
                        );
                    } else if (qtNode.body) {
                        if (beforeCallback) {
                            beforeCallback(qtNode.body);
                        }
                    }
                    if (afterCallback) {
                        afterCallback(qtNode);
                    }
                },
                this
            );
            if (node === this.root && afterCallback) {
                afterCallback(node);
            }
        },
        /**
         * Calculate mass of the each QuadNode in the tree.
         */
        calculateMassAndCenter: function (this: Highcharts.QuadTree): void {
            this.visitNodeRecursive(
                null,
                null,
                function (node: Highcharts.QuadTreeNode): void {
                    node.updateMassAndCenter();
                }
            );
        }
    }
);
