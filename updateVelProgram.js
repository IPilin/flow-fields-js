function makeUpdateVelProgram() {
    const vertexShaderCode =
        `#version 300 es
        in vec4 pos;
        in vec2 vel;

        uniform sampler2D flow;
        uniform float scale;

        out vec2 newVel;

        vec4 getAs1D(sampler2D tex, vec2 p, float s) {
            int x = int(p.x / s);
            int y = int(p.y / s);
            return texelFetch(tex, ivec2(x, y), 0);
        }
        
        vec2 setModule(vec2 a, float l) {
            float m = length(a);
            vec2 r = a;
            r.x = l * r.x / m;
            r.y = l * r.y / m;
            return r;
        }

        vec2 limit(vec2 a, float l) {
            float m = length(a);
            if (m > l) {
                vec2 r = a;
                r.x = l * r.x / m;
                r.y = l * r.y / m;
                return r;
            }
            return a;
        }
        
        void main() {
            vec4 flow = getAs1D(flow, pos.rg, scale);
            vec2 force = vec2(cos(flow.r), sin(flow.r));
            force = setModule(force, 1.0);
            newVel = limit(vel + force, 5.0);
        }
    `;
    const fragmentShaderCode =
        `#version 300 es
        precision mediump float;

    void main() {

    }
    `;

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
    }

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
    }

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.transformFeedbackVaryings(program, ['newVel'], gl.SEPARATE_ATTRIBS);
    gl.linkProgram(program);

    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    let posAttrib = gl.getAttribLocation(program, 'pos');
    let velAttrib = gl.getAttribLocation(program, 'vel');
    let texUniform = gl.getUniformLocation(program, 'flow');
    let scaleUniform = gl.getUniformLocation(program, 'scale');

    return {
        program,
        posAttrib,
        velAttrib,
        texUniform,
        scaleUniform
    }
}