// Copyright 2026, University of Colorado Boulder

/**
 * GLSL shader source strings for the GPU Richardson wave packet solver.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const FULLSCREEN_VERT = `#version 300 es
void main() {
  float x = float(gl_VertexID & 1) * 4.0 - 1.0;
  float y = float(gl_VertexID >> 1) * 4.0 - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
}`;

export const RICHARDSON_STEP_FRAG = `#version 300 es
precision highp float;
precision highp int;

uniform highp sampler2D u_psi;
uniform ivec2 u_direction;
uniform vec2 u_alpha;
uniform vec2 u_beta;

out vec2 fragColor;

void main() {
  ivec2 pos = ivec2(gl_FragCoord.xy);
  ivec2 size = textureSize(u_psi, 0);
  vec2 self = texelFetch(u_psi, pos, 0).rg;

  int sign = ((pos.x + pos.y) & 1) == 0 ? 1 : -1;
  ivec2 neighborPos = pos + sign * u_direction;
  neighborPos = (neighborPos + size) % size;

  vec2 neighbor = texelFetch(u_psi, neighborPos, 0).rg;

  fragColor = vec2(
    u_alpha.x * self.x - u_alpha.y * self.y + u_beta.x * neighbor.x - u_beta.y * neighbor.y,
    u_alpha.x * self.y + u_alpha.y * self.x + u_beta.x * neighbor.y + u_beta.y * neighbor.x
  );
}`;

export const BARRIER_FRAG = `#version 300 es
precision highp float;

uniform highp sampler2D u_psi;
uniform highp sampler2D u_barrier;

out vec2 fragColor;

void main() {
  ivec2 pos = ivec2(gl_FragCoord.xy);
  float mask = texelFetch(u_barrier, pos, 0).r;
  fragColor = mask > 0.5 ? vec2(0.0) : texelFetch(u_psi, pos, 0).rg;
}`;

export const DAMPING_FRAG = `#version 300 es
precision highp float;

uniform highp sampler2D u_psi;
uniform highp sampler2D u_damping;

out vec2 fragColor;

void main() {
  ivec2 pos = ivec2(gl_FragCoord.xy);
  float d = texelFetch(u_damping, pos, 0).r;
  fragColor = texelFetch(u_psi, pos, 0).rg * d;
}`;

export const DISPLAY_FRAG = `#version 300 es
precision highp float;

uniform highp sampler2D u_psi;
uniform int u_displayMode;
uniform vec3 u_baseColor;
uniform vec3 u_negColor;
uniform float u_amplitudeScale;

out vec4 fragColor;

void main() {
  ivec2 pos = ivec2(gl_FragCoord.xy);
  vec2 psi = texelFetch(u_psi, pos, 0).rg * u_amplitudeScale;

  float value;
  bool isPositive = true;

  if (u_displayMode == 0) {
    // magnitude
    value = sqrt(psi.x * psi.x + psi.y * psi.y);
  }
  else if (u_displayMode == 1 || u_displayMode == 3) {
    // realPart or electricField
    value = psi.x;
    isPositive = value >= 0.0;
    value = abs(value);
  }
  else if (u_displayMode == 2) {
    // imaginaryPart
    value = psi.y;
    isPositive = value >= 0.0;
    value = abs(value);
  }
  else {
    // timeAveragedIntensity
    value = psi.x * psi.x + psi.y * psi.y;
  }

  value = clamp(value, 0.0, 1.0);
  vec3 color = isPositive ? u_baseColor : u_negColor;
  fragColor = vec4(color * value, 1.0);
}`;
