import { mat4, vec3 } from 'gl-matrix';

export class PerspCamera {

    eye: vec3;
    target: vec3;
    up: vec3;
    near: number;
    far: number;
    dollyDist: number;
    slideDist: number;
    rotateRad: number;


    readonly fov: number = Math.PI / 4;
    controls: { [control: string]: boolean }

    constructor(eye: vec3, target: vec3, up: vec3, near: number, far: number) {
        this.eye = vec3.clone(eye);
        this.target = vec3.clone(target);
        this.up = vec3.clone(up);
        this.near = near;
        this.far = far;
        this.dollyDist = 0
        this.slideDist = 0
        this.rotateRad = 0
        this.controls = { "up": false, "down": false, "left": false, "right": false, "rleft": false, "rright": false }
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
        mat4.mul(out, out, temp)
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

    //get the look direction
    private getLookAt(out: vec3) {
        vec3.sub(out, this.target, this.eye);
        vec3.normalize(out, out);
    }

    // moves eye and target along the look direction
    public dolly(distance: number) {
        let dir: vec3 = vec3.create();
        this.getLookAt(dir);
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

    public tick() {
        this.dolly(this.dollyDist);
        this.slide(this.slideDist);
        this.rotate(this.rotateRad);
        this.dollyDist = 0;
        this.slideDist = 0;
        this.rotateRad = 0;
    }

    public update() {
        if (this.controls["left"]) { // 'left'
            this.slideDist += (-0.15);
        }

        if (this.controls["up"]) { // 'up'
            this.dollyDist += (0.15);
        }

        if (this.controls["right"]) { // 'right'
            this.slideDist += (0.15);
        }

        if (this.controls["down"]) { // 'down'
            this.dollyDist += (-0.15);
        }

        if (this.controls["rleft"]) { // 'rotate left'
            this.rotateRad += (0.01);
        }

        if (this.controls["rright"]) { // 'rotate right'
            this.rotateRad += (-0.01);
        }
        this.tick();
    }

    public control(dir: string, pressed: boolean) {
        if (dir == 'a') { // 'left'
            this.controls["left"] = pressed;
        }

        if (dir == 'w') { // 'up'
            this.controls["up"] = pressed;
        }

        if (dir == 'd') { // 'right'
            this.controls["right"] = pressed;
        }

        if (dir == 's') { // 'down'
            this.controls["down"] = pressed;
        }

        if (dir == 'q') { // 'rotate left'
            this.controls["rleft"] = pressed;
        }

        if (dir == 'e') { // 'rotate right'
            this.controls["rright"] = pressed;
        }
    }
}