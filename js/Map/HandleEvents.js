"use strict";
import { Sector, Spice, Faction } from "./ColorConverter.js";
import { GetClosestMatches } from "./SearchFunctions.js";
import { mapData, connectionsData } from "./Main.js"
import * as THREE from 'three';

const mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let selectionCube;
const scale = 1;
function SetStuff(myCamera, myControls) {
    camera = myCamera;
    controls = myControls;
}

function CreateSystemSelectionRaycastEvent(camera, meshes, mySelectionCube, container) {
    selectionCube = mySelectionCube;

    window.addEventListener('click', function (e) {
        let closest = e.target.closest(".canvas-ignore");
        if (closest !== null) return;

        const rect = container.getBoundingClientRect();

        // https://github.com/mrdoob/three.js/blob/f230fe9147bfbf9c689a8d62b72d757395a513c9/examples/webgl_instancing_raycast.html#L126
        // update mouse

        // calculate mouse position relative to container
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // send raycast from the camera to check for objects
        raycaster.setFromCamera(mouse, camera);
        // an array of objects intersected
        const intersection = raycaster.intersectObject(meshes);

        if (intersection.length == 0) {
            // hit nothing, hide the selection shower thingamob
            document.getElementById("selectionView").style.visibility = "hidden";
            selectionCube.visible = false;
            return;
        } else {
            document.getElementById("selectionView").style.visibility = "visible";
            selectionCube.visible = true;
        };


        // get the intersection instance id
        let id = intersection[0].instanceId;
        // create a temp matrix to get the instances matrix 
        let temp = new THREE.Matrix4();
        // update the temp variable
        meshes.getMatrixAt(id, temp);
        // get the position from the matrix
        let outPos = new THREE.Vector3();
        temp.decompose(outPos, new THREE.Quaternion(), new THREE.Vector3());

        // update the cube
        selectionCube.position.x = outPos.x;
        selectionCube.position.y = outPos.y;
        selectionCube.position.z = outPos.z;
        selectionCube.updateMatrix();

        // meshes.setColorAt(id, new THREE.Color(0xff0000));
        // meshes.instanceColor.needsUpdate = true;

        // console.log(intersection);

        // now we need to get the system,
        // thankfully the instance id *should* be equal to the system id in our map array
        if (mapData) {
            window.currentSelectedSystemName = mapData[id].name;
            DisplaySelectionWindow(mapData[id])
        }
    });
}

function CreateSpectralFilterEvent(sectors, links) {
    document.getElementById("RadioButtonSpectral").addEventListener("change", function (e) {
        if (!this.checked) return;
        if (mapData) {
            // #region map
            for (let i = 0; i < mapData.length; i++) {
                const sector = mapData[i];

                // Dimmed spectral colors
                let col = "";
                if (sector.spectralClass == "B") col = "#3290B3";  // dim blue
                if (sector.spectralClass == "A") col = "#66B3CC";  // dim light blue
                if (sector.spectralClass == "F") col = "#E6E1B3";  // dim light yellow
                if (sector.spectralClass == "G") col = "#E6D94D";  // dim yellow
                if (sector.spectralClass == "K") col = "#CC7A33";  // dim orange
                if (sector.spectralClass == "M") col = "#B3392C";  // dim red

                // Set color on THREE.js mesh
                sectors.setColorAt(i, new THREE.Color(col));
            }
            sectors.instanceColor.needsUpdate = true;
            // #endregion
        }

        if (connectionsData) {
            // #region links
            for (let i = 0; i < connectionsData.length; i++) {
                const connection = connectionsData[i];

                // if (mySwitch === true) {
                //     if (connection.startSecurity == connection.endSecurity)
                //         links.setColorAt(i, new THREE.Color(Sector(connection.startSecurity)))
                //     else
                //         links.setColorAt(i, new THREE.Color(0x404040))
                // }
                // else
                links.setColorAt(i, new THREE.Color(0x404040))
            }
            links.instanceColor.needsUpdate = true;
            // #endregion
        }
    });
}

function CreateSecurityFilterEvent(sectors, links) {
    document.getElementById("RadioButtonSecurity").addEventListener("change", function (e) {
        if (!this.checked) return;
        if (mapData) {
            // #region map
            for (let i = 0; i < mapData.length; i++) {
                const sector = mapData[i];
                sectors.setColorAt(i, new THREE.Color(Sector(sector.security)))
            }
            sectors.instanceColor.needsUpdate = true;
            // #endregion
        }

        if (connectionsData) {
            // #region links
            for (let i = 0; i < connectionsData.length; i++) {
                const connection = connectionsData[i];

                if (connection.startSystem.security == connection.endSystem.security)
                    links.setColorAt(i, new THREE.Color(Sector(connection.startSystem.security)))
                else
                    links.setColorAt(i, new THREE.Color(0x404040))
            }
            links.instanceColor.needsUpdate = true;
            // #endregion
        }
    });
}

function CreateSpiceyFilterEvent(sectors, links) {
    document.getElementById("RadioButtonSpice").addEventListener("change", function (e) {
        if (!this.checked) return;
        if (mapData) {
            // #region map
            for (let i = 0; i < mapData.length; i++) {
                const sector = mapData[i];
                sectors.setColorAt(i, new THREE.Color(Spice(sector.spice)))
            }
            sectors.instanceColor.needsUpdate = true;
            // #endregion
        }

        if (connectionsData) {
            // #region links
            for (let i = 0; i < connectionsData.length; i++) {
                const connection = connectionsData[i];

                if (connection.startSystem.spice == connection.endSystem.spice)
                    links.setColorAt(i, new THREE.Color(Spice(connection.startSystem.spice)))
                else
                    links.setColorAt(i, new THREE.Color(0x404040))
            }
            links.instanceColor.needsUpdate = true;
            // #endregion
        }
    });
}

function CreateFactionFilterEvent(sectors, links) {
    document.getElementById("RadioButtonFaction").addEventListener("change", function (e) {
        if (!this.checked) return;
        if (mapData) {
            // #region map
            for (let i = 0; i < mapData.length; i++) {
                const sector = mapData[i];
                sectors.setColorAt(i, new THREE.Color(Faction(sector)))
            }
            sectors.instanceColor.needsUpdate = true;
            // #endregion
        }

        if (connectionsData) {
            // #region links
            for (let i = 0; i < connectionsData.length; i++) {
                const connection = connectionsData[i];

                if (connection.startSystem.faction == connection.endSystem.faction)
                    links.setColorAt(i, new THREE.Color(Faction(connection.startSystem)))
                else
                    links.setColorAt(i, new THREE.Color(0x404040))
            }
            links.instanceColor.needsUpdate = true;
            // #endregion
        }
    });
}

function CreateSearchEvent(sectors, links) {

    const input = document.getElementById("TBSystemSearch");

    input.addEventListener("input", debounce(() => {
        const value = input.value;
        const searchResults = document.getElementById("searchResultsContainer");
        if (value === "") {
            searchResults.style.height = "0";
            searchResults.style.visibility = "hidden";
            searchResults.style.padding = "0";
        }
        else {
            searchResults.style.height = "auto";
            searchResults.style.visibility = "visible";
            searchResults.style.padding = "5px";
        }

        const matches = GetClosestMatches(value, mapData, 2);
        const substringMatches = mapData
            .filter(candidate => candidate.name.toLowerCase().includes(value))
            .filter(candidate => !matches.includes(candidate));


        updateList(substringMatches.concat(matches).slice(0, 20))
    }, 50));
}

function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);       // clear previous timer
        timeout = setTimeout(() => { // set new timer
            fn.apply(this, args);
        }, delay);
    };
}

function updateList(newItems) {
    const searchResults = document.getElementById("searchResults");

    searchResults.innerHTML = "";

    newItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.name;
        li.className += item.security + "LI";

        li.addEventListener("click", () => {
            // console.log("Clicked:", item);

            let myPos = {};
            myPos.x = (item.position[0] - 180) / scale;
            myPos.y = (item.position[2]) / scale;
            myPos.z = (item.position[1] - 180) / scale;

            DisplaySelectionWindow(item);
            focusOn(camera.position, myPos);
        });

        searchResults.appendChild(li);
    });
}

let camera;
let controls;

function runFuncInterpolation(fn, dur, interval) {
    const startTime = performance.now();

    if (running) return;

    running = true;
    const timer = setInterval(() => {
        const now = performance.now();
        const elapsed = now - startTime;
        let t = elapsed / dur;

        if (t > 1) t = 1; // clamp to 1

        fn(t);

        if (t >= 1) clearInterval(timer);
    }, interval);

    setTimeout(() => { running = false }, dur);


}
let running;

function focusOn(start, end) {

    let endVector = new THREE.Vector3(end.x, end.y, end.z);
    let loc = new THREE.Vector3(start.x, start.y, start.z);

    document.getElementById("selectionView").style.visibility = "visible";
    selectionCube.visible = true;

    runFuncInterpolation((t) => {
        selectionCube.position.x = endVector.x;
        selectionCube.position.y = endVector.y;
        selectionCube.position.z = endVector.z;
        selectionCube.updateMatrix();

        loc = new THREE.Vector3(start.x, start.y, start.z).lerp(endVector, t);

        // position is a THREE.Vector3
        const target = loc;

        // keep the current distance between camera and target
        const distance = camera.position.distanceTo(controls.target);

        // update the orbit controls target
        controls.target.copy(target);

        // move the camera so it stays at the same distance but points to the new target
        const direction = new THREE.Vector3()
            .subVectors(camera.position, controls.target) // vector from target → camera
            .normalize();

        camera.position.copy(target).addScaledVector(direction, distance);

        // make sure OrbitControls knows about the update
        controls.update();
    }, 1000, 16.6666);

}

function DisplaySelectionWindow(system) {
    //#region upper box (name and stuff)
    const selectionText = document.getElementById("selectionText");

    selectionText.innerHTML = "";

    const systemNameLabel = document.createElement("label");

    systemNameLabel.innerHTML = system.name;

    systemNameLabel.style.color = "#FFFFFF"

    systemNameLabel.className += "h5"

    selectionText.appendChild(systemNameLabel);

    const hr = document.createElement("hr");

    hr.style.width = "80%";

    hr.style.margin = "-8px 10%";

    selectionText.appendChild(hr);

    const securityLabel = document.createElement("label");

    securityLabel.style.color = Sector(system.security);

    securityLabel.style.marginTop = "8px";

    securityLabel.innerHTML = system.security + " System";

    selectionText.appendChild(securityLabel);
    //#endregion

}

export { CreateSystemSelectionRaycastEvent, CreateSpectralFilterEvent, CreateSecurityFilterEvent, CreateSpiceyFilterEvent, CreateSearchEvent, SetStuff, DisplaySelectionWindow, CreateFactionFilterEvent }