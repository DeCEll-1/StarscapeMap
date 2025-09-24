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
    CreateFactionFilterEvent,

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
    RenderBounds,
} from './RenderHelper.js';
// @ts-ignore
import Stats from 'three/addons/libs/stats.module.js';
// @ts-ignore
import { Sector } from "./ColorConverter.js";
// im not even using ts but the IDE keeps nagging
"use strict";

const repoName = "StarscapeMap"; // replace with your repo name
const basePath = window.location.hostname === "127.0.0.1" ? "." : `/${repoName}`;

/** @type {import('./TypeDefs.d.ts').StarSystem[]} */
let mapData;

/** @type {import('./TypeDefs.d.ts').Connection[]} */
let connectionsData;

let bounds;

Promise.all([
    fetch(`${basePath}/Resources/Json/map.json`).then(r => r.json()),
    fetch(`${basePath}/Resources/Json/cylinders.json`).then(r => r.json()),
    fetch(`${basePath}/Resources/Json/bounds_concave.json`).then(r => r.json())
]).then(([map, connections, boundsConcave]) => {
    mapData = map;
    connectionsData = connections;
    bounds = boundsConcave;

    DisplaySelectionWindow(mapData.find(s => s.name === "The Citadel"));
    init();
});


export { mapData, connectionsData, bounds }

const stats = new Stats()
const container = document.getElementById("mapCanvas");
let camera, scene, renderer, controls;
let frame = 0;


window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

var styleElem = document.head.appendChild(document.createElement("style"));

let instancedText; let instancedCylinders; let instancedSpheres; let borderMeshes;

styleElem.innerHTML = ".CoreLI::marker { color: " + Sector("Core") + " ;}\n";
styleElem.innerHTML += ".SecureLI::marker { color: " + Sector("Secure") + " ;}\n";
styleElem.innerHTML += ".ContestedLI::marker { color: " + Sector("Contested") + " ;}\n";
styleElem.innerHTML += ".UnsecureLI::marker { color: " + Sector("Unsecure") + " ;}\n";
styleElem.innerHTML += ".WildLI::marker { color: " + Sector("Wild") + " ;}\n";

function loadRadioButtonState() {
    const savedRadioId = localStorage.getItem('StarColoring');
    if (savedRadioId) {
        const radioButton = document.getElementById(savedRadioId);
        if (radioButton) {
            radioButton.checked = true;
            if (savedRadioId === 'RadioButtonSpectral') {
                radioButton.dispatchEvent(new Event('change'));
            } else if (savedRadioId === 'RadioButtonSecurity') {
                radioButton.dispatchEvent(new Event('change'));
            } else if (savedRadioId === 'RadioButtonSpice') {
                radioButton.dispatchEvent(new Event('change'));
            } else if (savedRadioId === 'RadioButtonFaction') {
                radioButton.dispatchEvent(new Event('change'));
            }
        }
    }
}

let updateTextVisibility;
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
        4000 // far dist
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
    RenderText(scene, camera).then(res => {
        instancedText = res.batchText;
        updateTextVisibility = res.updateTextVisibility;
        window.flipTextVisibility(document.getElementById("CBSystemNames"));
    });

    let cube = RenderSelection(scene);
    instancedCylinders = RenderLinks(scene);
    instancedSpheres = RenderSystems(scene);
    borderMeshes = RenderBounds(scene);

    window.flipSystemVisibility(document.getElementById("CBSystems"))
    window.flipLinkVisibility(document.getElementById("CBLinks"))

    CreateSystemSelectionRaycastEvent(camera, instancedSpheres, cube, container);
    CreateSpectralFilterEvent(instancedSpheres, instancedCylinders);
    CreateSecurityFilterEvent(instancedSpheres, instancedCylinders);
    CreateSpiceyFilterEvent(instancedSpheres, instancedCylinders);
    CreateFactionFilterEvent(instancedSpheres, instancedCylinders);

    CreateSearchEvent(instancedSpheres, instancedCylinders);

    loadRadioButtonState();


    stats.dom.style.position = "inherit";
    // stats.dom.style.marginTop = 40;
    stats.dom.style.removeProperty("top");
    stats.dom.style.removeProperty("left");


    document.getElementById("statsContainer").append(stats.dom);


    // #endregion

    // #region Main Render Loop

    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

        if (frame % 60 == 0)
            if (updateTextVisibility != null)
                updateTextVisibility.call();

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.updateMatrix();

        stats.update()

        frame++;
        renderer.render(scene, camera);
    }

    console.log("render");
    animate();
    // #endregion
}
export { instancedCylinders, instancedSpheres, instancedText, borderMeshes }
