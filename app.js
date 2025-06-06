var vertexShaderText = [
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  "",
  "void main()",
  "{",
  "  fragColor = vertColor;",
  "  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
  "}",
].join("\n");

var fragmentShaderText = [
  "precision mediump float;",
  "",
  "varying vec3 fragColor;",
  "void main()",
  "{",
  "  gl_FragColor = vec4(fragColor, 1.0);",
  "}",
].join("\n");


var InitDemo = function () {
  console.log("This is working");

  var canvas = document.getElementById("game-surface");
  var gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling vertex shader!",
      gl.getShaderInfoLog(vertexShader)
    );
    return;
  }

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling fragment shader!",
      gl.getShaderInfoLog(fragmentShader)
    );
    return;
  }

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program!", gl.getProgramInfoLog(program));
    return;
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    return;
  }

  var boxVertices = [
    // X, Y, Z           R, G, B
    -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0,
    1.0, 0.5, 0.5, 0.5, 1.0, 1.0, -1.0, 0.5, 0.5, 0.5,
  ];

  var boxIndices = [
    0, 1, 2, 0, 2, 3,
  ];

  var boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  var boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(boxIndices),
    gl.STATIC_DRAW
  );

  var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttribLocation,
    3, 
    gl.FLOAT, 
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, 
    0 
  );
  gl.vertexAttribPointer(
    colorAttribLocation, 
    3,
    gl.FLOAT, 
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -40], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(
    projMatrix,
    glMatrix.toRadian(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000.0
  );

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  var list_of_panels = [];

  var angle = 0;

  var em0 = [-1, 1.0, 0.0];
  var em1 = [1, 1.0, 0.0];
  var em2 = [0.0, 1.0, 1.0];
  var em3 = [0.0, 1.0, 1.0];

  var edgeMidpoints = [em0, em1, em2, em3];

  animationTimer = 0;
  var animationDuration = 5;

  function rand_0_3() {
    return Math.floor(Math.random() * 4);
  }

  list_of_panels.push(worldMatrix.slice());

  var nextMatrix = new Float32Array(16);
  mat4.identity(nextMatrix);

  rand = rand_0_3();
  rand = 0;

  var angleIncrement = (Math.PI / 2) / animationDuration;

  var loop = function () {

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < list_of_panels.length; i++) {
      newmat = list_of_panels[i] 
      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, newmat);
      gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    angle += angleIncrement;
    
    if (animationTimer > animationDuration-1) {
      angle = (Math.PI / 2);
    }

    edgeMidpoint = edgeMidpoints[rand];

    mat4.copy(worldMatrix, nextMatrix);
    mat4.translate(worldMatrix, worldMatrix, edgeMidpoint);

    axis = [0, 0, 1];

    if (rand > 1) {
      axis = [1, 0, 0];
    }

    mat4.rotate(worldMatrix, worldMatrix, angle, axis); 
    mat4.translate(worldMatrix, worldMatrix, [-edgeMidpoint[0], -edgeMidpoint[1], -edgeMidpoint[2]]);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    
    if (animationTimer >= animationDuration) {
      list_of_panels.push(worldMatrix.slice());
      mat4.copy(nextMatrix, worldMatrix);
      rand = rand_0_3();
      angle = 0;
      animationTimer = 0;
    } else {
      animationTimer += 1;
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};
