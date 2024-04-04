function makeTextureProgram() {
    const vertexShaderCode =
    `#version 300 es
    in vec2 a_position;
    in vec2 a_texcoord;

    uniform vec2 u_resolution;

    out vec2 v_texcoord;

    void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texcoord = a_texcoord;
    }
    `;
const fragmentShaderCode =
    `#version 300 es
    precision mediump float;
    in vec2 v_texcoord;
    uniform sampler2D u_texture;
    uniform float u_alpha;

    out vec4 outColor;

    float minus(float a, float b) {
        a -= b;
        if (a < 0.0) return 0.0;
        return a;
    }

    void main() {
        vec4 color = texture(u_texture, v_texcoord);
        float r = color.r;
        float g = color.g;
        float b = color.b;
        float a = color.a;

        r = minus(r, u_alpha);
        g = minus(g, u_alpha);
        b = minus(b, u_alpha);

        outColor = vec4(r, g, b, 1);
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
    gl.linkProgram(program);

    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    let posAttrib = gl.getAttribLocation(program, 'a_position');
    let texcoordAttrib = gl.getAttribLocation(program, 'a_texcoord');
    let resUniform = gl.getUniformLocation(program, 'u_resolution');
    let texUniform = gl.getUniformLocation(program, 'u_texture');
    let alphaUniform = gl.getUniformLocation(program, 'u_alpha');

    return {
        program,
        posAttrib,
        texcoordAttrib,
        resUniform,
        texUniform,
        alphaUniform
    }
}