import * as gd from "./game_data";
import { mat4, vec3 } from 'gl-matrix';

declare function require(name: string): any;

//TODO: all parse functions are unsafe now and does not have checks.

// hacks that I will forgot why it worked:
// json files are treated as modules and loaded using imports
// then parsed into game data
export function load_data(data_path: string) {
  let data = require("data/"+data_path);
  return data;
}

function parse_light(light:any) {
  let intensity = vec3.fromValues(light.color[0],light.color[1],light.color[2]);
  let position = vec3.fromValues(light.position[0],light.position[1],light.position[2]);
  return {intensity: intensity, position: position};
}

function parse_local_transform(scene_obj: any) {
  // transform is a stack TRxRyRzS
  // glMatrix has faster functions but it's unclear whether they preserve this order
  let t = mat4.create();
  let sv = vec3.fromValues(scene_obj.localTransformS[0], scene_obj.localTransformS[1], scene_obj.localTransformS[2]);
  let tv = vec3.fromValues(scene_obj.localTransformT[0], scene_obj.localTransformT[1], scene_obj.localTransformT[2]);
  //scale
  mat4.fromScaling(t, sv);
  //rotate
  mat4.rotateZ(t, t, scene_obj.localTransformRz);
  mat4.rotateY(t, t, scene_obj.localTransformRy);
  mat4.rotateX(t, t, scene_obj.localTransformRx);
  //translate
  mat4.translate(t, t, tv);
  return t;
}

function parse_render_object(render_obj: any) {
  let robj = <gd.RenderObject>{};
  robj.mesh = render_obj.mesh;
  robj.shader = render_obj.shader;
  if (render_obj.texture) {
    robj.tex = render_obj.texture;
  }
  return robj;
}

function parse_collider(collider: any) {
  let name = collider.name;
  //guaranteed by type system to only have two values
  if (name == "sphere") {
    return {name: name, radius: collider.radius};
  } 
  else {
    return {name: name, width: collider.dim[0], height: collider.dim[1], thickness: collider.dim[2]};
  }
}

function parse_collider_transform(scene_obj: any) {
  if (scene_obj.colliderT) {
    let t = mat4.create();
    let sv = vec3.fromValues(scene_obj.colliderS[0], scene_obj.colliderS[1], scene_obj.colliderS[2]);
    let tv = vec3.fromValues(scene_obj.colliderT[0], scene_obj.colliderT[1], scene_obj.colliderT[2]);
    //scale
    mat4.fromScaling(t, sv);
    //rotate
    mat4.rotateZ(t, t, scene_obj.colliderRx);
    mat4.rotateY(t, t, scene_obj.colliderRy);
    mat4.rotateX(t, t, scene_obj.colliderRz);
    //translate
    mat4.translate(t, t, tv);
    return t;
  }
  return undefined;
}

function parse_trigger(trigger: any) {
  return trigger;
}

// position: vec3; //basically a global translation
// localTransform: mat4;
// render_obj: RenderObject;
// collider? : Collider;
// collider_transform?: mat4; //if not present, use localTransform
// triggers: Array<Trigger>;
// light?: SceneLight; //optional light with position relative from the scene object
function parse_scene_object(scene_obj:any) {
  let position = vec3.fromValues(scene_obj.position[0], scene_obj.position[1], scene_obj.position[2]);
  let localTransform = parse_local_transform(scene_obj);
  let render_obj = parse_render_object(scene_obj.render_obj);
  let sobj = <gd.SceneObject>{id:scene_obj.id, position: position, localTransform: localTransform};
  if (scene_obj.collider) {
    sobj.collider = parse_collider(scene_obj.collider);  
  }
  if (scene_obj.colliderT) {
    sobj.collider_transform = parse_collider_transform(scene_obj);
  }
  sobj.triggers = (<Array<any>>(scene_obj.triggers)).map(parse_trigger);
  if (scene_obj.light) {
    sobj.light = parse_light(scene_obj.light);
  }
  return sobj;
}

function parse_room(room: any) {
  let lights = (<Array<any>>(room.lights)).map(parse_light);
  let objects = (<Array<any>>(room.objects)).map(parse_scene_object);
  return {lights: lights, objects: objects};
}

export function get_game_data(data_path: string): gd.GameDefinition{
  let data = load_data(data_path);
  let rooms = (<Array<any>>(data.rooms)).map(parse_room);
  return {rooms: rooms};
}