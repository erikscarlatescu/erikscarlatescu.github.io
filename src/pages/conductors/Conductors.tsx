import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '../../util/Canvas';
import Vec2D from '../../util/Vector2D';

class Charge {
    pos: Vec2D;
    vel: Vec2D;
    charge: number;
    fixed: boolean;

    constructor(pos: Vec2D, charge: number, fixed: boolean) {
        this.charge = charge;
        this.pos = pos;
        this.vel = new Vec2D(0, 0);
        this.fixed = fixed;
    }

    render(c: CanvasRenderingContext2D): void {
        if (this.charge > 0) {
            c.fillStyle="#EE3300";
            c.beginPath();
            c.arc(this.pos.x,this.pos.y,3,0,2*Math.PI,false);
            c.fill();

            c.lineWidth = 1
            c.strokeStyle = "#FFFFFF"
            c.beginPath();
            c.moveTo(this.pos.x-2, this.pos.y)
            c.lineTo(this.pos.x+2, this.pos.y)
            c.moveTo(this.pos.x, this.pos.y-2)
            c.lineTo(this.pos.x, this.pos.y+2)
            c.stroke();
        }
        else {
            c.fillStyle="#0099EE";
            c.beginPath();
            c.arc(this.pos.x,this.pos.y,3,0,2*Math.PI,false);
            c.fill();

            c.lineWidth = 1
            c.strokeStyle = "#FFFFFF"
            c.beginPath();
            c.moveTo(this.pos.x-2, this.pos.y)
            c.lineTo(this.pos.x+2, this.pos.y)
            c.stroke();
        }
    }

    calc_accel(other_charge: Charge): Vec2D {
        //var k = 1
        var k = 0.5
        var r = other_charge.pos.sub(this.pos)
        //-2 for inverse, -3 for inverse square
        var accel =  - k * this.charge * other_charge.charge * r.len_n(-2)

        return r.mul(accel);
    }
}

let charges: Charge[] = [];
let conductor_radius: number = 200;

function draw(c: CanvasRenderingContext2D, width: number, height: number): void {
    c.fillStyle = "#222222";
    c.fillRect(0,0,width, height);

    c.lineWidth = 2
    c.strokeStyle = "#DDDD00"
    c.beginPath();
    c.arc(width*0.5, height*0.5, conductor_radius,0,2*Math.PI,false);
    c.stroke();

    let accels: Vec2D[] = []

    // finds total acceleration on each charge
    for (var i = 0; i < charges.length; i++) {
        let accel = new Vec2D(0,0)
        for (var j = 0; j < charges.length; j++) {
            if (i !== j) {
                accel = accel.add(charges[i].calc_accel(charges[j]))
            }
        }
        accels.push(accel)
    }

    // iterates through each charge and applies kinematics
    for (var i = 0; i < charges.length; i++) {
        if (charges[i].fixed)
            continue;

        charges[i].vel = charges[i].vel.add(accels[i])
        charges[i].pos = charges[i].pos.add(charges[i].vel)

        var centervec = new Vec2D(width*0.5, height*0.5)
        var r = charges[i].pos.sub(centervec)

        // collision detection against the edge of conductor
        if (r.len() > conductor_radius) {
            // cancels out velocity in direction of normal vector of the container
            // effectively results in electrons "sliding" against wall rather than getting stuck to it
            var n_vel_vec = r.mul(charges[i].vel.dot(r) * r.len_n(-2))
            charges[i].vel = charges[i].vel.sub(n_vel_vec.mul(1.9))
            let conductor_vec = r.mul(conductor_radius / r.len())
            charges[i].pos = centervec.add(conductor_vec)
        }
    }

    charges.forEach(function(arrayItem) {
        arrayItem.render(c);
    });
}

function init(width: number, height: number): void {
    charges = [
        //new Charge(new Vec2D(400,200),1, false),
        //new Charge(new Vec2D(300,300),-1, false),
        new Charge(new Vec2D(600,130), -100, true)
        //new Charge(new Vec2D(300,198),-1)
    ];

    for (var y = 0; y < height; y += 20) {
        for (var x = 0; x < width; x += 20) {
            if ((x-width/2) * (x-width/2) + (y-height/2)*(y-height/2) > conductor_radius*conductor_radius)
                continue;
            charges.push(new Charge(new Vec2D(x,y), 1, true))
        }
    }

    for (var y = 10; y < height; y += 20) {
        for (var x = 10; x < width; x += 20) {
            if ((x-width/2) * (x-width/2) + (y-height/2)*(y-height/2) > conductor_radius*conductor_radius)
                continue;
            charges.push(new Charge(new Vec2D(x,y), -1, false))
        }
    }
}

export const Conductors = () => {
    useEffect(() => {
        document.title = "Conductors";
        init(640, 480);
    });

    return (
        <div className="mainContent">
            <Link to="/">Back to main page</Link>
            <Canvas contextType='2d' renderFunc={draw} width={640} height={480} />
            <script src="conductors.js"></script>
            <p>While learning electrostatics for AP physics, my book made the claim that in an electrically neutral conductor, the electric field inside is zero and there is only a net charge on the surface.</p>
            <p>So, I decided to try to get some more intuition for this claim by simulating a conductor as seen above. The positive nuclei of atoms are fixed in place and their electrons are free to flow around.
                 I simply use Coulomb's law to calculate the attraction between every charge, and even with this many charges, it works well enough on a website. I fixed a single negative charge in place outside 
                 of the conductor with one hundred times the magnitude of charge compared to the individual particles in the conductor.
            </p>
            <p>I did make a slight modification to Coulomb's law. Basically, it seems that the charge only settles on the surface in 3 dimensions because the electric force obeys an inverse-square relationship with distance.
                 However, this is a 2 dimensional simulation, so to get the same behavior, an inverse-square law no longer works. Instead, I modified it to be only inverse.
            </p>
            <p>This is still somewhat low resolution as far as atoms and electrons in a conductor go, so the result doesn't seem to be very clearly visible. But still, it does seem to work pretty well just by looking at it 
               (which admittedly isn't a very rigorous metric). Some further changes I could make to pursue this further would be to rewrite it in C++ to get enough of a performance boost to allow a finer grid with more 
               nuclei and electrons to be simulated.
            </p>
        </div>
    );
}

export default Conductors;