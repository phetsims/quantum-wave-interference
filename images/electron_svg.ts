/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="10.86" height="10.86" data-name="Layer 2" viewBox="0 0 10.86 10.86"><defs><radialGradient id="a" cx="3.81" cy="3.71" r="7.86" fx="3.81" fy="3.71" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#aad1e4" stop-opacity=".6"/><stop offset=".17" stop-color="#a2c8dd" stop-opacity=".6"/><stop offset=".36" stop-color="#8db1cb" stop-opacity=".6"/><stop offset=".58" stop-color="#6a89ac" stop-opacity=".6"/><stop offset=".8" stop-color="#395381" stop-opacity=".6"/><stop offset=".84" stop-color="#2f4778" stop-opacity=".6"/></radialGradient></defs><circle cx="5.43" cy="5.43" r="5.43" data-name="Layer 1" style="fill:url(#a)"/></svg>')}`;
export default image;