'use strict'
let perlin = {
    vectors2d: [[0, 1], [1, 0], [-1, 0], [0, -1]],
    vectors3d: [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]],
    gradients2d: {},
    gradients3d: {},

    init: function() {
        this.gradients2d = {};
        this.gradients3d = {};
    },

    getVector: function(x, y) {
        if (this.gradients2d[[x, y]]) {
            return this.gradients2d[[x, y]];
        }

        let r = Math.floor(Math.random() * this.vectors2d.length);
        let v = {'x': this.vectors2d[r][0], 'y': this.vectors2d[r][1]};
        this.gradients2d[[x, y]] = v;
        return v;
    },

    getVector: function(x, y, z) {
        z &= 255;
        if (this.gradients3d[[x, y, z]]) {
            return this.gradients3d[[x, y, z]];
        }

        let r = parseInt(Math.random() * this.vectors3d.length);
        let v = {'x': this.vectors3d[r][0], 'y': this.vectors3d[r][1], 'z': this.vectors3d[r][2]};
        this.gradients3d[[x, y, z]] = v;
        return v;
    },

    fade: function(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    },

    lerp: function(t, a, b) {
        return a + this.fade(t) * (b - a);
    },

    grad: function(x, y, vx, vy) {
        let d = {'x': x - vx, 'y': y - vy};
        let g = this.getVector(vx, vy);
        return d.x * g.x + d.y * g.y;
    },

    grad: function(x, y, z, vx, vy, vz) {
        let d = {'x': x, 'y': y, 'z': z};
        let g = this.getVector(vx, vy, vz);

        return d.x * g.x + d.y * g.y + d.z * g.z;
    },

    get: function(x, y) {
        let xf = Math.floor(x);
        let yf = Math.floor(y);

        let tx1 = this.grad(x, y, xf, yf);
        let tx2 = this.grad(x, y, xf + 1, yf);
        let bx1 = this.grad(x, y, xf, yf + 1);
        let bx2 = this.grad(x, y, xf + 1, yf + 1);

        let tx = this.lerp(x - xf, tx1, tx2);
        let bx = this.lerp(x - xf, bx1, bx2);
        let noise = this.lerp(y - yf, tx, bx);
        return;
    },

    get: function(x, y, z) {
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        let zf = Math.floor(z);

        x = x - xf;
        y = y - yf;
        z = z - zf;

        xf = xf & 255;
        yf = yf & 255;
        zf = zf & 255;

        let tx1 = this.grad(x, y, z, xf, yf, zf);
        let tx2 = this.grad(x - 1, y, z, xf + 1, yf, zf);
        let bx1 = this.grad(x, y - 1, z, xf, yf + 1, zf);
        let bx2 = this.grad(x - 1, y - 1, z, xf + 1, yf + 1, zf);

        let tz1 = this.grad(x, y, z - 1, xf, yf, zf + 1);
        let tz2 = this.grad(x - 1, y, z - 1, xf + 1, yf, zf + 1);
        let bz1 = this.grad(x, y - 1, z - 1, xf, yf + 1, zf + 1);
        let bz2 = this.grad(x - 1, y - 1, z - 1, xf + 1, yf + 1, zf + 1);

        let tx = this.lerp(x, tx1, tx2);
        let tz = this.lerp(x, tz1, tz2);
        let bx = this.lerp(x, bx1, bx2);
        let bz = this.lerp(x, bz1, bz2);

        let t = this.lerp(z, tx, tz);
        let b = this.lerp(z, bx, bz);

        let noise = this.lerp(y, t, b);
        return noise;
    }
};

perlin.init();