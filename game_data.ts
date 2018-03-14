import glrt from 'braid-glrt';
import { Assets, load_asset, Mesh } from 'braid-glrt';
import { mat4, vec3 } from 'gl-matrix';

//point light only now. Need more general lights
export interface SceneLight {
  intensity: vec3;
  position: vec3;
}

export function get_light_intensity(light: SceneLight) {
  return light.intensity;
}

export function get_light_position(light: SceneLight) {
  return light.position;
}

export interface TriggerCheck {
  funcName: string;
}

// touch: collision happens
// action: Action button pressed with object in "selection"
// check: a boolean function. Probably unimplementable if braid has no reflection
export type InteractionType = "Touch" | "Action" | TriggerCheck;
export type TriggerAction = "RoomSwitch" | "InventoryAdd" | "InventoryDrop";

// game event triggers. This could evolve into full fledged game engine script
export interface Trigger {
  interaction: InteractionType;
  action: TriggerAction;
  target?: SceneObject;
}

export function get_trigger_interaction(trigger: Trigger) {
  return trigger.interaction;
}

export function get_trigger_action(trigger: Trigger) {
  return trigger.action;
}

export function has_trigger_target(trigger: Trigger) {
  if (trigger.target) {
    return true;
  }
  return false;
}

export function get_trigger_target(trigger: Trigger) {
  if (trigger.target) {
      return trigger.target;
  }
  throw "this trigger has no target";
}

// need to support more colliders
export interface Collider {
  name: string;
}

export interface PlaneCollider extends Collider{
  height: number;
  width: number;
  thickness: number; //plane is actually a 3d collider
}

export function get_collider_name(collider: Collider) {
  return collider.name;
}

export function get_plane_dimension(plane: Collider) {
  if ((<PlaneCollider>plane).height) {
    return vec3.fromValues((<PlaneCollider>plane).width, (<PlaneCollider>plane).height,
      (<PlaneCollider>plane).thickness);
  }
  throw "cannot get plane dimension from sphere";
}

export interface SphereCollider extends Collider {
  radius: number
}

export function get_sphere_radius(sphere: Collider) {
  if ((<SphereCollider>sphere).radius) {
    return (<SphereCollider>sphere).radius;
  }
  throw "cannot get radius from plane";
}

export interface RenderObject {
  mesh: string;
  tex?: string;
  shader: string; //again need some way to dispatch methods from string
}

export function get_render_obj_mesh(obj: RenderObject) {
  return obj.mesh;
}

export function has_render_obj_texture(obj: RenderObject) {
  if(obj.tex) {
    return true;
  }
  return false;
}

export function get_redner_obj_texture(obj: RenderObject) {
  if(obj.tex) {
    return obj.tex;
  }
  throw "render object has no texture";
}

export function get_render_obj_shader_name(obj: RenderObject) {
  return obj.shader;
}

export interface SceneObject {
  position: vec3; //basically a global translation
  localTransform: mat4;
  render_obj: RenderObject;
  collider? : Collider;
  collider_transform?: mat4; //if not present, use localTransform
  triggers: Array<Trigger>;
  light?: SceneLight; //optional light from the scene object
}

export function get_scene_obj_position (obj: SceneObject) {
  return obj.position;
}

export function get_scene_obj_local_transform (obj: SceneObject) {
  return obj.localTransform;
}

export function get_scene_obj_render_obj (obj: SceneObject) {
  return obj.render_obj;
}

export function has_scene_obj_collider (obj: SceneObject) {
  if (obj.collider) {
    return true;
  }
  return false;
}

export function get_scene_obj_collider (obj: SceneObject) {
  if (obj.collider) {
    return obj.collider;
  }
  throw "scene object does not have a collider";
}

export function has_scene_obj_collider_transform (obj: SceneObject) {
  if (obj.collider_transform){
    return true;
  }
  return false;
}

export function get_scene_obj_collider_transform (obj: SceneObject) {
  if (obj.collider_transform){
    return obj.collider_transform;
  }
  throw "scene object does not have a collider transform";
}

export function get_scene_obj_triggers (obj: SceneObject) {
  return obj.triggers;
}

export function get_scene_obj_trigger (obj: SceneObject, index: number) {
  if (index >= 0 && index < obj.triggers.length) {
    return obj.triggers[index];
  }
  throw "out of bound access on triggers";
}

export function iter_scene_obj_trigger (obj: SceneObject, f:(arg: Trigger)=> any) {
  return get_scene_obj_triggers(obj).map(f);
}

export function has_scene_obj_light (obj: SceneObject) {
  if (obj.light) {
    return true;
  }
  return false;
}

export function get_scene_obj_light (obj: SceneObject) {
  if (obj.light) {
    return obj.light;
  }
  throw "scene object does not have a light";
}

// lights and objects are defined with respect to room origin
export interface RoomDefinition {
  lights: Array<SceneLight>;
  objects: Array<SceneObject>;
}

export interface GameDefinition {
  rooms: Array<RoomDefinition>;
}

export function get_rooms(gameDef: GameDefinition) {
  return gameDef.rooms;
}

export function get_room(gameDef: GameDefinition, index: number) {
  let rooms = gameDef.rooms;
  if (index >= 0 && index < rooms.length) {
    return rooms[index];
  }
  throw "out of bounds access on rooms";
}

export function iter_rooms(gameDef: GameDefinition, f:(room: RoomDefinition)=> any) {
  return get_rooms(gameDef).map(f);
}

export function get_lights(room: RoomDefinition) {
  return room.lights;
}

export function get_light(room: RoomDefinition, index: number) {
  let lights = room.lights;
  if (index >= 0 && index < lights.length) {
    return lights[index];
  }
  throw "out of bounds access on lights from room";
}

export function iter_lights(room: RoomDefinition, f:(light: SceneLight)=> any) {
  return get_lights(room).map(f);
}

export function get_objects(room: RoomDefinition) {
  return room.objects;
}

export function get_object(room: RoomDefinition, index: number) {
  let objects = room.objects;
  if (index >= 0 && index < objects.length) {
    return objects[index];
  }
  throw "out of bounds access on objects from room";
}

export function iter_objects(room: RoomDefinition, f:(obj: SceneObject)=> any) {
  return get_objects(room).map(f);
}
