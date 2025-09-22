"use strict";
import * as THREE from 'three';
import { Sector } from "./ColorConverter.js";
// @ts-ignore
import { Text, BatchedText, preloadFont } from 'troika-three-text';
import {
    /** @type {import('./TypeDefs.js').StarSystem[]} */
    mapData,
    /** @type {import('./TypeDefs.js').Connection[]} */
    connectionsData
} from "./Main.js"

// need default material for initilisations
const defaultMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const scale = 1;

function getSystemVector3(
    /** @type {import('./TypeDefs.js').StarSystem} */
    system
) {
    const x = (system.position[0] - 180) / scale;
    const y = (system.position[2]) / scale;
    const z = (system.position[1] - 180) / scale;

    return new THREE.Vector3(x, y, z);
}

function RenderSystems(scene) {

    // #region System Json Structure
    /*
        region
        spice
        id
        spectralClass
        name
        links
        uncharted
        position
        warfare
        sector
        faction
        security
    */
    // #endregion

    // #region System mesh generation

    // create our geometry that we gonna use for instances
    const sphere = new THREE.SphereGeometry(
        8.5, // radius
        8, // sector count
        8  // stack count
    );
    // create the instanced mesh
    const instancedSpheres = new THREE.InstancedMesh(
        sphere,             // our mesh we gonna make instances of
        defaultMaterial,    // material
        mapData.length         // amount of instances we have
    );

    // #endregion

    scene.add(instancedSpheres);

    // dummy object that we will apply transformations to to get its matrix
    const dummyObject = new THREE.Object3D();
    for (let i = 0; i < mapData.length; i++) {
        const system = mapData[i];

        let vec = getSystemVector3(system);

        dummyObject.position.x = vec.x;
        dummyObject.position.y = vec.y;
        dummyObject.position.z = vec.z;

        dummyObject.updateMatrix();

        instancedSpheres.setMatrixAt(i, dummyObject.matrix);
        instancedSpheres.setColorAt(i, new THREE.Color(Sector(system.security)))
    }

    return instancedSpheres;
}

function RenderLinks(scene) {


    // #region Link Json Structure
    /*
        startSecurity
        startLocation
        endSecurity
        endLocation
    */
    // #endregion

    // #region Link mesh generation

    // we make a unit path thats lenght of 1 in the z axis

    const path = new THREE.LineCurve3(
        new THREE.Vector3(0, -0.5, 0),  // from 
        new THREE.Vector3(0, 0.5, 0)    // to
    );

    const tubeGeometry = new THREE.TubeGeometry(
        path,   // see path
        1,      // stack count
        0.7,      // radius
        3,     // sector count
        false
    );
    // create the instanced mesh
    const instancedLinks = new THREE.InstancedMesh(
        tubeGeometry,             // our mesh we gonna make instances of
        defaultMaterial,    // material
        connectionsData.length         // amount of instances we have
    );

    // #endregion

    scene.add(instancedLinks);

    // dummy object that we will apply transformations to to get its matrix
    const dummyObject = new THREE.Object3D();
    const defaultDirection = new THREE.Vector3(0, 1, 0); // Tube is aligned along Z-axis
    for (let i = 0; i < connectionsData.length; i++) {
        const link = connectionsData[i];
        // #region link translation & scale
        // we use 0 2 1 because z is the height in our source but y is the height in the opengl
        dummyObject.position.x = (link.center[0] - 180) / scale;
        dummyObject.position.y = (link.center[2]) / scale;
        dummyObject.position.z = (link.center[1] - 180) / scale;
        // #endregion

        // #region rotation

        // const dir = new THREE.Vector3(...link.direction).normalize();
        const dir = new THREE.Vector3(
            link.direction[0],
            link.direction[2],
            link.direction[1]
        ).normalize();

        // Step 1: Compute quaternion that rotates from Z-axis to direction vector
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(defaultDirection, dir);

        // Step 3: Apply rotation
        dummyObject.quaternion.copy(quaternion);

        // #endregion

        // #region scale

        dummyObject.scale.y = link.height / scale;

        // #endregion

        dummyObject.updateMatrix();

        instancedLinks.setMatrixAt(i, dummyObject.matrix);

        if (link.startSystem.security == link.endSystem.security)
            instancedLinks.setColorAt(i, new THREE.Color(Sector(link.startSystem.security)))
        else
            instancedLinks.setColorAt(i, new THREE.Color(0x404040))

    }

    return instancedLinks;

}

const repoName = "StarscapeMap"; // replace with your repo name
const basePath = window.location.hostname === "127.0.0.1" ? "." : `/${repoName}`;

async function RenderText(scene) {

    let i = 0;
    // https://github.com/protectwise/troika/blob/e43e18f1d4754107136b73ee05c410d160469379/packages/troika-three-text/src/BatchedText.js
    const batchText = new BatchedText();

    let loadingStatusElement = document.getElementById("loadingStatus")
    let loadingTextElement = document.getElementById("loadingText")

    loadingStatusElement.style.visibility = "visible";
    loadingStatusElement.style.height = "auto";

    const syncPromises = mapData.map(system => {
        const text = new Text();
        text.text = system.name;
        text.font = `${basePath}/Resources/Fonts/MICROSS.TTF`;
        text.fontSize = 10.5;
        text.anchorX = 'center';
        text.anchorY = 'middle';
        text.color = 0xffffff;

        // so it looks at the camera
        text.rotateX(Math.PI / -2);
        text.rotateZ(Math.PI / 2);

        // a bit under the system
        text.position.x = (system.position[0] - 180 + 15) / scale;
        // increase its height so its visible
        text.position.y = (system.position[2] + 10) / scale;
        text.position.z = (system.position[1] - 180) / scale;

        batchText.addText(text);
    });

    await new Promise(resolve => batchText.sync(resolve));

    loadingStatusElement.style.visibility = "hidden";
    loadingStatusElement.style.height = "0";

    scene.add(batchText);
    return batchText;
}

function RenderSelection(scene) { // this initalises the selection renderer
    let size = 20;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        wireframeLinewidth: 0.5
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.matrixAutoUpdate = false;
    scene.add(cube);
    return cube;
}

export { RenderSystems }
export { RenderLinks }
export { RenderText }
export { RenderSelection }