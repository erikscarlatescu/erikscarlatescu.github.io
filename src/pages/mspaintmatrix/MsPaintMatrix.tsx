import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Tex2SVG from 'react-hook-mathjax'

import Canvas from '../../util/Canvas';

import './mspaintstyles.css';

import stockphotosign from './stockphotosign.jpg';
import step1 from './step1.png';
import step2 from './step2.png';
import step3 from './step3.png';
import step4 from './step4.png';
import finalresult from './finalresult.png';
import bobrossimg from './bobross.jpg';

export const MsPaintMatrix = () => {
    const original_width_field_ref = useRef<HTMLInputElement>(null);
    const original_height_field_ref = useRef<HTMLInputElement>(null);
    const angle_field_ref = useRef<HTMLInputElement>(null);
    const second_angle_field_ref = useRef<HTMLInputElement>(null);
    const slider_ref = useRef<HTMLInputElement>(null);

    const [calcWidthText, setCalcWidthText] = useState<string>('The new width is: ');
    const [calcHeightText, setCalcHeightText] = useState<string>('The new height is: ');

    const bobross_ref = useRef<HTMLImageElement>(null);

    let smallimgstyle: CSSProperties = {
        width: '30%'
    };

    let medimgstyle: CSSProperties = {
        width: '60%'
    };

    let centerstyle: CSSProperties = {
        textAlign: 'center'
    };

    let invis: CSSProperties = {
        display: 'none'
    }

    function onTextFieldChange(): void {
        let widthfield: number = parseInt(original_width_field_ref.current!.value);
        let heightfield: number = parseInt(original_height_field_ref.current!.value);
        let anglefield: number = parseInt(angle_field_ref.current!.value);

        setCalcWidthText("The new width is: "+Math.round(widthfield*Math.cos(anglefield*Math.PI/180)));
        setCalcHeightText("The new height is: "+Math.round(heightfield/Math.cos(anglefield*Math.PI/180)));
    }

    useEffect(() => {
        document.title = "Matrix!";
        onTextFieldChange();
    });

    function lerp(a: number, b: number, t: number): number {
        return (1-t) * a + t * b;
    }

    function draw(c: CanvasRenderingContext2D, width: number, height: number) {
        if (slider_ref.current == null) {
            return;
        }

        c.setTransform(1, 0, 0, 1, 0, 0)
        c.clearRect(0,0,640,480)
        //c.setTransform(1, -slider.value * 0.001, 0, -1, 320, 240)
        c.setTransform(1, 0, 0, 1, 320, 240)

        let scalar: number;
        let slidervalue: number = parseInt(slider_ref.current!.value);

        // angle value is capped, converted to radians, and flipped to account for flipped y-axis on HTML5 canvas
        let angle: number = parseInt(second_angle_field_ref.current!.value);
        if (angle <= -180) {
            angle = Math.PI;
        }
        else if (angle >= 180) {
            angle = -Math.PI;
        }
        else {
            angle = -angle * Math.PI / 180.0
        }

        if (slidervalue <= 333) {
            scalar = slidervalue / 333.0;
            c.transform(1,lerp(0,Math.tan(angle), scalar),0, 1, 0, 0)
        }
        else if (slidervalue <= 666) {
            scalar = (slidervalue - 333) / 333.0
            c.transform(1,Math.tan(angle), 0, 1, 0, 0)
            c.transform(lerp(1,Math.cos(angle),scalar),0,0,lerp(1,1/Math.cos(angle),scalar),0,0)
        }
        else {
            scalar = (slidervalue - 666) / 333.0
            c.transform(1,Math.tan(angle), 0, 1, 0, 0)
            c.transform(Math.cos(angle),0,0,1/Math.cos(angle),0,0)
            c.transform(1, 0, lerp(0, -Math.tan(angle), scalar),  1, 0, 0)
        }

        //c.setTransform(Math.cos(getAngle()), Math.sin(getAngle()), -Math.sin(getAngle()), Math.cos(getAngle()), 0, 0)
        c.fillStyle = "#000000"
        //c.fillRect(-50,-50,100,100)
        c.drawImage(bobross_ref.current!, -100, -100, 200, 200)
    }

    return (
        <div className="mainContent">
            <Link to="/">Back to main page</Link>
            <h1>Actually rotating text in MS Paint</h1>
            <p>The classic meme is that it is impossible to rotate text in Microsoft Paint. Outside of flipping and 90 degree rotations, this seems to be true. However, here I will prove that statement wrong using math.</p>
            <h2>How to do it (explanation why is further down)</h2>
            <p>Let's start by trying to add rotated text to this guy's stock photo sign below. I'm going to guess that we need to rotate it about 25 degrees clockwise. The plan is to rotate the whole image, place the text with no rotation, and rotate it back.</p>
            <img className="step" style={smallimgstyle} src={stockphotosign} />
            <p>First, do a horizontal skew on the image by the ultimate amount you want to rotate. 25 degrees in this case.</p>
            <img className="step" style={medimgstyle} src={step1} />
            <p>Now this step is slightly more complicated. Set the width to the original width of the image multiplied by the cosine of the angle. Set the height to the original height <i>divided</i> by the cosine of the angle.
             This step is really only to scale the width by the cosine and height by the secant of the angle. The reason we don't scale by percent is that Microsoft Paint only lets you scale by integer percents so precision is lost.
             Since this can be confusing, I've included a small helper below to calculate the new width and height of an image.</p>
            <p>Original width: <input defaultValue={1000} onChange={onTextFieldChange} ref={original_width_field_ref} type="number" id="widthfield" min="0" max="10000" /></p>
            <p>Original height: <input defaultValue={600} onChange={onTextFieldChange} ref={original_height_field_ref} type="number" id="heightfield" min="0" max="10000" /></p>
            <p>Angle: <input defaultValue={0} onChange={onTextFieldChange} ref={angle_field_ref} type="number" id="anglefield" min="-89" max="89" /></p>
            <br />
            <p>{calcWidthText}</p>
            <p>{calcHeightText}</p>
            <img className="step" style={medimgstyle} src={step2}></img>
            <p>This final step is easier than before. Just do a vertical scale by the <i>negative</i> angle of rotation.</p>
            <img className="step" style={medimgstyle} src={step3}></img>
            <p>Now put the text on:</p>
            <img className="step" style={smallimgstyle} src={step4}></img>
            <p>And repeat these instructions but in reverse to get the final result:</p>
            <img className="step" style={smallimgstyle} src={finalresult}></img>
            <p>Now for a few caveats. If your image is too large or too far from being a square, Microsoft Paint sometimes splices the image in a bizarre way when performing skews. Either resize or crop the image back to a smaller size or more square aspect ratio.
                 Also, when rotating by an angle close to 90, such as 85 degrees, the extreme skewing will tend to lead to poor results. If you wish to rotate by such an angle, use the built-in feature to rotate first by 90 degrees and then rotate -5 degrees with this process.
            </p>
            <h2>Why it works</h2>
            <p>Since matrices can also represent linear transformations, rotations can be written in terms of matrix multiplication. While a rotation cannot be represented in Microsoft Paint,
                 the program does have support for shearing and scaling. So, if a rotation matrix can be broken down into a bunch of shears and scales, then in theory MS Paint would be able to support rotating text.
            </p>
            <p>Here is how a rotation can be represented as a matrix:</p>
            <Tex2SVG latex="\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}" />
            <p>In terms of linear transformations, the unit vector in the x direction gets mapped to the first column and the unit vector in the y direction gets mapped to the second column. 
                If that doesn't mean much to you, then try watching <a href="https://www.youtube.com/watch?v=fNk_zzaMoSs&list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab">the first three videos of 3blue1brown's essence of linear algebra series on YouTube.</a>
                 If I tried to explain how matrices are linear transformations, this would turn into a bad copy of his videos.
            </p>
            <p>Now to try decomposing the rotation into a multiplication of triangular matrices. Since this matrix is only 2x2, it's a relatively straightforward process. 
                To the second row, add the first row multiplied by $-\tan\theta$ to eliminate the number in the lower left corner:</p>
            <Tex2SVG latex="\begin{bmatrix} 1 & 0 \\ -\tan\theta & 1 \end{bmatrix}\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix} = \begin{bmatrix} 1\cdot\cos\theta + 0\cdot\sin\theta & 1\cdot(-\sin\theta) + 0\cdot\cos\theta \\ -\tan\theta\cdot\cos\theta + 1\cdot\sin\theta & (-\tan\theta)\cdot(-\sin\theta) + 1\cdot\cos\theta \end{bmatrix}" />
            <Tex2SVG latex=" = \begin{bmatrix} \cos\theta & -\sin\theta \\ 0 & \sec\theta \end{bmatrix}" />
            <p>And the matrix is factored. It can be written as follows:</p>
            <Tex2SVG latex="\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}= \begin{bmatrix} 1 & 0 \\ \tan\theta & 1 \end{bmatrix}\begin{bmatrix} \cos\theta & -\sin\theta \\ 0 & \sec\theta \end{bmatrix}" />
            <p>However, MS Paint can only do shearing and scaling, so we have to break up the right-hand matrix. But this is only as hard as factoring out a diagonal matrix from it.</p>
            <Tex2SVG latex="\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}= \begin{bmatrix} 1 & 0 \\ \tan\theta & 1 \end{bmatrix}\begin{bmatrix} \cos\theta & 0 \\ 0 & \sec\theta \end{bmatrix}\begin{bmatrix}1 & -\tan\theta \\ 0 & 1\end{bmatrix}" />
            <p>The matrices with tangents in them happen to be the exact same transformation that MS Paint does when it performs a skew by a certain angle.
                 So, reading the matrices right to left, to rotate an image, first perform a horizontal skew by the negative angle, then scale the x and y by the cosine and secant of the angle,
                  and then perform vertical skew by the desired angle.
            </p>
            <p>This small program below demonstrates what exactly is going on with the math. Drag the slider to visualize each step of the transformation.</p>
            <Canvas contextType='2d' renderFunc={draw} width={640} height={480} />
            <input ref={slider_ref} type="range" min="0" defaultValue="0" max="999" step="1" className="slider" id="range1" />
            <p style={centerstyle}>Angle: <input ref={second_angle_field_ref} type="number" defaultValue="30" min="-180" max="180" id="angle1" /></p>
            <img style={invis} src={bobrossimg} ref={bobross_ref}/>
        </div>
    );
}

export default MsPaintMatrix;