class Vec2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    len(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    len_n(n: number): number {
        return Math.pow(this.x*this.x + this.y*this.y, n*0.5)
    }

    add(v: Vec2D): Vec2D {
        return new Vec2D(this.x + v.x, this.y + v.y)
    }

    sub(v: Vec2D): Vec2D {
        return new Vec2D(this.x - v.x, this.y - v.y)
    }

    mul(s: number): Vec2D {
        return new Vec2D(this.x * s, this.y * s)
    }

    dot(v: Vec2D): number {
        return this.x*v.x + this.y*v.y
    }
}

export default Vec2D;