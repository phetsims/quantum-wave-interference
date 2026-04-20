// Copyright 2026, University of Colorado Boulder

/**
 * GPUContext manages a WebGL2 rendering context and provides utility methods for texture creation,
 * framebuffer management, shader compilation, and fullscreen rendering passes. Used by
 * GPUWavePacketSolver for GPU-accelerated Richardson wave propagation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class GPUContext {

  public readonly gl: WebGL2RenderingContext;
  public readonly canvas: HTMLCanvasElement;
  private readonly fullscreenVAO: WebGLVertexArrayObject;

  public constructor( canvasWidth: number, canvasHeight: number ) {
    this.canvas = document.createElement( 'canvas' );
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    const gl = this.canvas.getContext( 'webgl2', {
      antialias: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: false
    } );
    assert && assert( gl, 'WebGL2 context required for GPU wave solver' );
    this.gl = gl!;

    const ext = this.gl.getExtension( 'EXT_color_buffer_float' );
    assert && assert( ext, 'EXT_color_buffer_float required for float render targets' );

    this.fullscreenVAO = this.gl.createVertexArray()!;
  }

  public createRG32FTexture( width: number, height: number, data?: Float32Array ): WebGLTexture {
    return this.createTexture( this.gl.RG32F, this.gl.RG, this.gl.FLOAT, width, height, data || null );
  }

  public createR8Texture( width: number, height: number, data?: Uint8Array ): WebGLTexture {
    return this.createTexture( this.gl.R8, this.gl.RED, this.gl.UNSIGNED_BYTE, width, height, data || null );
  }

  public createR32FTexture( width: number, height: number, data?: Float32Array ): WebGLTexture {
    return this.createTexture( this.gl.R32F, this.gl.RED, this.gl.FLOAT, width, height, data || null );
  }

  private createTexture(
    internalFormat: GLenum, format: GLenum, type: GLenum,
    width: number, height: number, data: ArrayBufferView | null
  ): WebGLTexture {
    const { gl } = this;
    const tex = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, tex );
    gl.texImage2D( gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    return tex;
  }

  public createFBO( texture: WebGLTexture ): WebGLFramebuffer {
    const { gl } = this;
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, fbo );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0 );
    assert && assert(
      gl.checkFramebufferStatus( gl.FRAMEBUFFER ) === gl.FRAMEBUFFER_COMPLETE,
      'Framebuffer incomplete'
    );
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    return fbo;
  }

  public compileProgram( vertSrc: string, fragSrc: string ): WebGLProgram {
    const { gl } = this;

    const vs = gl.createShader( gl.VERTEX_SHADER )!;
    gl.shaderSource( vs, vertSrc );
    gl.compileShader( vs );
    assert && assert( gl.getShaderParameter( vs, gl.COMPILE_STATUS ),
      `Vertex shader: ${gl.getShaderInfoLog( vs )}` );

    const fs = gl.createShader( gl.FRAGMENT_SHADER )!;
    gl.shaderSource( fs, fragSrc );
    gl.compileShader( fs );
    assert && assert( gl.getShaderParameter( fs, gl.COMPILE_STATUS ),
      `Fragment shader: ${gl.getShaderInfoLog( fs )}` );

    const program = gl.createProgram();
    gl.attachShader( program, vs );
    gl.attachShader( program, fs );
    gl.linkProgram( program );
    assert && assert( gl.getProgramParameter( program, gl.LINK_STATUS ),
      `Link: ${gl.getProgramInfoLog( program )}` );

    gl.deleteShader( vs );
    gl.deleteShader( fs );
    return program;
  }

  public fullscreenPass( program: WebGLProgram, outputFBO: WebGLFramebuffer | null,
                          width: number, height: number ): void {
    const { gl } = this;
    gl.useProgram( program );
    gl.bindFramebuffer( gl.FRAMEBUFFER, outputFBO );
    gl.viewport( 0, 0, width, height );
    gl.bindVertexArray( this.fullscreenVAO );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
  }

  public uploadRG32F( texture: WebGLTexture, width: number, height: number, data: Float32Array ): void {
    const { gl } = this;
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RG, gl.FLOAT, data );
  }

  public uploadR8( texture: WebGLTexture, width: number, height: number, data: Uint8Array ): void {
    const { gl } = this;
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RED, gl.UNSIGNED_BYTE, data );
  }

  public readPixelsRG( fbo: WebGLFramebuffer, x: number, y: number,
                       width: number, height: number, buffer: Float32Array ): void {
    const { gl } = this;
    gl.bindFramebuffer( gl.FRAMEBUFFER, fbo );
    gl.readPixels( x, y, width, height, gl.RG, gl.FLOAT, buffer );
  }
}
