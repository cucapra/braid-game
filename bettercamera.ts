import { mat4, vec3 } from 'gl-matrix';

export class PerspCamera {

    eye : vec3;
    target : vec3;
    up : vec3;
    near : number;
    far : number;

    readonly fov : number = Math.PI / 6;

    constructor(eye:vec3, target:vec3, up:vec3, near:number, far:number) {
        this.eye = vec3.clone(eye);
        this.target = vec3.clone(target);
        this.up = vec3.clone(up);
        this.near = near;
        this.far = far;
    }

    public getEye() { return this.eye; }

    public getTarget() { return this.target; }

    public getUp() { return this.up; }

    public getViewMatrix(out:mat4) {
        mat4.lookAt(out, this.eye, this.target, this.up);
    }

    public getProjMatrix(out:mat4, width:number, height:number) {
        mat4.perspective(out, this.fov, width/height, this.near, this.far);
    }

    public getViewProjMatrix(out:mat4, width:number, height:number) {
        this.getProjMatrix(out, width, height);
        let temp:mat4 = mat4.create();
        this.getViewMatrix(temp);
        mat4.mul(out, out, temp)
    }

    public zoom(delta: number) {
        let dir:vec3 = vec3.create();
        this.getLookAt(dir);
        let dist:number = vec3.distance(this.eye, this.target)*(1-delta);
        if (dist < this.near) {
            vec3.scaleAndAdd(this.eye, this.target, dir, -this.near);
        } else if (dist > this.far) {
        	vec3.scaleAndAdd(this.eye, this.target, dir, -this.far);
        } else {
            vec3.scaleAndAdd(this.eye, this.eye, dir, dist*delta);
        }
    }

    private translate(delta : vec3) {
        vec3.add(this.eye, this.eye, delta);
        vec3.add(this.target, this.target, delta);
    }

    //get the look direction
    private getLookAt(out:vec3) {
        vec3.sub(out, this.target, this.eye);
        vec3.normalize(out, out);
    }

    // moves eye and target along the look direction
    public dolly(distance:number){
        let dir:vec3 = vec3.create();
        this.getLookAt(dir);
        vec3.scale(dir, dir, distance);
        this.translate(dir);
    }

    // moves eye and target sideways to the look direction
    public slide(distance:number){
        let dir:vec3 = vec3.create();
        this.getLookAt(dir);
        let right:vec3 = vec3.create();
        vec3.cross(right, dir, this.up);
        vec3.normalize(right, right);
        vec3.scale(right, right, distance);
        this.translate(right);
    }

    // rotate the camera around up by [r] radians
    public rotate(r:number){
        let targetV:vec3 = vec3.create();
        vec3.sub(targetV, this.target, this.eye);
        let rot:mat4 = mat4.create();
        mat4.fromRotation(rot, r, this.up);
        vec3.transformMat4(targetV, targetV, rot);
        vec3.add(this.target, targetV, this.eye);
    }
    
    public control(dir:string) {
        console.log(dir);
        if (dir == 'a') { // 'left'
            this.slide(-0.002);
        }

        if (dir == 'w') { // 'up'
            this.dolly(0.01);
        }

        if (dir == 'd') { // 'right'
            this.slide(0.002);
        }

        if (dir == 's') { // 'down'
            this.dolly(-0.01);
        }
        
        if (dir == 'q') { // 'right'
            this.rotate(0.01);
        }

        if (dir == 'e') { // 'down'
            this.rotate(-0.01);
        }
    }
}