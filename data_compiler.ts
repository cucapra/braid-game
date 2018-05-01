import { mat4, vec3 } from 'gl-matrix';
import * as fs from 'fs';
import { EOL } from 'os';
import * as util from 'util';
import * as path from 'path';
import * as minimist from 'minimist';

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

interface Trigger {
    name: string;
    filename: string;
    condition: string;
    action: string;
}

interface GameObject {
    name: string;
    position: Array<number>; // length = 3
    local_transform: Transform;
    render_obj: RenderObject;
    collider: Collider;
    lights: Array<Light>;
    triggers: Array<Trigger>;
}

interface Room {
    name: string;
    lights: Array<Light>;
    objects: Array<GameObject>;
    size: Array<number>; // length = 3
    texture: string;
    start_position: Array<number>; // length = 2
    start_direction: Array<number>; // length = 3
}

type Inventory = string;

interface Player {
    name: string;
    collider: Collider;
    inventories: Array<Inventory>;
    height: number;
    render_obj: RenderObject;
    transform: Transform;
}

interface Game {
    starting_room: string;
    rooms: Array<Room>;
    player: Player;
}

const newline = EOL;

const format_num = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1 }).format;

const triggers_map = new Map<string, Array<Trigger>>();

function create_tuple(l: Array<string>) {
    return `(${l.join(', ')})`;
}

function create_newline_tuple(l: Array<string>) {
    return `(${newline}${l.join(', ' + newline)}${newline})`;
}

function compile_vec(v: Array<number>) {
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
    return `(${compile_vec(light.color)}, ${compile_vec(light.position)}, ${format_num(light.intensity)})`;
}

function compile_transform(trans: Transform) {
    const t = `mat4.translate(mat4(), mat4(), ${compile_vec(trans.translation)})`;
    const rX = `mat4.rotateX(mat4(), mat4(), ${format_num(trans.rotationX)})`;
    const rY = `mat4.rotateY(mat4(), mat4(), ${format_num(trans.rotationY)})`;
    const rZ = `mat4.rotateZ(mat4(), mat4(), ${format_num(trans.rotationZ)})`;
    const s = `mat4.scale(mat4(), mat4(), ${compile_vec(trans.scale)})`;
    return create_newline_tuple([t, rX, rY, rZ, s]);
}

function compile_render_object(obj: RenderObject) {
    return `(load_obj("${obj.mesh}"), load_texture("${obj.texture}"), "${obj.shader}")`;
}

function compile_collider(c: Collider) {
    return create_tuple([`"${c.name}"`, compile_vec(c.param), compile_transform(c.transform)]);
}

function compile_object(o: GameObject) {
    const name = `"${o.name}"`;
    const position = compile_vec(o.position);
    const l_trans = compile_transform(o.local_transform);
    const r_obj = compile_render_object(o.render_obj);
    const collider = compile_collider(o.collider);
    const lights = `array{Light}${create_newline_tuple(o.lights.map(compile_light))}`;
    const triggers = `__triggers_${o.name}`;
    triggers_map.set(triggers, o.triggers);
    const l = [name, position, l_trans, r_obj, collider, lights, triggers];
    return create_newline_tuple(l);
}

function compile_room(r: Room) {
    const name = `"${r.name}"`;
    const lights = `array{Light}${create_newline_tuple(r.lights.map(compile_light))}`;
    const objects = `array{Object}${create_newline_tuple(r.objects.map(compile_object))}`;
    const size = compile_vec(r.size);
    const texture = `load_texture("${r.texture}")`;
    const sp = compile_vec(r.start_position);
    const sd = compile_vec(r.start_direction);
    return create_newline_tuple([name, lights, objects, size, texture, sp, sd]);
}

function compile_player(p: Player) {
    const name = `"${p.name}"`;
    const collider = compile_collider(p.collider);
    const invs = `array{Inventory}${create_tuple(p.inventories.map(e => `"${e}"`))}`;
    const height = format_num(p.height);
    const ro = compile_render_object(p.render_obj);
    const trans = compile_transform(p.transform);
    return create_newline_tuple([name, collider, invs, height, ro, trans]);
}

function compile_game(g: Game) {
    return create_newline_tuple([`"${g.starting_room}"`, `array{Room}${create_newline_tuple(g.rooms.map(compile_room))}`, compile_player(g.player)]);
}

function compile_trigger(t: Trigger) {
    return create_tuple([`"${t.name}"`, t.condition, t.action]);
}

function compile(input: string, output?: string) {
    const data_dir = path.dirname(input) + '/';
    const filename = path.basename(input);
    const readFile = util.promisify(fs.readFile);
    const decl: string[] = [];
    const init: string[] = [];
    const code: string[] = [];
    const promises: Promise<void>[] = [];
    const compile_data = readFile(data_dir + filename).then(e => {
        return compile_game(JSON.parse(e.toString()));
    }).then(data => {
        triggers_map.forEach((triggers, name) => {
            decl.push(`var ${name} = array{Trigger}();`);
            triggers.forEach(trigger => {
                const p = readFile(data_dir + trigger.filename).then(data => {
                    code.push(data.toString());
                    init.push(`push(${name}, ${compile_trigger(trigger)});`);
                }).catch(err => {
                    throw new Error(err);
                });
                promises.push(p);
            });
        });
        return data;
    }).then(data => Promise.all(promises).then(() => {
        return [
            [decl.join(newline), `var __game_init = ${data};`].join(newline),
            code + newline + init
        ];
    }));
    Promise.all([compile_data, readFile("game_preamble.braid"), readFile("data_accessor.braid")])
    .then(e => {
        const [[game, trigger], preamble, data] = e;
        const writeFile = util.promisify(fs.writeFile);
        const outputFile = output ? output : `${data_dir}${path.parse(filename).name}.braid`;
        const content = [preamble, game, data, trigger].join(newline + newline) + newline;
        writeFile(outputFile, content);
    });
}

async function main() {
    let args = minimist(process.argv.slice(2), {
        string: ['o'],
        boolean: ['h']
    });
    let filenames: string[] = args._;
    if (args['h'] || filenames.length !== 1) {
        console.log(`Usage: ${process.argv[1]} <filename> [-o <filename>]`);
        process.exit(0);
    }
    compile(filenames[0], args['o']);
}
main();