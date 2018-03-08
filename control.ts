export class Control {
    controls: { [control: string]: boolean };

    constructor() {
        this.controls = { "up": false, "down": false, "left": false, "right": false, "rleft": false, "rright": false };
    }

    public update(dir: string, pressed: boolean) {
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

    public isControlOn(dir: string) {
      return this.controls[dir] === true;
    }

    register = (dir: string, pressed: boolean) => {
        this.update(dir, pressed);
    }

    control_names = ["up", "down", "left", "right", "rleft", "rright"];

    isOn = (dir: string) => {
      return this.isControlOn(dir);
    }

}