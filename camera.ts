import { mat4, vec3 } from 'gl-matrix';

export class PerspCamera {

    eye: vec3;
    target: vec3;
    up: vec3;
    near: number;
    far: number;

    readonly fov: number = Math.PI / 4;
    readonly DOLLY_RATE = 0.15;
    readonly SLIDE_RATE = 0.15;
    readonly ROTATE_RATE = 0.01;
    controls: { [control: string]: boolean };

    constructor(eye: vec3, target: vec3, up: vec3, near: number, far: number) {
        this.eye = vec3.clone(eye);
        this.target = vec3.clone(target);
        this.up = vec3.clone(up);
        vec3.normalize(this.up, this.up);
        this.near = near;
        this.far = far;
        this.controls = { "up": false, "down": false, "left": false, "right": false, "rleft": false, "rright": false };
    }

    public getEye() { return this.eye; }

    public getTarget() { return this.target; }

    public getUp() { return this.up; }

    public getViewMatrix(out: mat4) {
        mat4.lookAt(out, this.eye, this.target, this.up);
    }

    public getProjMatrix(out: mat4, width: number, height: number) {
        mat4.perspective(out, this.fov, width / height, this.near, this.far);
    }

    public getViewProjMatrix(out: mat4, width: number, height: number) {
        this.getProjMatrix(out, width, height);
        let temp: mat4 = mat4.create();
        this.getViewMatrix(temp);
        mat4.mul(out, out, temp);
    }

    public zoom(delta: number) {
        let dir: vec3 = vec3.create();
        this.getLookAt(dir);
        let dist: number = vec3.distance(this.eye, this.target) * (1 - delta);
        if (dist < this.near) {
            vec3.scaleAndAdd(this.eye, this.target, dir, -this.near);
        } else if (dist > this.far) {
            vec3.scaleAndAdd(this.eye, this.target, dir, -this.far);
        } else {
            vec3.scaleAndAdd(this.eye, this.eye, dir, dist * delta);
        }
    }

    private translate(delta: vec3) {
        vec3.add(this.eye, this.eye, delta);
        vec3.add(this.target, this.target, delta);
    }

    // get the look direction
    private getLookAt(out: vec3) {
        vec3.sub(out, this.target, this.eye);
        vec3.normalize(out, out);
    }
    // get direction in the look direction but
    // perpendicular to the up vector
    private getMoveAt(out: vec3) {
        this.getLookAt(out);
        vec3.scaleAndAdd(out, out, this.up, -vec3.dot(out, this.up));
    }

    // moves eye and target along the look direction
    public dolly(distance: number) {
        let dir: vec3 = vec3.create();
        this.getMoveAt(dir);
        vec3.scale(dir, dir, distance);
        this.translate(dir);
    }

    // moves eye and target sideways to the look direction
    public slide(distance: number) {
        let dir: vec3 = vec3.create();
        this.getLookAt(dir);
        let right: vec3 = vec3.create();
        vec3.cross(right, dir, this.up);
        vec3.normalize(right, right);
        vec3.scale(right, right, distance);
        this.translate(right);
    }

    // rotate the camera around up by [r] radians
    public rotate(r: number) {
        let targetV: vec3 = vec3.create();
        vec3.sub(targetV, this.target, this.eye);
        let rot: mat4 = mat4.create();
        mat4.fromRotation(rot, r, this.up);
        vec3.transformMat4(targetV, targetV, rot);
        vec3.add(this.target, targetV, this.eye);
    }

    public simulateControl(sim: vec3, ctrl: string) {
      let eyeCopy = vec3.clone(this.eye);
      let tCopy = vec3.clone(this.target);
      this.update(ctrl);
      vec3.copy(sim, this.eye);
      vec3.copy(this.eye, eyeCopy);
      vec3.copy(this.target, tCopy);
    }

    public update(ctrl: string) {
      if (ctrl !== "") {
        console.log(ctrl);
      }
        if (ctrl === "left") { // 'left'
            this.slide(-this.DOLLY_RATE);
        }

        if (ctrl === "up") { // 'up'
            this.dolly(this.DOLLY_RATE);
        }

        if (ctrl === "right") { // 'right'
            this.slide(this.SLIDE_RATE);
        }

        if (ctrl === "down") { // 'down'
            this.dolly(-this.SLIDE_RATE);
        }

        if (ctrl === "rleft") { // 'rotate left'
            this.rotate(this.ROTATE_RATE);
        }

        if (ctrl === "rright") { // 'rotate right'
            this.rotate(-this.ROTATE_RATE);
        }
    }

    public control(dir: string, pressed: boolean) {
        if (dir === 'a') { // 'left'
            this.controls["left"] = pressed;
        }

        if (dir === 'w') { // 'up'
            this.controls["up"] = pressed;
        }

        if (dir === 'd') { // 'right'
            this.controls["right"] = pressed;
        }

        if (dir === 's') { // 'down'
            this.controls["down"] = pressed;
        }

        if (dir === 'q') { // 'rotate left'
            this.controls["rleft"] = pressed;
        }

        if (dir === 'e') { // 'rotate right'
            this.controls["rright"] = pressed;
        }
    }
    // Needed to make interop work.
    updateCam = (ctrl: string) => {
      return this.update(ctrl);
    }

    getViewM = (out: mat4) => {
      return this.getViewMatrix(out);
    }

    getProjM = (out: mat4, width: number, height: number) => {
      return this.getProjMatrix(out, width, height);
    }

    simCtrl = (sim: vec3, ctrl: string) => {
      this.simulateControl(sim, ctrl);
    }
}
