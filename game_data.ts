import glrt from 'braid-glrt';
import { Assets, load_asset, Mesh } from 'braid-glrt';
import { mat4, vec3 } from 'gl-matrix';

//point light only now. Need more general lights
export interface SceneLight {
  intensity: vec3;
  position: vec3;
}

export interface TriggerCheck {
  funcName: string;
}

// touch: collision happens
// action: Action button pressed with object in "selection"
// check: a boolean function. Probably unimplementable if braid has no reflection
export type InteractionType = "Touch" | "Action" | TriggerCheck
export type TriggerAction = "RoomSwitch" | "InventoryAdd" | "InventoryDrop";

// game event triggers. This could evolve into full fledged game engine script
export interface Trigger {
  interaction: InteractionType;
  action: TriggerAction;
  target?: SceneObject;
}

// need to support more colliders

export interface PlaneCollider {
  height: number;
  width: number;
}

export interface SphereCollider {
  radius: number
}

export type Collider = PlaneCollider | SphereCollider;

export interface RenderObject {
    mesh: string;
    tex?: string;
    shader: string; //again need some way to dispatch methods from string
}

export interface SceneObject {
  position: vec3; //basically a global translation
  localTransform: mat4;
  render_obj: RenderObject;
  collider? : Collider;
  collider_transform?: mat4; //if not present, use localTransform
  triggers: Array<Trigger>;
}

// lights and objects are defined with respect to room origin
export interface RoomDefinition {
  lights: Array<SceneLight>;
  objects?: Array<SceneObject>;
}

export interface GameDefinition {
  rooms: Array<RoomDefinition>;
}
