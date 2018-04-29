import { mat4, vec3 } from 'gl-matrix';
// hacks that I will forgot why it worked:
// json files are treated as modules and loaded using imports
// then parsed into game data

declare function require(name: string): any;

interface Light {
    color: Array<number>; // length = 3
    position: Array<number>; // length = 3
    intensity: number;
}

interface Transform {
    translation: Array<number>; // length = 4
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    scale: Array<number>; // length = 4
}

interface RenderObject {
    mesh: string;
    texture: string;
    shader: string;
}

interface Collider {
    name: string;
    param: Array<number>; // length = 2
    transform: Transform;
}

const format_num = new Intl.NumberFormat('en-US', {minimumFractionDigits: 1}).format;

function parse_vec(v: Array<number>) {
    if (v.length === 4) {
        return `vec4(${v.map(format_num).join(', ')})`;
    } else if (v.length === 3) {
        return `vec3(${v.map(format_num).join(', ')})`;
    } else if (v.length === 2) {
        return `vec2(${v.map(format_num).join(', ')})`;
    } else {
        throw new Error("cannot parse this vector");
    }
}

function compile_light(light: Light) {
    return `(${parse_vec(light.color)}, ${parse_vec(light.position)}, ${format_num(light.intensity)})`;
}

function compile_transform(trans: Transform) {
    const t = `mat4.translate(mat4(), mat4(), ${parse_vec(trans.translation)})`;
    const rX = `mat4.rotateX(mat4(), mat4(), ${format_num(trans.rotationX)})`;
    const rY = `mat4.rotateY(mat4(), mat4(), ${format_num(trans.rotationY)})`;
    const rZ = `mat4.rotateZ(mat4(), mat4(), ${format_num(trans.rotationZ)})`;
    const s = `mat4.scale(mat4(), mat4(), ${parse_vec(trans.scale)})`;
    return `(${t}, ${rX}, ${rY}, ${rZ}, ${s})`;
}

function compile_render_object(obj: RenderObject) {
    return `(load_obj(${obj.mesh}), load_texture(${obj.texture}), "${obj.shader}")`;
}

function compile_collider(c: Collider) {
    return `("${c.name}", ${parse_vec(c.param)}, ${compile_transform(c.transform)})`;
}

export function compile(filename: string) {
    let data = require("./data/" + filename);
    const start_room: String = data.start_room;
    return start_room;
}

console.log(123);
console.log(compile("test.json"));