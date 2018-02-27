import glrt from 'braid-glrt';
import { Assets, load_asset } from 'braid-glrt';
import braid_func from './render';
import { mat4,vec3 } from 'gl-matrix';
import { PerspCamera } from './camera';

function getCamera() {
    let eye = vec3.fromValues(20, 5, -10);
    let target = vec3.fromValues(0, 0, 0);
    let up = vec3.fromValues(0, 1, 0);
    let camera = new PerspCamera(eye, target, up, 0.01, 1000);
    return camera;
}
let camera = getCamera();

function example(canvas: HTMLCanvasElement, assets: Assets) {
  // Get the WebGL context.
  let gl = (canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext;

  // Load a Braid runtime object.
  let rt = glrt(gl, assets, (n) => {});

  // A projection matrix.
  let projection = mat4.create();
  (rt as any).projection = projection;
  let view = mat4.create();
  (rt as any).viewMatrix = view;
  // Get the compiled Braid code's render function.
  let braid_render = braid_func(rt);
  // The main render loop.
  function render() {
    // Draw on the whole canvas.
    let width = gl.drawingBufferWidth;
    let height = gl.drawingBufferHeight;
    gl.viewport(0, 0, width, height);
    camera.update();
    camera.getViewMatrix(view);
    camera.getProjMatrix(projection, width, height);
    // Rendering flags.
    gl.depthFunc(gl.LESS);
    gl.enable(gl.DEPTH_TEST);

    // Invoke the compiled Braid code.
    braid_render.proc.apply(void 0, braid_render.env);

    // Ask to be run again.
    window.requestAnimationFrame(render);
  }
  
  window.requestAnimationFrame(render);
}

function load_assets_and_run(canvas: HTMLCanvasElement, to_load: Array<string>) {
    let assets: Assets = {};
    let to_load_promise = to_load.map((r)=>{
        return load_asset(r).then((a)=> {assets[r]=a});
    });
    Promise.all(to_load_promise).then(() => example(canvas, assets));
}

document.addEventListener("DOMContentLoaded", () => {
  let canvas = document.getElementsByTagName("canvas")[0];
  console.log("done loading");
  load_assets_and_run(canvas, ["teapot.obj", "wood1.png", "skyBox.obj","posx.jpg", "posx.jpg","negx.jpg", "posy.jpg", 
  "negy.jpg", "posz.jpg", "negz.jpg"]);
});

window.onkeydown = (e) => {
  camera.control(e.key, true);  
};

window.onkeyup = (e) => {
  camera.control(e.key, false);
};
