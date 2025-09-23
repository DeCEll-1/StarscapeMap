"use strict";
import * as THREE from "three";

function RGBToHex(r, g, b, a = 1, includeAlpha = false) {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    a = Math.max(0, Math.min(1, a));

    const toHex = (c) => c.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}` + (includeAlpha ? `${toHex(Math.round(a * 255))}` : '');
}

function Sector(security) {
    let hex;
    if (security == "Core") { hex = "#00A000" }
    else if (security == "Secure") { hex = "#0000FF" }
    else if (security == "Contested") { hex = "#FFA500" }
    else if (security == "Unsecure") { hex = "#FF0000" }
    else if (security == "Wild") { hex = "#800080" }
    else (hex = '#FFFFFF')

    return hex;
}

function Faction(
    /** @type {import('./TypeDefs.js').StarSystem} */
    system
) {
    let hex;
    if (system.faction == "Neutral" && system.security == "Wild") { hex = "#535353" }
    else if (system.faction == "Neutral") { hex = "#b3b3b3" }
    else if (system.faction == "Foralkan") { hex = "#c82731" }
    else if (system.faction == "Lycentian") { hex = "#0ca3d3" }
    else if (system.faction == "Kavani") { hex = "#1fa625" }
    else if (system.faction == "Syndicate") { hex = "#FE9C00" }
    else if (system.faction == "TradeUnion") { hex = "#62E4DF" }

    return hex;
}

function FactionBorders(
    /** @type {import('./TypeDefs.js').StarSystem} */
    system
) {
    let hex;
    if (system.faction == "Neutral" && system.security == "Wild") { hex = "#535353" }
    else if (system.faction == "Neutral") { hex = "#b3b3b3" }
    else if (system.faction == "Foralkan") { hex = "#FB1F29" }
    else if (system.faction == "Lycentian") { hex = "#21BAFB" }
    else if (system.faction == "Kavani") { hex = "#29F92F" }
    else if (system.faction == "Syndicate") { hex = "#FFC031" }
    else if (system.faction == "TradeUnion") { hex = "#22FBF2" }

    return hex;
}

function Spice(spice) {
    let hex;
    if (spice == "None") { hex = "#404040"; } // softer white
    else if (spice == "Red") { hex = "#990000"; } // darker red
    else if (spice == "Green") { hex = "#006600"; } // darker green
    else if (spice == "Blue") { hex = "#000099"; } // darker blue
    else if (spice == "Orange") { hex = "#cc6600"; } // muted orange
    else if (spice == "Purple") { hex = "#660066"; } // darker purple
    else if (spice == "Yellow") { hex = "#999900"; } // darker yellow
    else if (spice == "Silver") { hex = "#888888"; } // dim gray
    else { hex = '#000000'; } // fallback black

    return hex;
}

function GradientTexture(source, destination) {
    // create canvas for our texture
    const canvas = document.createElement('canvas');
    // create its 2d graphics context
    const ctx = canvas.getContext('2d');
    // update the shape so its fit for gradient
    canvas.width = 1024;
    canvas.height = 1;
    // create the gradient on the canvas
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    // add color to 0 
    gradient.addColorStop(0, Sector(source));
    // add color to 1
    gradient.addColorStop(1, Sector(destination));
    // set the style to gradient
    ctx.fillStyle = gradient;
    // draw on the canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // create texture from the canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true; // idk what this does tho
    return texture;
}

export { GradientTexture, Sector, Spice, Faction, FactionBorders, RGBToHex };