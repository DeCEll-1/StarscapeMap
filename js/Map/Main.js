// @ts-nocheck
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-ignore
import {
    CreateSystemSelectionRaycastEvent,
    CreateSpectralFilterEvent,
    CreateSecurityFilterEvent,
    CreateSpiceyFilterEvent,
    CreateSearchEvent,
    SetStuff,
    DisplaySelectionWindow
} from './HandleEvents.js';
// @ts-ignore
import {
    RenderSelection,
    RenderSystems,
    RenderLinks,
    RenderText,
} from './RenderHelper.js';
// @ts-ignore
import Stats from 'three/addons/libs/stats.module.js';
// @ts-ignore
import { Sector } from "./ColorConverter.js";
// im not even using ts but the IDE keeps nagging
"use strict";

/** @type {import('./TypeDefs.d.ts').StarSystem[]} */
let mapData;

/** @type {import('./TypeDefs.d.ts').Connection[]} */
let connectionsData;
Promise.all([
    fetch('/StarscapeMap/Resources/Json/map.json').then(r => r.json()),
    fetch('/StarscapeMap/Resources/Json/cylinders.json').then(r => r.json())
]).then(([map, connections]) => {
    mapData = map;
    connectionsData = connections;

    DisplaySelectionWindow(mapData.find(s => s.name === "The Citadel"));
    init();
});


export { mapData, connectionsData }

const stats = new Stats()
const container = document.getElementById("mapCanvas");
let camera, scene, renderer, controls;



window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

var styleElem = document.head.appendChild(document.createElement("style"));

let instancedText; let instancedCylinders; let instancedSpheres;

styleElem.innerHTML = ".CoreLI::marker { color: " + Sector("Core") + " ;}\n";
styleElem.innerHTML += ".SecureLI::marker { color: " + Sector("Secure") + " ;}\n";
styleElem.innerHTML += ".ContestedLI::marker { color: " + Sector("Contested") + " ;}\n";
styleElem.innerHTML += ".UnsecureLI::marker { color: " + Sector("Unsecure") + " ;}\n";
styleElem.innerHTML += ".WildLI::marker { color: " + Sector("Wild") + " ;}\n";

function init() {
    // #region Scene Setup
    // create our scene & camera
    scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    // create renderer and add the canvas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        75, // pov
        width / height, // ratio
        0.1, // near dist
        100000 // far dist
    );

    // add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);
    // #endregion

    // #region Camera Settings

    // update camera position
    camera.position.set(0, 200, 0);

    // look at center of the world
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // create orbit controls and set it up
    controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true; // weight to controls
    controls.dampingFactor = 0.05; // damping amount, requires update in controls

    controls.enablePan = true; // Allow panning
    controls.screenSpacePanning = false; // pan in the cameras up rotation

    controls.minDistance = 100;
    controls.maxDistance = 4000;

    // controls.minPolarAngle = Math.PI / 16;
    // controls.maxPolarAngle = Math.PI / 16;

    controls.minPolarAngle = 0;
    controls.maxPolarAngle = 0;

    controls.minAzimuthAngle = -300;
    controls.maxAzimuthAngle = -300;

    // controls.enableZoom = true; // Allow zooming
    // controls.maxZoom = 100000;

    // #region set the proper rotation
    // Get the current distance between the camera and the target point
    const radius = controls.object.position.distanceTo(controls.target);

    // Get the current vertical rotation (polar angle: angle from Y axis)
    const polarAngle = controls.getPolarAngle();

    // Set the desired horizontal rotation radian (azimuthal radian: radian around Y axis)
    // Example: rotate to face the positive Z axis (0 radians), or adjust as needed
    const azimuthalRadian = Math.PI / 2;

    // Calculate the new camera position using spherical coordinates:
    // (radius, polarAngle, azimuthalRadian)
    controls.object.position.setFromSphericalCoords(radius, polarAngle, azimuthalRadian);

    // Make the camera look at the target point again (very important!)
    controls.object.lookAt(controls.target);

    // Apply and render the updated position and orientation
    controls.update();
    // #endregion


    // #endregion

    // #region Initalise Rendering
    SetStuff(camera, controls);
    RenderText(scene).then(res => {
        instancedText = res;
        window.flipTextVisibility(document.getElementById("CBSystemNames"));
    }
    );

    let cube = RenderSelection(scene);
    instancedCylinders = RenderLinks(scene);
    instancedSpheres = RenderSystems(scene);

    window.flipSystemVisibility(document.getElementById("CBSystems"))
    window.flipLinkVisibility(document.getElementById("CBLinks"))

    CreateSystemSelectionRaycastEvent(camera, instancedSpheres, cube, container);
    CreateSpectralFilterEvent(instancedSpheres, instancedCylinders);
    CreateSecurityFilterEvent(instancedSpheres, instancedCylinders);
    CreateSpiceyFilterEvent(instancedSpheres, instancedCylinders);
    CreateSearchEvent(instancedSpheres, instancedCylinders);


    stats.dom.style.position = "absolute";
    stats.dom.style.marginTop = 40;
    stats.dom.style.removeProperty("top");
    stats.dom.style.removeProperty("left");

    //container.prepend(stats.dom);


    // #endregion

    // #region Main Render Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.updateMatrix();

        stats.update()

        renderer.render(scene, camera);
    }

    console.log("render");
    animate();
    // #endregion
}
export { instancedCylinders, instancedSpheres, instancedText }
