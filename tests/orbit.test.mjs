import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import * as THREE from 'three';

// Exercise exactly the orbit implementation that is shipped with the WebGL world.
const bundle = await build({ entryPoints: ['src/game/orbit.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { ExplorerOrbit } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const close = (a, b, tolerance = 0.001) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
function fixture() {
  const lens = new THREE.PerspectiveCamera(52, 16 / 9, 0.1, 240);
  const orbit = new ExplorerOrbit(lens);
  const position = new THREE.Vector3();
  let state;
  orbit.subscribe((view) => { state = view; });
  orbit.reset(position, Math.PI);
  const tick = (seconds = 1, facing = Math.PI) => {
    for (let i = 0; i < Math.ceil(seconds * 60); i++) orbit.update(1 / 60, position, facing);
  };
  return { orbit, lens, position, tick, state: () => state };
}

test('two continuous revolutions cross the north seam without a stop or a radius collapse', () => {
  const { orbit, lens, tick, state } = fixture();
  const start = lens.position.clone();
  const initialYaw = orbit.azimuth;
  const focus = new THREE.Vector3(0, 1.36, 0);
  for (let i = 1; i <= 8; i++) {
    orbit.turn(90);
    tick();
    assert.equal(state().heading, (i * 90) % 360);
    close(lens.position.distanceTo(focus), 6.4);
  }
  close(orbit.azimuth, initialYaw - 4 * Math.PI);
  close(start.distanceTo(lens.position), 0);
  orbit.dispose();
});

test('one-touch tour actually visits every quadrant and returns to its starting view', () => {
  const { orbit, lens, tick, state } = fixture();
  orbit.turn(45); tick();
  const start = lens.position.clone();
  const quadrants = new Set();
  orbit.toggleTour();
  assert.equal(state().touring, true);
  for (let i = 0; i < 320; i++) { tick(1 / 60); quadrants.add(Math.floor(state().heading / 90)); }
  assert.equal(quadrants.size, 4);
  assert.equal(state().touring, false);
  assert.equal(state().heading, 45);
  close(start.distanceTo(lens.position), 0);
  orbit.dispose();
});

test('manual orbit interrupts the panorama; paused camera ignores further input', () => {
  const { orbit, lens, tick, state } = fixture();
  orbit.toggleTour(); tick(1);
  orbit.turn(45); tick();
  assert.equal(state().touring, false);
  orbit.setPaused(true);
  const before = lens.position.clone();
  orbit.turn(90); orbit.recenter(); orbit.toggleTour(); tick(2);
  close(before.distanceTo(lens.position), 0);
  orbit.setPaused(false); orbit.turn(90); tick();
  assert.ok(before.distanceTo(lens.position) > 3);
  orbit.dispose();
});

test('recenter follows the latest player position and facing, not the original spawn', () => {
  const { orbit, lens, position, tick, state } = fixture();
  position.set(7, 0, 4);
  orbit.turn(885); tick(2, Math.PI / 2);
  orbit.recenter(); tick(1, Math.PI / 2);
  assert.equal(state().heading, 90);
  assert.ok(lens.position.x < position.x);
  close(lens.position.z, position.z);
  const view = lens.getWorldDirection(new THREE.Vector3());
  const toPlayer = position.clone().add(new THREE.Vector3(0, 1.36, 0)).sub(lens.position).normalize();
  close(view.dot(toPlayer), 1);
  orbit.dispose();
});

test('a wall shortens the orbit immediately and clearing it restores the zoom distance', () => {
  const { orbit, lens, tick, position } = fixture();
  const scene = new THREE.Scene();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 0.5), new THREE.MeshStandardMaterial());
  wall.position.set(0, 2, 3);
  scene.add(wall);
  orbit.setEnvironment(scene);
  tick(1 / 60);
  assert.ok(lens.position.z < 2.75, 'Camera must remain in front of the wall.');
  orbit.turn(180); tick(2);
  close(lens.position.distanceTo(position.clone().add(new THREE.Vector3(0, 1.36, 0))), 6.4);
  orbit.dispose(); wall.geometry.dispose(); wall.material.dispose();
});
