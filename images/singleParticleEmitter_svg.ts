/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 2" viewBox="0 0 248.56 190.53"><defs><linearGradient id="a" x1="227.16" x2="227.1" y1="8.11" y2="183.42" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#999"/><stop offset=".32" stop-color="#fff"/><stop offset="1"/></linearGradient><linearGradient id="b" x1="113.24" x2="113.18" y1=".82" y2="189.64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#999"/><stop offset=".32" stop-color="#fff"/><stop offset="1" stop-color="#595959"/></linearGradient></defs><g data-name="Layer 1"><rect width="40.63" height="175.3" x="206.82" y="8.12" rx="11.14" ry="11.14" style="fill:url(#a)"/><rect width="40.63" height="175.3" x="206.82" y="8.12" rx="11.14" ry="11.14" style="stroke-width:2.23px;fill:none;stroke:#221f20"/><path d="M225.55 181.11c0 4.71-3.85 8.57-8.57 8.57h-8.33c-4.71 0-10.07-2.93-13.13-6.51l-27.21-39.98c-3.06-3.58-9.42-6.51-14.13-6.51H9.42c-4.71 0-8.57-3.85-8.57-8.57V63.42c0-4.71 3.85-8.57 8.57-8.57h145.06c4.71 0 11.03-2.96 14.05-6.58L195.6 7.42c3.02-3.62 8.34-6.58 13.05-6.58h8.33c4.71 0 8.57 3.85 8.57 8.57V181.1Z" style="fill:url(#b)"/><path d="M225.55 181.11c0 4.71-3.85 8.57-8.57 8.57h-8.33c-4.71 0-10.07-2.93-13.13-6.51l-27.21-39.98c-3.06-3.58-9.42-6.51-14.13-6.51H9.42c-4.71 0-8.57-3.85-8.57-8.57V63.42c0-4.71 3.85-8.57 8.57-8.57h145.06c4.71 0 11.03-2.96 14.05-6.58L195.6 7.42c3.02-3.62 8.34-6.58 13.05-6.58h8.33c4.71 0 8.57 3.85 8.57 8.57V181.1Z" style="fill:none;stroke:#221f20;stroke-width:1.71px"/></g></svg>')}`;
export default image;