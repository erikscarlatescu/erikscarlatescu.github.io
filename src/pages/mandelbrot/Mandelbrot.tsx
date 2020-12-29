import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Canvas from '../../util/Canvas';

export const MandelBrot = () => {
    const vsSource = `
        attribute vec2 aVertexPos;

        //bounds for camera in the order: left, right, up, down
        uniform vec4 cameraInfo;

        varying vec2 p;

        void main()
        {
            gl_Position = vec4(aVertexPos, 0.0, 1.0);
            
            vec2 temp = 0.5*(aVertexPos + vec2(1.0, 1.0));

            // I really did just brute force it with advanced AI right here
            if (aVertexPos == vec2(-1.0, -1.0))
                p = cameraInfo.xw;
            else if (aVertexPos == vec2(-1.0, 1.0))
                p = cameraInfo.xz;
            else if (aVertexPos == vec2(1.0, 1.0))
                p = cameraInfo.yz;
            else
                p = cameraInfo.yw;
        }
    `;

    const fsSource = `
        precision highp float;

        varying vec2 p;
        const int max_iterations = 1024;

        void main()
        {
            float znr = 0.0;
            float zni = 0.0;
            
            int bounded_iterations = 0;
            for (int i = 0; i < max_iterations; i++)
            {
                // once bounded_iterations is set, it is no longer changed
                if (znr*znr + zni*zni >= 4.0 && bounded_iterations == 0)
                {
                    bounded_iterations = i+1;
                }

                float znnr = znr*znr - zni*zni + p.x;
                float znni = 2.0*znr*zni + p.y;

                znr = znnr;
                zni = znni;
            }

            if (znr*znr + zni*zni < 4.0)
            {
                bounded_iterations = max_iterations;
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
            else
            {
                float r = 0.5 * sin(3.0 * log(float(bounded_iterations)) + 0.0) + 0.5;
                float g = 0.5 * sin(2.1 * log(float(bounded_iterations)) - 1.2) + 0.5;
                float b = 0.5 * sin(4.6 * log(float(bounded_iterations)) + 0.6) + 0.5;
                gl_FragColor = vec4(r, g, b, 1.0);
            }
            //gl_FragColor = vec4(vec3(float(bounded_iterations)/float(max_iterations)), 1.0);
        }
    `;

    const CANVAS_WIDTH: number = 960;
    const CANVAS_HEIGHT: number = 640;

    let left = -CANVAS_WIDTH / CANVAS_HEIGHT;
    let right = CANVAS_WIDTH / CANVAS_HEIGHT;
    let up = 1.0;
    let down = -1.0;

    let dragging = false;
    let lastx = 0;
    let lasty = 0;

    function translate(deltax: number, deltay: number): void
    {
        let camWidth = right - left;
        let camHeight = up - down;
        left -= (deltax / CANVAS_WIDTH) * camWidth;
        right -= (deltax / CANVAS_WIDTH) * camWidth;
        up += (deltay / CANVAS_HEIGHT) * camHeight;
        down += (deltay / CANVAS_HEIGHT) * camHeight;
    }

    function zoom(magnify: boolean): void
    {
        let camWidth = right - left;
        let camHeight = up - down;
        if (magnify)
        {
            left += (lastx / CANVAS_WIDTH) * camWidth * 0.1;
            right -= (1.0 - lastx / CANVAS_WIDTH) * camWidth * 0.1;
            up -= (lasty / CANVAS_HEIGHT) * camHeight * 0.1;
            down += (1.0 - lasty / CANVAS_HEIGHT) * camHeight * 0.1;
        }
        else
        {
            left -= (lastx / CANVAS_WIDTH) * camWidth * 0.1;
            right += (1.0 - lastx / CANVAS_WIDTH) * camWidth * 0.1;
            up += (lasty / CANVAS_HEIGHT) * camHeight * 0.1;
            down -= (1.0 - lasty / CANVAS_HEIGHT) * camHeight * 0.1;
        }
    }

    useEffect(() => {
        document.title = "Mandelbrot";
    });

    let firstDraw = true;
    let cameraLoc: WebGLUniformLocation;
    let vertexPosLoc: number;
    function draw(gl: WebGL2RenderingContext) {
        if (firstDraw) {
            const shaderProgram = initShaderProgram(gl, vsSource, fsSource) as WebGLProgram;
            vertexPosLoc = gl.getAttribLocation(shaderProgram, "aVertexPos");
            cameraLoc = gl.getUniformLocation(shaderProgram, "cameraInfo") as WebGLUniformLocation;

            const buffer = initBuffers(gl);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(
                vertexPosLoc,
                2,
                gl.FLOAT,
                false,
                0,
                0
            )
            gl.enableVertexAttribArray(vertexPosLoc);
            gl.useProgram(shaderProgram);
        }

        gl.clearColor(1.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform4f(cameraLoc, left, right, up, down);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource) as WebGLShader;
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource) as WebGLShader;
    
        const shaderProgram = gl.createProgram() as WebGLProgram;
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
    
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
    
        return shaderProgram;
    }
    
    function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
        const shader: WebGLShader = gl.createShader(type) as WebGLShader;
    
        gl.shaderSource(shader, source);
    
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
    
        return shader;
    }

    // creates a buffer with vertex positions for a simple rectangle that fills the canvas
    function initBuffers(gl: WebGL2RenderingContext)
    {
        const positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = [
            -1.0, -1.0,
            -1.0,  1.0,
            1.0,  1.0,
            -1.0, -1.0,
            1.0,  1.0,
            1.0, -1.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER,
                        new Float32Array(positions),
                        gl.STATIC_DRAW);

        return positionBuffer;
    }


    return (
        <div className="mainContent">
            <Link to="/">Back to main page</Link>
            <Canvas contextType="webgl" renderFunc={draw} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
                mouseDown={e => {
                    console.log("mousedown");
                    dragging = true;
                    lastx = e.offsetX;
                    lasty = e.offsetY;
                }}

                mouseUp={e => {
                    console.log("mouseup");
                    dragging = false;
                }}

                mouseMove={e => {
                    if (dragging)
                    {
                        var deltax = e.offsetX - lastx;
                        var deltay = e.offsetY - lasty;

                        translate(deltax, deltay);

                        // updates last mouse position
                        lastx = e.offsetX;
                        lasty = e.offsetY;
                    }
                    else
                    {
                        lastx = e.offsetX;
                        lasty = e.offsetY;
                    }
                }}

                mouseWheel={e => {
                    console.log(e.deltaY);
                    if (e.deltaY < 0)
                        zoom(true);
                    else
                        zoom(false);
                }}

                keyDown={e => {
                   switch (e.key) {
                       case 'r':
                           left = -CANVAS_WIDTH / CANVAS_HEIGHT;
                           right = CANVAS_WIDTH / CANVAS_HEIGHT;
                           up = 1.0;
                           down = -1.0;
                           break;
                        case 'd':
                            translate(100, 0);
                            break;
                        case 'a':
                            translate(-100, 0);
                            break;
                        case 's':
                            translate(0, 100);
                            break;
                        case 'w':
                            translate(0, -100);
                            break;
                        case 'i':
                            zoom(true);
                            break;
                        case 'o':
                            zoom(false);
                            break;
                   }
                }}
            />
            <p>This is made using WebGL. All calculations are done in a fragment shader. 
                Since WebGL (and OpenGL in general) doesn't like to use floats with more precision than 32 bits, 
                it doesn't take much zooming to hit the limit on this. Nevertheless, I still think it's pretty cool. 
                I will try experimenting soon with increasing precision.</p>
            <p>Click and drag with the mouse or use the arrow keys to pan around. To zoom, use the scroll wheel, or press 'i' to zoom in and 'o' to zoom out. Press 'r' to reset to the original zoom.</p>
            </div>
    );
};

export default MandelBrot;