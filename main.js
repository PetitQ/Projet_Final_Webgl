function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

var canvas;
var gl;
var program;

var attribPos;
var attribColor;
var uniformPerspectiveMat;
var uniformTranslationMat;
var uniformRotationMat;
var uniformScaleMat;

var buffers = [],
    vertexPositions = [],
    vertexColors = [];

var translationValues = {x: 0, y: 0, z: 0};
var rotationValues = {x: 0, y: 0, z: 0};
var zoom = 0.8;
var perspective = 75;
var cubeColor, altCubeColor;

var xTSlider;
var yTSlider;
var zTSlider;
var xRSlider;
var yRSlider;
var zSlider;
var ZoomSlider;
var PerspectiveSlider;


function initContext() {
    canvas = document.getElementById('dawin-webgl');
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('ERREUR : Échec du chargement du contexte');
        return;
    }
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
}

function setCanvasResolution() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function initShaders() {
    var vertexShaderSource = loadText("vertex.glsl");
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);

    var fragmentShaderSource = loadText("fragment.glsl");
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);
}

function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribColor = gl.getAttribLocation(program, "vertexColor");

    uniformPerspectiveMat = gl.getUniformLocation(program, "perspective");
    uniformTranslationMat = gl.getUniformLocation(program, "translation");
    uniformRotationMat = gl.getUniformLocation(program, "rotation");
    uniformScaleMat = gl.getUniformLocation(program, "scale");
}

function initPerspective() {
    setCanvasResolution();

    var perspectiveMat = mat4.create();

    var fieldOfView = perspective * Math.PI / 180;
    var aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(perspectiveMat, fieldOfView, aspect, 0.1, 100.0);

    gl.uniformMatrix4fv(uniformPerspectiveMat, false, perspectiveMat);
}

function setCube() {
    vertexPositions = [

        -1.0, -1.0,  1.0, 1.0,  1.0,  1.0, 1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0, 1.0,  1.0,  1.0, -1.0,  1.0,  1.0,

        -1.0, -1.0, -1.0, 1.0,  1.0, -1.0, -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0,  1.0, -1.0, 1.0, -1.0, -1.0,

        -1.0,  1.0, -1.0, 1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0, 1.0,  1.0,  1.0, 1.0,  1.0, -1.0,
 
        -1.0, -1.0, -1.0, 1.0, -1.0,  1.0, 1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
    
        1.0, -1.0, -1.0, 1.0,  1.0,  1.0, 1.0,  1.0, -1.0,
        1.0, -1.0, -1.0, 1.0,  1.0,  1.0, 1.0, -1.0,  1.0,
    
        -1.0, -1.0, -1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
    ];

    vertexColors = [
        Array(6).fill([0.0, 0.87, 0.56]).flat(),     
        Array(6).fill([0.34, 0.99, 0.0]).flat(),     
        Array(6).fill([0.95, 0.95, 0.95]).flat(),  
        Array(6).fill([0.40, 0.47, 0.93]).flat(),     
        Array(6).fill([1.0, 0.95, 0.04]).flat(),     
        Array(6).fill([1.0, 0.65, 0.75]).flat(),   
    ].flat();
}

function initBuffers() {
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    buffers["color"] = colorBuffer;

    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = posBuffer;
}

function initInputs() {
    xTSlider = document.getElementById('xTSlider');
    xTSlider.addEventListener('input', function () {
        translationValues.x = this.value;
    });

    yTSlider = document.getElementById('yTSlider');
    yTSlider.addEventListener('input', function () {
        translationValues.y = this.value;
    });

    zTSlider = document.getElementById('zTSlider');
    zTSlider.addEventListener('input', function () {
        translationValues.z = this.value;
    });

    xRSlider = document.getElementById('xRSlider');
    xRSlider.addEventListener('input', function () {
        rotationValues.x = this.value;
    });

    yRSlider = document.getElementById('yRSlider');
    yRSlider.addEventListener('input', function () {
        rotationValues.y = this.value;
    });

    zRSlider = document.getElementById('zRSlider');
    zRSlider.addEventListener('input', function () {
        rotationValues.z = this.value;
    });

    ZoomSlider = document.getElementById('ZoomSlider');
    ZoomSlider.addEventListener('input', function () {
        zoom = this.value;
    });

    PerspectiveSlider = document.getElementById('PerspectiveSlider');
    PerspectiveSlider.addEventListener('input', function () {
        perspective = this.value;
        initPerspective();
    });
}



function ChargeTransfo() {
    var rotationMat = mat4.create();
    mat4.rotateX(rotationMat, rotationMat, -rotationValues.x);
    mat4.rotateY(rotationMat, rotationMat, -rotationValues.y);
    mat4.rotateZ(rotationMat, rotationMat, -rotationValues.z);
    gl.uniformMatrix4fv(uniformRotationMat, false, rotationMat);

    var translationMat = mat4.create();
    var translationVec = vec3.fromValues(translationValues.x, translationValues.y, translationValues.z - 5);
    mat4.fromTranslation(translationMat, translationVec);
    gl.uniformMatrix4fv(uniformTranslationMat, false, translationMat);

    var scaleMat = mat4.create();
    var scaleVec = vec3.fromValues(zoom, zoom, zoom, 1);
    mat4.fromScaling(scaleMat, scaleVec);
    gl.uniformMatrix4fv(uniformScaleMat, false, scaleMat);
}

function draw() {
    ChargeTransfo();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositions.length / 3);

    requestAnimationFrame(draw);
}

function main() {
    initContext();
    initShaders();
    initAttributes();
    initPerspective();

    setCube();
    initBuffers();
    initInputs();
   
    draw();

    window.addEventListener('resize', function() {
        initPerspective();
    });
}