/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="23.49" height="23.49" data-name="Layer 2" viewBox="0 0 23.49 23.49"><defs><radialGradient id="a" cx="8.24" cy="8.01" r="16.99" fx="8.24" fy="8.01" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e6e7e8"/><stop offset=".13" stop-color="#e1e2e3"/><stop offset=".29" stop-color="#d2d3d4"/><stop offset=".46" stop-color="#bbbcbd"/><stop offset=".64" stop-color="#9a9b9c"/><stop offset=".83" stop-color="#707173"/><stop offset=".84" stop-color="#6d6e70"/></radialGradient></defs><circle cx="11.75" cy="11.75" r="11.75" data-name="Layer 1" style="fill:url(#a)"/></svg>')}`;
export default image;