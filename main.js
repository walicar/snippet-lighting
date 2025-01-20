import { mat4 } from "gl-matrix";

const root = document.getElementById("snippet-1");

// plane vertices
const planeVertData = [
    // bottom right
    1.0, -1.0, 0.0,
    // bottom left
    -1.0, -1.0, 0.0,
    // top left
    -1.0, 1.0, 0.0,
    // top right
    1.0, 1.0, 0.0,
]

// plane shaders
const planeVertSrc = `#verision 300 es
precision mediump float;
in vec3 a_pos;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_proj;

void main() {
    gl_Position = u_proj * u_view * u_model * vec4(a_pos, 1.0);
}
`;

const planeFragSrc = `#version 300 es
precision mediump float;

void main() {
    outColor = vec4(1,0,0,1);
}
`;

function main() {
    // make program and compile shaders
    const canvas = document.createElement("canvas");
    root.appendChild(canvas);
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        canvas.textContent = "WebGL is not supported";
        return;
    }

    // make program and compile shaders
    const planeVertShader = createShader(gl, gl.VERTEX_SHADER, planeVertSrc);
    const planeFragShader = createShader(gl, gl.FRAGMENT_SHADER, planeFragSrc);
    const planeProgram = createProgram(gl, planeVertShader, planeFragShader);

    // make VBOs, and VAOs
    const planeVao = gl.createVertexArray();
    gl.bindVertexArray(planeVao);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planeVertData), gl.STATIC_DRAW);

    let posAttribLoc = gl.getAttribLocation(planeProgram, "a_pos");
    gl.enableVertexAttribArray(posAttribLoc);
    gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 3 * 4, 0);

    const modelUniformLocPlane = gl.getUniformLocation(planeProgram, "u_model");
    const viewUniformLocPlane = gl.getUniformLocation(planeProgram, "u_view");
    const projUniformLocPlane = gl.getUniformLocation(planeProgram, "u_proj");

    // start drawing
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(planeProgram);

    let model = mat4.create();
    let view = mat4.create();
    mat4.lookAt(view, [1,3,0], [0,0,0], [0,1,0]);

    let proj = mat4.create();
    mat4.perspective(proj, Math.PI/4, canvas.width/canvas.height, 0.1, 100);

    function loop() {
        // draw plane
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindVertexArray(planeVao);
        gl.useProgram(planeProgram);

        gl.uniformMatrix4v(modelUniformLocPlane, model);
        gl.uniformMatrix4v(viewUniformLocPlane, view);
        gl.uniformMatrix4v(projUniformLocPlane, proj);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        requestAnimationFrame(loop);
    }
    loop();
};

function makePath() {};

// utils
function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertShader, fragShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}