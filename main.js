import { mat4 } from "gl-matrix";

function run() {

const root = document.getElementById("lighting-1");
root.style.position = "relative";
root.style.height = "500px";

const cubeVertData = [
    -1.0,  1.0,  1.0,   0, 1, 0,    // top face
    -1.0,  1.0, -1.0,   0, 1, 0,  
     1.0,  1.0, -1.0,   0, 1, 0,  
     1.0,  1.0,  1.0,   0, 1, 0,  
    -1.0, -1.0,  1.0,   0, -1, 0,   // bottom face
    -1.0, -1.0, -1.0,   0, -1, 0,  
     1.0, -1.0, -1.0,   0, -1, 0,  
     1.0, -1.0,  1.0,   0, -1, 0,  
    -1.0,  1.0,  1.0,   0, 0, 1,    // front face
     1.0,  1.0,  1.0,   0, 0, 1,  
     1.0, -1.0,  1.0,   0, 0, 1,  
    -1.0, -1.0,  1.0,   0, 0, 1,  
    -1.0,  1.0, -1.0,   0, 0, -1,   // back face
     1.0,  1.0, -1.0,   0, 0, -1,  
     1.0, -1.0, -1.0,   0, 0, -1,  
    -1.0, -1.0, -1.0,   0, 0, -1,  
    -1.0,  1.0, -1.0,  -1, 0, 0,    // left face
    -1.0,  1.0,  1.0,  -1, 0, 0,  
    -1.0, -1.0,  1.0,  -1, 0, 0,  
    -1.0, -1.0, -1.0,  -1, 0, 0,  
     1.0,  1.0, -1.0,   1, 0, 0,    // right face
     1.0,  1.0,  1.0,   1, 0, 0,  
     1.0, -1.0,  1.0,   1, 0, 0,  
     1.0, -1.0, -1.0,   1, 0, 0  
];

const cubeIndices = [
    0,  1,   2,  0,  2,  3,      // top face
    4,  5,   6,  4,  6,  7,      // bottom face
    8,  9,  10,  8, 10, 11,   // front face
    12, 13, 14, 12, 14, 15, // back face
    16, 17, 18, 16, 18, 19, // left face
    20, 21, 22, 20, 22, 23  // right face
];

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
    v_norm = transpose(inverse(mat3(u_model))) * a_norm;
}
`;

// u_lightVec is the reversed light direction
const fragSrc = `#version 300 es
precision mediump float;

in vec3 v_norm;

uniform vec3 u_lightVec;
uniform vec4 u_color;

out vec4 color;

void main() {
    float light = dot(normalize(v_norm), normalize(-u_lightVec));

    color = u_color;
    color.rgb *= light;
}
`;

function main() {
    // make program and compile shaders
    const { slider, lightSlider } = setupUI(root);
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
    const lightVecUniformLoc = gl.getUniformLocation(program, "u_lightVec");

    // make VBOs, and VAOs
    const cubeVao = gl.createVertexArray();
    gl.bindVertexArray(cubeVao);

    let vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertData), gl.STATIC_DRAW);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    let posAttribLoc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(posAttribLoc);
    gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 6 * 4, 0);
    
    let normAttribLoc = gl.getAttribLocation(program, "a_norm");
    gl.enableVertexAttribArray(normAttribLoc);
    gl.vertexAttribPointer(normAttribLoc, 3, gl.FLOAT, false, 6 * 4, 3 * 4);

    // start drawing
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    let scale = [1.0, 1.0, 1.5]
    let cubeModel = mat4.create();
    mat4.rotateX(cubeModel, cubeModel, Math.PI / 5);
    mat4.rotateZ(cubeModel, cubeModel, Math.PI / 5);
    mat4.scale(cubeModel, cubeModel, scale);

    let view = mat4.create();
    mat4.lookAt(view, [0, 0, 9], [0, 0, 0], [0, 1, 0]);

    let proj = mat4.create();
    mat4.perspective(proj, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

    const cubeColor = [0.0, 1.0, 0.0, 1.0];

    // avoid cumulative shift
    slider.addEventListener("input", () => {
        let newCubeModel = mat4.create();
        const angle = (slider.value / slider.max) * Math.PI * 2;
        mat4.rotate(newCubeModel, newCubeModel, angle, [0, 1, 0]);
        mat4.rotateX(newCubeModel, newCubeModel, Math.PI / 5);
        mat4.rotateZ(newCubeModel, newCubeModel, Math.PI / 5);
        mat4.scale(newCubeModel, newCubeModel, scale);
        cubeModel = newCubeModel
        draw();
    })

    let initialLightVec = [0, -1, -1];
    let lightVec = Array.from(initialLightVec);

    lightSlider.addEventListener("input", () => {
        const yDistance = (lightSlider.value / lightSlider.max) * 2;
        lightVec = Array.from(initialLightVec);
        lightVec[1] += yDistance
        draw();
    })

    function draw() {
        gl.clearColor(0, 0, 0, 0.5);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(viewUniformLoc, false, view);
        gl.uniformMatrix4fv(projUniformLoc, false, proj);
        gl.uniform3fv(lightVecUniformLoc, lightVec)

        // draw cube
        gl.bindVertexArray(cubeVao);
        gl.uniformMatrix4fv(modelUniformLoc, false, cubeModel);
        gl.uniform4fv(colorUniformLoc, cubeColor);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
    }
    draw();
};

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

function setupUI(root) {
    const slider = document.createElement("input");
    slider.type = "range";
    const samples = 50;
    slider.min = -samples;
    slider.max = samples;
    slider.value = 0;
    slider.style.position = "absolute";
    slider.style.zIndex = 1;
    root.appendChild(slider);

    const lightSlider = document.createElement("input");
    lightSlider.type = "range";
    lightSlider.min = -samples;
    lightSlider.max = samples;
    lightSlider.value = 0;
    lightSlider.style.position = "absolute";
    lightSlider.style.top = "50px";
    lightSlider.style.zIndex = 1;
    root.appendChild(lightSlider);

    return { slider: slider, lightSlider: lightSlider };
}

main();
}

run();