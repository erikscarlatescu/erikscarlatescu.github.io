import React, { useEffect, useRef } from 'react'

interface Props {
    renderFunc: ((ctx: WebGL2RenderingContext, w: number, h: number) => void)
        | ((ctx: CanvasRenderingContext2D, w: number, h: number) => void);
    width: number;
    height: number;
    contextType: string;

    mouseDown?: (e: MouseEvent) => void;
    mouseUp?: (e: MouseEvent) => void;
    mouseMove?: (e: MouseEvent) => void;
    mouseWheel?: (e: WheelEvent) => void;
    mouseOut?: (e: MouseEvent) => void;
    keyDown?: (e: KeyboardEvent) => void;
    keyUp?: (e: KeyboardEvent) => void;
}

// react and typescript-friendly wrapper for HTML5 canvas
export const Canvas: React.FC<Props> = ({renderFunc, width, height, mouseDown, mouseUp, mouseMove, mouseWheel, mouseOut, keyDown, keyUp, contextType}) => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let canvas = ref.current as any;
        // this doesn't seem advisable, but it still appears to be the most concise fix
        //let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        let context = canvas.getContext(contextType);

        // initialize event listeners:
        if (mouseDown !== undefined) {
            canvas.addEventListener('mousedown', mouseDown);
        }
        if (mouseUp !== undefined) {
            canvas.addEventListener('mouseup', mouseUp);
        }
        if (mouseMove !== undefined) {
            canvas.addEventListener('mousemove', mouseMove);
        }
        if (mouseWheel !== undefined) {
            canvas.addEventListener('mousewheel', mouseWheel);
        }
        if (mouseOut !== undefined) {
            canvas.addEventListener('mouseout', mouseOut);
        }
        if (keyDown !== undefined) {
            window.addEventListener('keydown', keyDown);
        }
        if (keyUp !== undefined) {
            window.addEventListener('keyup', keyUp);
        }

        let requestid: number;
        const render = () => {
            renderFunc(context, width, height);
            requestid = requestAnimationFrame(render);
        }
        render();

        // cleanup
        return () => {
            cancelAnimationFrame(requestid);
        }
    });
    return (
        <canvas 
            ref={ref}
            width={width}
            height={height}
        />
    );
}

export default Canvas