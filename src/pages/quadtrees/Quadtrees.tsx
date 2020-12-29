import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Canvas from '../../util/Canvas';

import './colorbuttonstyles.css';

enum NodeType {
    MIXED_TYPE = -1,
    GREY,
    BLUE,
    GREEN,
    BROWN,
    RED
}

interface BFSnode {
    node: QuadtreeNode;
    width: number;
    height: number;
    centerx: number;
    centery: number;
    depth: number;
}

let typeColors = ['#999999', '#2288EE', '#5CCC00', '#9B7653', '#FF6600']
let selectedType = 0;

class Quadtree {
    private root: QuadtreeNode;
    private depthCap: number;
    private centerx: number;
    private centery: number;
    private width: number;
    private height: number;

    private buffer: HTMLCanvasElement;
    private bufferContext: CanvasRenderingContext2D;

    constructor(depthCap: number, centerx: number, centery: number, width: number, height: number) {
        this.root = new QuadtreeNode(0, depthCap);
        this.depthCap = depthCap;
        this.centerx = centerx;
        this.centery = centery;
        this.width = width;
        this.height = height;

        // this buffer is used for rendering the grid lines over the canvas with inverted colors
        this.buffer = document.createElement("canvas");
        this.buffer.width = 512;
        this.buffer.height = 512;
        this.bufferContext = this.buffer.getContext('2d') as CanvasRenderingContext2D;
    }

    draw(ctx: CanvasRenderingContext2D, drawGrid: boolean = true): void {
        this.bufferContext.strokeStyle = '#FFFFFF';
        this.bufferContext.clearRect(0, 0, 512, 512);
        this.bufferContext.fillStyle = '#FFFFFF';
        this.root.draw(ctx, this.bufferContext, this.centerx, this.centery, this.width, this.height);

        if (drawGrid) {
            ctx.globalCompositeOperation='difference';
            ctx.drawImage(this.buffer, 0, 0);
            ctx.globalCompositeOperation='source-over';
        }
    }

    handleClick(type: NodeType, x: number, y: number, targetDepth: number) {
        this.root.handleClick(type, x, y, targetDepth, 0, this.depthCap, this.centerx, this.centery, this.width, this.height);
    }

    drawHoverbox(ctx: CanvasRenderingContext2D, mousex: number, mousey: number, targetDepth: number) {
        ctx.strokeStyle = '#FFFFFF';
        //ctx.globalCompositeOperation='difference';
        this.root.drawHoverbox(ctx, mousex, mousey, targetDepth, 0, this.depthCap, this.centerx, this.centery, this.width, this.height);
        //ctx.globalCompositeOperation='source-over';
    }

    getNodeAt(cursorx: number, cursory: number, maxDepth: number = this.depthCap): undefined | BFSnode {
        if (cursorx < 0 || cursory < 0 || cursorx > this.width || cursory > this.height) {
            return undefined;
        }
        let current = this.root;
        let centerx = this.centerx;
        let centery = this.centery;
        let width = this.width;
        let height = this.height;
        let depth = 0;
        while (current.getType() === NodeType.MIXED_TYPE && depth < maxDepth) {
            // top left
            if (cursorx <= centerx && cursory <= centery) {
                centerx -= width*0.25;
                centery -= height*0.25;
                current = current.getChild(0);
            }
            // bottom left
            else if (cursorx <= centerx && cursory > centery) {
                centerx -= width*0.25;
                centery += height*0.25;
                current = current.getChild(1);
            }
            // bottom right
            else if (cursorx > centerx && cursory > centery) {
                centerx += width*0.25;
                centery += height*0.25;
                current = current.getChild(2);
            }
            // top right
            else {
                centerx += width*0.25;
                centery -= height*0.25;
                current = current.getChild(3);
            }
            width *= 0.5;
            height *= 0.5;
            depth++;
        }
        return {node: current, width: width, height: height, centerx: centerx, centery: centery, depth: depth};
    }

    selectTest(cursorx: number, cursory: number) {
        console.log("SELECT TEST");
        let current = this.getNodeAt(cursorx, cursory);
        if (current === undefined) {
            return;
        }
        console.log("not nll");
        /*
        current.node.selected = true;

        let topneighbors = current.node.getBottomNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth); topneighbors.forEach(e => {
            e.node.selected = true;
        });
        topneighbors = current.node.getTopNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth); topneighbors.forEach(e => {
            e.node.selected = true;
        });
        topneighbors = current.node.getRightNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth); topneighbors.forEach(e => {
            e.node.selected = true;
        });
        */
        let topneighbors = current.node.getLeftNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth); topneighbors.forEach(e => {
            e.node.selected = true;
        });
       console.log(current.node.getLeftNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth));
    }

    // performs BFS to do a flood fill
    floodFill(cursorx: number, cursory: number, fillColor: NodeType) {
        let start = this.getNodeAt(cursorx, cursory);
        if (start === undefined) {
            return;
        }

        let startingColor = start.node.getType();
        if (startingColor === fillColor) {
            return;
        }

        let queue = [start];
        while (queue.length > 0) {
            let current = queue.shift();
            if (current === undefined) {
                continue;
            }
            current?.node.setType(fillColor, current.depth, this.depthCap);

            let neighbors = current?.node.getTopNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth);
            if (neighbors !== undefined) {
                neighbors.forEach(e => {
                    if (e.node.getType() === startingColor && !queue.includes(e)) {
                        queue.push(e);
                    }
                });
            }

            neighbors = current?.node.getBottomNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth);
            if (neighbors !== undefined) {
                neighbors.forEach(e => {
                    if (e.node.getType() === startingColor && !queue.includes(e)) {
                        queue.push(e);
                    }
                });
            }

            neighbors = current?.node.getLeftNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth);
            if (neighbors !== undefined) {
                neighbors.forEach(e => {
                    if (e.node.getType() === startingColor && !queue.includes(e)) {
                        queue.push(e);
                    }
                });
            }

            neighbors = current?.node.getRightNeighbors(this, current.width, current.height, current.centerx, current.centery, current.depth);
            if (neighbors !== undefined) {
                neighbors.forEach(e => {
                    if (e.node.getType() === startingColor && !queue.includes(e)) {
                        queue.push(e);
                    }
                });
            }
        }
        this.root.consolidate(0, this.depthCap);
    }
}

class QuadtreeNode {
    // 0: top left
    // 1: bottom left
    // 2: bottom right
    // 3: top right
    private children: QuadtreeNode[];
    public type: NodeType;
    public selected: boolean = false;

    constructor(depth: number, depthCap: number) {
        this.type = 1; // hardcodes default as the "sky" looking color
        this.children = [];

        // if the node is not a leaf, add four children
        if (depth < depthCap) {
            for (let i = 0; i < 4; i++) {
                this.children.push(new QuadtreeNode(depth + 1, depthCap));
            }
        }
    }

    getType() {
        return this.type;
    }

    getChild(index: number) {
        return this.children[index];
    }

    consolidate(depth: number, depthCap: number) {
        if (depth === depthCap || this.type !== NodeType.MIXED_TYPE) {
            return;
        }

        if (this.children[0].type !== NodeType.MIXED_TYPE && this.children[0].type === this.children[1].type && this.children[1].type === this.children[2].type && this.children[2].type === this.children[3].type) {
            this.setType(this.children[0].type, depth, depthCap);
        }
        else {
            this.type = NodeType.MIXED_TYPE;
            this.children[0].consolidate(depth + 1, depthCap);
            this.children[1].consolidate(depth + 1, depthCap);
            this.children[2].consolidate(depth + 1, depthCap);
            this.children[3].consolidate(depth + 1, depthCap);
            if (this.children[0].type !== NodeType.MIXED_TYPE && this.children[0].type === this.children[1].type && this.children[1].type === this.children[2].type && this.children[2].type === this.children[3].type) {
                this.setType(this.children[0].type, depth, depthCap);
            }
        }
    }

    getTopChildren(width: number, height: number, centerx: number, centery: number, depth: number): BFSnode[] {
        if (this.type !== NodeType.MIXED_TYPE) {
            return [{node: this, width: width, height: height, centerx: centerx, centery: centery, depth: depth}];
        }

        let nodeList: BFSnode[] = [];
        nodeList.push(...this.children[0].getTopChildren(width*0.5, height*0.5, centerx - width*0.25, centery - height*0.25, depth + 1));
        nodeList.push(...this.children[3].getTopChildren(width*0.5, height*0.5, centerx + width*0.25, centery - height*0.25, depth + 1));
        return nodeList;
    }

    getBottomChildren(width: number, height: number, centerx: number, centery: number, depth: number): BFSnode[] {
        if (this.type !== NodeType.MIXED_TYPE) {
            return [{node: this, width: width, height: height, centerx: centerx, centery: centery, depth: depth}];
        }

        let nodeList: BFSnode[] = [];
        nodeList.push(...this.children[1].getBottomChildren(width*0.5, height*0.5, centerx - width*0.25, centery + height*0.25, depth + 1));
        nodeList.push(...this.children[2].getBottomChildren(width*0.5, height*0.5, centerx + width*0.25, centery + height*0.25, depth + 1));
        return nodeList;
    }

    getLeftChildren(width: number, height: number, centerx: number, centery: number, depth: number): BFSnode[] {
        if (this.type !== NodeType.MIXED_TYPE) {
            return [{node: this, width: width, height: height, centerx: centerx, centery: centery, depth: depth}];
        }

        let nodeList: BFSnode[] = [];
        nodeList.push(...this.children[0].getLeftChildren(width*0.5, height*0.5, centerx - width*0.25, centery - height*0.25, depth + 1));
        nodeList.push(...this.children[1].getLeftChildren(width*0.5, height*0.5, centerx - width*0.25, centery + height*0.25, depth + 1));
        return nodeList;
    }

    getRightChildren(width: number, height: number, centerx: number, centery: number, depth: number): BFSnode[] {
        if (this.type !== NodeType.MIXED_TYPE) {
            return [{node: this, width: width, height: height, centerx: centerx, centery: centery, depth: depth}];
        }

        let nodeList: BFSnode[] = [];
        nodeList.push(...this.children[3].getRightChildren(width*0.5, height*0.5, centerx + width*0.25, centery - height*0.25, depth + 1));
        nodeList.push(...this.children[2].getRightChildren(width*0.5, height*0.5, centerx + width*0.25, centery + height*0.25, depth + 1));
        return nodeList;
    }

    getTopNeighbors(tree: Quadtree, width: number, height: number, centerx: number, centery: number, depth: number) {
        let node = tree.getNodeAt(centerx, centery - height, depth);
        if (node === undefined) {
            return [];
        }
        if (node.node.type !== NodeType.MIXED_TYPE) {
            return [node];
        }
        return node.node.getBottomChildren(width, height, centerx, centery - height, depth);
    }

    getBottomNeighbors(tree: Quadtree, width: number, height: number, centerx: number, centery: number, depth: number) {
        let node = tree.getNodeAt(centerx, centery + height, depth);
        if (node === undefined) {
            return [];
        }
        if (node.node.type !== NodeType.MIXED_TYPE) {
            return [node];
        }
        return node.node.getTopChildren(width, height, centerx, centery + height, depth);
    }

    getLeftNeighbors(tree: Quadtree, width: number, height: number, centerx: number, centery: number, depth: number) {
        let node = tree.getNodeAt(centerx - width, centery, depth);
        if (node === undefined) {
            return [];
        }
        if (node.node.type !== NodeType.MIXED_TYPE) {
            return [node];
        }
        return node.node.getRightChildren(width, height, centerx - width, centery, depth);
    }

    getRightNeighbors(tree: Quadtree, width: number, height: number, centerx: number, centery: number, depth: number) {
        let node = tree.getNodeAt(centerx + width, centery, depth);
        if (node === undefined) {
            return [];
        }
        return node.node.getLeftChildren(width, height, centerx + width, centery, depth);
    }

    setType(type: NodeType, depth: number, depthCap: number) {
        if (depth < depthCap) {
            for (let i = 0; i < 4; i++) {
                this.children[i].setType(type, depth + 1, depthCap);
            }
        }
        this.type = type;
    }

    handleClick(type: NodeType, x: number, y: number, targetDepth: number, depth: number, depthCap: number, centerx: number, centery: number, width: number, height: number) {
        if (type === this.type) {
            return;
        }

        if (depth === targetDepth) {
            this.setType(type, depth, depthCap);
            return;
        }

        if (x <= centerx && y <= centery && this.children[0].type !== type) {
            this.children[0].handleClick(type, x, y, targetDepth, depth + 1, depthCap, centerx - width*0.25, centery - height*0.25, width*0.5, height*0.5);
        }
        else if (x <= centerx && y > centery && this.children[1].type !== type) {
            this.children[1].handleClick(type, x, y, targetDepth, depth + 1, depthCap, centerx - width*0.25, centery + height*0.25, width*0.5, height*0.5);
        }
        else if (x > centerx && y > centery && this.children[2].type !== type) {
            this.children[2].handleClick(type, x, y, targetDepth, depth + 1, depthCap, centerx + width*0.25, centery + height*0.25, width*0.5, height*0.5);
        }
        else if (x > centerx && y <= centery && this.children[3].type !== type) {
            this.children[3].handleClick(type, x, y, targetDepth, depth + 1, depthCap, centerx + width*0.25, centery - height*0.25, width*0.5, height*0.5);
        }

        // consolidates types
        if (this.children[0].type === this.children[1].type && this.children[1].type === this.children[2].type && this.children[2].type === this.children[3].type)
            this.type = this.children[0].type;
        else
            this.type = NodeType.MIXED_TYPE;
    }

    draw(ctx: CanvasRenderingContext2D, bctx: CanvasRenderingContext2D, centerx: number, centery: number, width: number, height: number) {
        if (this.type === NodeType.MIXED_TYPE) {
            this.children[0].draw(ctx, bctx, centerx - width*0.25, centery - height*0.25, width*0.5, height*0.5);
            this.children[1].draw(ctx, bctx, centerx - width*0.25, centery + height*0.25, width*0.5, height*0.5);
            this.children[2].draw(ctx, bctx, centerx + width*0.25, centery + height*0.25, width*0.5, height*0.5);
            this.children[3].draw(ctx, bctx, centerx + width*0.25, centery - height*0.25, width*0.5, height*0.5);

            // the lines draw faintly the first time, and the easiest way to make them more well defined is to just draw them more times
            // it is somewhat clunky but it works well

            for (let i = 0; i < 2; i++) {
                bctx.beginPath();
                bctx.moveTo(centerx - width*0.5, centery - height*0.5);
                bctx.lineTo(centerx - width*0.5, centery + height*0.5);
                bctx.lineTo(centerx + width*0.5, centery + height*0.5);
                bctx.lineTo(centerx + width*0.5, centery - height*0.5);
                bctx.lineTo(centerx - width*0.5, centery - height*0.5);
                bctx.stroke();

                bctx.beginPath();
                bctx.moveTo(centerx - width*0.5, centery);
                bctx.lineTo(centerx + width*0.5, centery);
                bctx.stroke();

                bctx.beginPath();
                bctx.moveTo(centerx, centery - height*0.5);
                bctx.lineTo(centerx, centery + height*0.5);
                bctx.stroke();
            }
        }
        else {
            ctx.fillStyle = typeColors[this.type];
            if (this.selected) {
                ctx.fillStyle = '#FF00FF';
            }
            ctx.fillRect((centerx - width*0.5), (centery - height*0.5), width, height);
        }
    }

    drawHoverbox(ctx: CanvasRenderingContext2D, x: number, y: number, targetDepth: number, depth: number, depthCap: number, centerx: number, centery: number, width: number, height: number) {
        if (depth === targetDepth || depth === depthCap) {
            ctx.beginPath();
            ctx.moveTo(centerx - width*0.5, centery - height*0.5);
            ctx.lineTo(centerx - width*0.5, centery + height*0.5);
            ctx.lineTo(centerx + width*0.5, centery + height*0.5);
            ctx.lineTo(centerx + width*0.5, centery - height*0.5);
            ctx.lineTo(centerx - width*0.5, centery - height*0.5);
            ctx.stroke();
        }
        else {
            if (x <= centerx && y <= centery) {
                this.children[0].drawHoverbox(ctx, x, y, targetDepth, depth + 1, depthCap, centerx - width*0.25, centery - height*0.25, width*0.5, height*0.5);
            }
            else if (x <= centerx && y > centery) {
                this.children[1].drawHoverbox(ctx, x, y, targetDepth, depth + 1, depthCap, centerx - width*0.25, centery + height*0.25, width*0.5, height*0.5);
            }
            else if (x > centerx && y > centery) {
                this.children[2].drawHoverbox(ctx, x, y, targetDepth, depth + 1, depthCap, centerx + width*0.25, centery + height*0.25, width*0.5, height*0.5);
            }
            else if (x > centerx && y <= centery) {
                this.children[3].drawHoverbox(ctx, x, y, targetDepth, depth + 1, depthCap, centerx + width*0.25, centery - height*0.25, width*0.5, height*0.5);
            }
        }
    }
}

export const Quadtrees = () => {
    let quadtree: Quadtree;
    let dragging: boolean = false;
    let brushSize: number = 6;
    const MAX_BRUSH_SIZE: number = 6;
    let mousex = 0.0;
    let mousey = 0.0;
    let drawGrid = true;

    useEffect(() => {
        // in this arrangement, the quadtree apparently gets reset after each time react renders, but react never needs to render again so this works for now
        quadtree = new Quadtree(MAX_BRUSH_SIZE, 256, 256, 512, 512);
    });

    function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
        drawGrid = e.target.checked;
    }

    function draw(ctx: CanvasRenderingContext2D) {
        if (quadtree === undefined) {
            console.log("Quadtree is undefined!!");
            return;
        }

        ctx.lineWidth = 2;
        quadtree.draw(ctx, drawGrid);
        quadtree.drawHoverbox(ctx, mousex, mousey, brushSize);
    }

    let colorButtons = []
    colorButtons.push(<span><input onClick={() => selectedType=0} type="radio" id={"radio0"} name="radios" value={0} /><label style={{ backgroundColor: typeColors[0] }} htmlFor={"radio0"}></label></span>)
    for (let i = 1; i < typeColors.length; i++) {
        let id: string = "radio" + i;
        colorButtons.push(<span><input onClick={() => selectedType=i} type="radio" id={id} name="radios" value={i} /><label style={{ backgroundColor: typeColors[i] }} htmlFor={id}></label></span>)
    }
    return (
        <div className="mainContent">
            <Link to="/">Back to main page</Link>
            <Canvas contextType='2d' renderFunc={draw} width={512} height={512}
                mouseDown = {(e: MouseEvent) => {
                    quadtree.handleClick(selectedType, e.offsetX, e.offsetY, brushSize);
                    dragging = true;
                }}

                mouseMove = {(e: MouseEvent) => {
                    mousex = e.offsetX;
                    mousey = e.offsetY;

                    if (dragging) {
                        quadtree.handleClick(selectedType, e.offsetX, e.offsetY, brushSize);
                    }
                }}

                mouseUp = {(e: MouseEvent) => {
                    dragging = false;
                }}

                mouseWheel = {(e: WheelEvent) => {
                    if (e.deltaY > 0) {
                        brushSize++;
                    }
                    else if (e.deltaY < 0) {
                        brushSize--;
                    }

                    if (brushSize > MAX_BRUSH_SIZE) {
                        brushSize = MAX_BRUSH_SIZE;
                    } else if (brushSize < 0) {
                        brushSize = 0;
                    }
                }}

                mouseOut = {(e: MouseEvent) => {
                    dragging = false;
                }}

                keyDown = {(e: KeyboardEvent) => {
                    switch (e.key) {
                        case 'i':
                            brushSize++;
                            if (brushSize > MAX_BRUSH_SIZE) {
                                brushSize = MAX_BRUSH_SIZE;
                            }
                            break;
                        case 'o':
                            brushSize--;
                            if (brushSize < 0) {
                                brushSize = 0;
                            }
                            break;
                        case 'f':
                            quadtree.floodFill(mousex, mousey, selectedType);
                            break;
                        //case 's':
                            //quadtree.selectTest(mousex, mousey);
                            //break;
                    }
                }}
            />
            <div className="colorButtonDiv"> {colorButtons} </div>
            <input onChange={handleCheckboxChange.bind(this)} defaultChecked={true} type="checkbox" id="gridRenderCheckbox"/>
            <label htmlFor="gridRenderCheckbox">Render grid</label>
            <p>Select a color to draw with by clicking on its square above. Then simply click and drag to draw. Press 'f' to perform a floodfill at the location of the mouse cursor with the selected color.</p>
            <p>Recently, I've been obsessed with making a voxel game similar to Minecraft. One thing I've read is how commonly octrees are used for this purpose. Before I try making anything with octrees, 
                I wanted to see if I could even use quadtrees, the more mild 2-dimensional cousins of octrees.</p>
            <p>The canvas above is sort of like a picture in MS Paint that you can draw on, but it also visualizes the quadtree structure. For the most part, this wasn't too hard to implement, 
                but getting the flood fill to work properly was somewhat of a challenge. Press 'o' to make the brush larger and 'i' to make it smaller.</p>
        </div>
    );
}

export default Quadtrees;