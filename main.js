const canvas = document.getElementById('game-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL is not supported in your browser.');
}

// Set up shaders and program
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Set up attributes and uniforms
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

// Set up buffers for cat and food
const catVertices = new Float32Array([
    0.0, 0.0,
    -0.1, -0.2,
    0.1, -0.2
]);

const foodVertices = new Float32Array([
    0.0, 0.0,
    -0.05, -0.05,
    0.05, -0.05
]);

const catBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, catBuffer);
gl.bufferData(gl.ARRAY_BUFFER, catVertices, gl.STATIC_DRAW);

const foodBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, foodBuffer);
gl.bufferData(gl.ARRAY_BUFFER, foodVertices, gl.STATIC_DRAW);

// Set up rendering loop
function drawCat(x, y) {
    gl.bindBuffer(gl.ARRAY_BUFFER, catBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.uniform4fv(colorUniformLocation, [0.2, 0.5, 0.2, 1.0]);
    
    const translationMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        x, y, 0.0, 1.0
    ]);

    const translationMatrixLocation = gl.getUniformLocation(program, 'u_translation');
    gl.uniformMatrix4fv(translationMatrixLocation, false, translationMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawFood(x, y) {
    gl.bindBuffer(gl.ARRAY_BUFFER, foodBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.uniform4fv(colorUniformLocation, [0.8, 0.2, 0.2, 1.0]);

    const translationMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        x, y, 0.0, 1.0
    ]);

    const translationMatrixLocation = gl.getUniformLocation(program, 'u_translation');
    gl.uniformMatrix4fv(translationMatrixLocation, false, translationMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function clearCanvas() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

let catX = 0;
let catY = 0;

function gameLoop() {
    clearCanvas();
    drawCat(catX, catY);
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Function to randomly update the cat's position
function roamCat() {
    const maxX = 1.0;
    const minX = -1.0;
    const randomX = Math.random() * (maxX - minX) + minX;

    catX = randomX;
}

// Roam the cat initially
roamCat();

// ...

function gameLoop() {
    clearCanvas();
    drawCat(catX, catY);
    requestAnimationFrame(gameLoop);

    // Roam the cat periodically
    if (Math.random() < 0.01) { // Adjust the roaming frequency as needed
        roamCat();
    }
}

// Event listener for feeding the cat
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Check if the click is near the cat
    if (
        mouseX >= catX - 0.2 &&
        mouseX <= catX + 0.2 &&
        mouseY >= catY - 0.2 &&
        mouseY <= catY + 0.2
    ) {
        // Feed the cat
        catX += 0.1;
    } else {
        // Create food at the clicked position
        drawFood((mouseX / canvas.width) * 2 - 1, -(mouseY / canvas.height) * 2 + 1);
    }
});
