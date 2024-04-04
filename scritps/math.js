function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: 255 * f(0), g: 255 * f(8), b: 255 * f(4) };
};

function sinLerp(value, x, y, period) {
    return Math.sin((x + y) / period) * value;
}

let gradient = {
    startColor: {r: 220, g: 36, b: 48, a: 255},
    endColor: {r: 123, g: 67, b: 151, a: 255},

    getColor: function(t) {
        return {
            r: this.lerp(t, this.startColor.r, this.endColor.r),
            g: this.lerp(t, this.startColor.g, this.endColor.g),
            b: this.lerp(t, this.startColor.b, this.endColor.b),
            a: this.lerp(t, this.startColor.a, this.endColor.a)
        }
    },

    lerp: function(t, a, b) {
        return Math.floor(a + t * (b - a));
    }
}

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    module() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    limit(number) {
        let m = this.module();
        if (m > number) {
            this.x = number * this.x / m;
            this.y = number * this.y / m;
        }
    }

    setModule(number) {
        let m = this.module();
        this.x = number * this.x / m;
        this.y = number * this.y / m;
    }

    add(vector) {
        if (typeof vector === 'object') {
            this.x += vector.x;
            this.y += vector.y;
        }
        if (typeof vector === 'number') {
            this.x += vector;
            this.y += vector;
        }
    }

    mult(number) {
        this.x *= number;
        this.y *= number;
    }

    copy() {
        return new Vector(this.x, this.y);
    }
}