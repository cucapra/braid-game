import { mat4, vec3 } from 'gl-matrix';

export class Camera {
    // direction: E:0, N:1, W:2, S:3
    e: vec3; // start eye position
    d: number; // start eye direction, in radian
    Mper: mat4;
    Mobjview: mat4;// update when Md and Me change
    MfixedObjview: mat4;
    targetE: vec3;
    targetD: number;
    eFrame: number;
    dFrame: number;
    readonly ROTATE: number = Math.PI / 2;
    readonly eps: number = 0.05;
    readonly frameCap:number = 20;
    readonly directions:Array<vec3> = [
        vec3.fromValues(1, 0, 0),
        vec3.fromValues(0, 1, 0),
        vec3.fromValues(-1, 0, 0),
        vec3.fromValues(0, -1, 0),
    ];
    readonly up: vec3 = vec3.fromValues(0, 0, 1);
    
    constructor () {
        // direction: E:0, N:1, W:2, S:3
        this.e = vec3.create(); // start eye position
        this.d = 0, // start eye direction, in radian
        this.Mper = mat4.create();
        this.Mobjview = mat4.create();// update when Md and Me change
        this.MfixedObjview = mat4.create();
        this.targetE = vec3.create();
        this.targetD = 0;
        this.eFrame = 0;
        this.dFrame = 0;
    }

    private getFov() {
        return 15.0 * Math.PI / 180.0;
    }

    private getEyeHeight() {
        return 0.5;
    }
    // update camera e, direction
    // Camera related variables

    private posMod(x: number, y:number){
        return ((x%y) + y) % y;
    }

    public updateEye(dir: number) { //
        // add increment
        if (dir == 37) { // 'left'
            // add increment
            this.targetD = (this.targetD + 0.2)
            this.dFrame = this.frameCap;
        }

        if (dir == 38) { // 'up'
            let d = this.directions[this.posMod(this.targetD, 4)];
            vec3.add(this.targetE, this.targetE, d);
            this.eFrame = this.frameCap;
        }

        if (dir == 39) { // 'right'
            this.targetD = (this.targetD - 0.2);
            this.dFrame = this.frameCap;
        }

        if (dir == 40) { // 'down'
            let d = vec3.create();
            vec3.scale(d, this.directions[this.posMod(this.targetD, 4)], -1);
            vec3.add(this.targetE, this.targetE, d);
            this.eFrame = this.frameCap;
        }
    }

    public updateEyeMatrix(){
        this.moveEye();
        let angle = this.ROTATE * this.d;
        let east = vec3.fromValues(1, 0, 0);
        let dir = vec3.create();
        vec3.rotateZ(dir, east, dir, angle);
        // vec3.add(dir, vec3.fromValues(0,0,0.3),dir);
        mat4.lookAt(this.MfixedObjview, vec3.create(), dir, this.up);
        let eyePos = vec3.fromValues(0.5, 0.5, 0);
        vec3.add(eyePos, this.e, eyePos);
        vec3.add(dir, dir, eyePos);
        mat4.lookAt(this.Mobjview, eyePos, dir, this.up);
        mat4.perspective(this.Mper, this.getFov(), 4.0/3.0, 0.1, 100.0);
    }

    private moveEye(){
        // update current position, direction, and matrix
        let height = this.getEyeHeight();
        this.targetE[2] = height;
        this.e[2] = height;
        if (this.eFrame > 1){
            let diff = vec3.create();
            vec3.sub(diff, this.targetE, this.e);
            vec3.scale(diff, diff, 1.0 / this.eFrame);
            vec3.add(this.e, this.e, diff);
            this.eFrame -= 1;
        }else if (this.eFrame > 0){
            this.e[0] = this.targetE[0];
            this.e[1] = this.targetE[1];
            this.eFrame -= 1;
        }
        if (this.dFrame > 1){
            let diff = this.targetD - this.d;
            this.d += diff * (1.0 / this.dFrame);
            this.dFrame -= 1;
        }else if (this.dFrame > 0){
            this.d = this.targetD;
            this.dFrame -= 1;
        }
    }

    public initEye(){
        vec3.set(this.e, 0, -2, this.getEyeHeight());
        vec3.set(this.targetE, 0, -2, this.getEyeHeight());
    }

    public getView () {
        return this.Mobjview;
    }
}