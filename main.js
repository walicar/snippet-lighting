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

const planeNormalData = [
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
]

// cube vertices
const cubeVertData = [ // 8 corners on a cube
    // upper half
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    // lower half
    -1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
]

const cubeIndices = [ // vertex order matters (winding)
    // top face
    0, 1, 2,
    0, 2, 3,
    // bottom face
    4, 5, 6,
    4, 6, 7,
    // front face
    0, 3, 7,
    0, 7, 4,
    // back face
    1, 5, 6,
    1, 6, 2,
    // left face
    0, 4, 5,
    0, 5, 1,
    // right face
    3, 2, 6,
    3, 6, 7
];

const cubeNormalData = [
    // top face
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    // bottom face
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    // front face
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    // back face
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    // left face
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    // right face
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
]

// shaders
const vertSrc = `#version 300 es
precision mediump float;

in vec3 a_pos;
in vec3 a_norm;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_proj;

out vec3 v_norm;

void main() {
    gl_Position = u_proj * u_view * u_model * vec4(a_pos, 1.0);
    v_norm = a_norm;
}
`;

const fragSrc = `#version 300 es
precision mediump float;

in vec3 v_norm;

uniform vec4 u_color;

out vec4 color;

void main() {
    color = u_color;
}
`;

function main() {
    // make program and compile shaders
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    root.appendChild(canvas);
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        canvas.textContent = "WebGL is not supported";
        return;
    }

    // make program and compile shaders
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    const program = createProgram(gl, vertShader, fragShader);

    const modelUniformLoc = gl.getUniformLocation(program, "u_model");
    const viewUniformLoc = gl.getUniformLocation(program, "u_view");
    const projUniformLoc = gl.getUniformLocation(program, "u_proj");
    const colorUniformLoc = gl.getUniformLocation(program, "u_color");

    // make VBOs, and VAOs
    // plane
    const planeVao = gl.createVertexArray();
    gl.bindVertexArray(planeVao);

    let vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planeVertData), gl.STATIC_DRAW);

    let posAttribLoc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(posAttribLoc);
    gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 3 * 4, 0);

    let normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planeNormalData), gl.STATIC_DRAW);

    let normAttribLoc = gl.getAttribLocation(program, "a_norm");
    gl.enableVertexAttribArray(normAttribLoc);
    gl.vertexAttribPointer(normAttribLoc, 3, gl.FLOAT, false, 3 * 4, 0);

    // cube
    const cubeVao = gl.createVertexArray();
    gl.bindVertexArray(cubeVao);

    vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertData), gl.STATIC_DRAW);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    posAttribLoc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(posAttribLoc);
    gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 3 * 4, 0);

    normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormalData), gl.STATIC_DRAW);

    normAttribLoc = gl.getAttribLocation(program, "a_norm");
    gl.enableVertexAttribArray(normAttribLoc);
    gl.vertexAttribPointer(normAttribLoc, 3, gl.FLOAT, false, 3 * 4, 0);

    // start drawing
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    let planeModel = mat4.create();
    let cubeModel = mat4.create();
    mat4.translate(cubeModel, cubeModel, [0, 0, 1]);
    mat4.rotateY(cubeModel, cubeModel, Math.PI / 5);
    mat4.scale(cubeModel, cubeModel, [0.5, 0.5, 0.5]);

    let view = mat4.create();
    mat4.lookAt(view, [0, 0, 9], [0, 0, 0], [0, 1, 0]);

    let proj = mat4.create();
    mat4.perspective(proj, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

    const planeColor = [1.0, 0.0, 0.0, 1.0];
    const cubeColor = [0.0, 1.0, 0.0, 1.0];

    function loop() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(viewUniformLoc, false, view);
        gl.uniformMatrix4fv(projUniformLoc, false, proj);

        // draw plane
        gl.bindVertexArray(planeVao);
        gl.uniformMatrix4fv(modelUniformLoc, false, planeModel);
        gl.uniform4fv(colorUniformLoc, planeColor);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // draw cube
        gl.bindVertexArray(cubeVao);
        gl.uniformMatrix4fv(modelUniformLoc, false, cubeModel);
        gl.uniform4fv(colorUniformLoc, cubeColor);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    }
    loop();
};

function makePath() { };

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

function getNormal(model) {
    // @todo
}

main();