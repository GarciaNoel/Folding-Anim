var vertexShaderText = [
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "attribute vec3 vertNormal;",
  "varying vec3 fragColor;",
  "varying vec3 fragNormal;",
  "varying vec3 fragPosition;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  "",
  "void main()",
  "{",
  "  fragColor = vertColor;",
  "  fragNormal = mat3(mWorld) * vertNormal;",
  "  fragPosition = vec3(mWorld * vec4(vertPosition, 1.0));",
  "  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
  "}",
].join("\n");

var fragmentShaderText = [
  "precision mediump float;",
  "",
  "varying vec3 fragColor;",
  "varying vec3 fragNormal;",
  "varying vec3 fragPosition;",
  "",
  "uniform vec3 lightDirectionA;",
  "uniform vec3 lightColorA;",
  "uniform vec3 lightDirectionB;",
  "uniform vec3 lightColorB;",
  "uniform vec3 ambientColor;",
  "",
  "void main()",
  "{",
  "  vec3 norm = normalize(fragNormal);",
  "  float diffA = max(dot(norm, -lightDirectionA), 0.0);",
  "  float diffB = max(dot(norm, -lightDirectionB), 0.0);",
  "  vec3 diffuseA = diffA * lightColorA;",
  "  vec3 diffuseB = diffB * lightColorB;",
  "  vec3 ambient = ambientColor;",
  "  vec3 result = (ambient + diffuseA + diffuseB) * fragColor;",
  "  gl_FragColor = vec4(result, 1.0);",
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
  // X, Y, Z,   R, G, B,   NX, NY, NZ
  -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 0, 1, 0,
  -1.0, 1.0,  1.0, 0.5, 0.5, 0.5, 0, 1, 0,
   1.0, 1.0,  1.0, 0.5, 0.5, 0.5, 0, 1, 0,
   1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 0, 1, 0,
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
  var normalAttribLocation = gl.getAttribLocation(program, "vertNormal");

  gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    9 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    9 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.vertexAttribPointer(
    normalAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    9 * Float32Array.BYTES_PER_ELEMENT,
    6 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);
  gl.enableVertexAttribArray(normalAttribLocation);

  gl.useProgram(program);

  var lightDirectionALocation = gl.getUniformLocation(program, "lightDirectionA");
  var lightColorALocation = gl.getUniformLocation(program, "lightColorA");
  var lightDirectionBLocation = gl.getUniformLocation(program, "lightDirectionB");
  var lightColorBLocation = gl.getUniformLocation(program, "lightColorB");
  var ambientColorLocation = gl.getUniformLocation(program, "ambientColor");

  gl.uniform3fv(lightDirectionALocation, [0.0, 0.0, 1.0]);
  gl.uniform3fv(lightColorALocation, [1.0, 1.0, 1.0]);
  gl.uniform3fv(lightDirectionBLocation, [0.0, 0.0, -1.0]);
  gl.uniform3fv(lightColorBLocation, [1.0, 1.0, 1.0]);
  gl.uniform3fv(ambientColorLocation, [0.2, 0.2, 0.2]);


  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -80], [0, 0, 0], [0, 1, 0]);
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

  var NUM_TRAILS = 16;
  var trails = [];
  for (var t = 0; t < NUM_TRAILS; t++) {
    trails.push({
      list_of_panels: [],
      worldMatrix: new Float32Array(16),
      nextMatrix: new Float32Array(16),
      angle: 0,
      animationTimer: 0,
      rand: 0,
    });
    mat4.identity(trails[t].worldMatrix);
    mat4.identity(trails[t].nextMatrix);
    trails[t].list_of_panels.push(trails[t].worldMatrix.slice());
    trails[t].rand = t % 4; // Start each trail on a different edge
  }

  var animationDuration = 5;
  var angleIncrement = (Math.PI / 2) / animationDuration;

  var loop = function () {
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    // Draw all panels for all trails
    for (var t = 0; t < NUM_TRAILS; t++) {
      var trail = trails[t];
      for (var i = 0; i < trail.list_of_panels.length; i++) {
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, trail.list_of_panels[i]);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
      }
    }

    // Animate each trail
    for (var t = 0; t < NUM_TRAILS; t++) {
      var trail = trails[t];
      trail.angle += angleIncrement;

      if (trail.animationTimer > animationDuration - 1) {
        trail.angle = (Math.PI / 2);
      }

      var edgeMidpoint = edgeMidpoints[trail.rand];
      mat4.copy(trail.worldMatrix, trail.nextMatrix);
      mat4.translate(trail.worldMatrix, trail.worldMatrix, edgeMidpoint);

      var axis = [0, 0, 1];
      if (trail.rand > 1) axis = [1, 0, 0];

      mat4.rotate(trail.worldMatrix, trail.worldMatrix, trail.angle, axis);
      mat4.translate(trail.worldMatrix, trail.worldMatrix, [-edgeMidpoint[0], -edgeMidpoint[1], -edgeMidpoint[2]]);

      if (trail.animationTimer >= animationDuration) {
        trail.list_of_panels.push(trail.worldMatrix.slice());
        mat4.copy(trail.nextMatrix, trail.worldMatrix);
        trail.rand = Math.floor(Math.random() * 4);
        trail.angle = 0;
        trail.animationTimer = 0;
      } else {
        trail.animationTimer += 1;
      }
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};
