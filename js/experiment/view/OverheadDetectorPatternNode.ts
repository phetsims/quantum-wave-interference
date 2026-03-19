// Copyright 2026, University of Colorado Boulder

/**
 * CanvasNode that renders the interference pattern on the overhead detector screen parallelogram.
 * Draws vertical bands whose opacity is proportional to the theoretical intensity at each position.
 * The node is clipped to the parallelogram shape so bands follow the perspective skew.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Shape from '../../../../kite/js/Shape.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Color from '../../../../scenery/js/util/Color.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import SceneModel from '../model/SceneModel.js';

export default class OverheadDetectorPatternNode extends CanvasNode {

  private readonly dx: number;
  private readonly dy: number;
  private readonly leftHeight: number;

  // Cached scene state for painting
  private isEmitting = false;
  private beamColor: Color = new Color( 255, 0, 0 );
  private intensityValues: number[] = [];
  private brightness = 0.5;
  private isHitsMode = false;

  // Opacity scale for Average Intensity mode: ramps up as data accumulates,
  // so the theoretical pattern builds up over time.
  private opacityScale = 0;

  // Pre-computed density bins for Hits mode, downsampled from the model's intensityBins.
  // This avoids the O(n) cost of iterating all hits each frame.
  private hitDensityBins: number[] = [];
  private hitDensityMax = 0;

  public constructor( dx: number, dy: number, leftHeight: number ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, dx, leftHeight + dy )
    } );

    this.dx = dx;
    this.dy = dy;
    this.leftHeight = leftHeight;

    // Clip to the parallelogram shape
    this.clipArea = new Shape()
      .moveTo( 0, 0 )
      .lineTo( 0, leftHeight )
      .lineTo( dx, leftHeight + dy )
      .lineTo( dx, dy )
      .close();
  }

  /**
   * Updates the cached pattern data from the current scene model, then repaints.
   */
  public updatePattern( sceneModel: SceneModel ): void {
    this.isEmitting = sceneModel.isEmittingProperty.value;
    this.brightness = sceneModel.screenBrightnessProperty.value;
    this.isHitsMode = sceneModel.detectionModeProperty.value === 'hits';

    // Determine beam color
    if ( sceneModel.sourceType === 'photons' ) {
      this.beamColor = VisibleColor.wavelengthToColor( sceneModel.wavelengthProperty.value );
    }
    else {
      this.beamColor = new Color( 255, 255, 255 );
    }

    // Compute intensity values for Average Intensity mode using the theoretical curve.
    // Like the graph (GraphAccordionBox), we use getIntensityAtPosition() for a smooth,
    // clean pattern that responds immediately to parameter changes (wavelength, slit
    // separation, etc.). The opacity scales with accumulated data so the pattern builds
    // up over time, matching the design requirement that time controls affect aggregation.
    const maxBin = sceneModel.intensityBinsMax;
    const NUM_BANDS = 50;
    this.intensityValues = [];
    const screenHalfWidth = sceneModel.screenHalfWidth;

    // Opacity scales with total accumulated hits using a logarithmic ramp, so the
    // pattern appears faintly at first and saturates as data accumulates.
    const totalHits = sceneModel.totalHitsProperty.value;
    this.opacityScale = Math.min( 1, Math.log10( totalHits + 1 ) / 2 );

    for ( let i = 0; i < NUM_BANDS; i++ ) {
      const fraction = ( i + 0.5 ) / NUM_BANDS;
      const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
      this.intensityValues.push( sceneModel.getIntensityAtPosition( physicalX ) );
    }

    // Downsample model intensity bins to density bins for Hits mode rendering.
    // This avoids the O(n) cost of mapping and re-binning all hits each frame.
    if ( this.isHitsMode && maxBin > 0 ) {
      const NUM_DENSITY_BINS = 50;
      const modelBins = sceneModel.intensityBins;
      const modelBinCount = modelBins.length;
      const binsPerDensityBin = modelBinCount / NUM_DENSITY_BINS;
      this.hitDensityBins = [];
      this.hitDensityMax = 0;
      for ( let i = 0; i < NUM_DENSITY_BINS; i++ ) {
        const startBin = Math.floor( i * binsPerDensityBin );
        const endBin = Math.floor( ( i + 1 ) * binsPerDensityBin );
        let sum = 0;
        for ( let j = startBin; j < endBin; j++ ) {
          sum += modelBins[ j ];
        }
        this.hitDensityBins.push( sum );
        if ( sum > this.hitDensityMax ) {
          this.hitDensityMax = sum;
        }
      }
    }
    else {
      this.hitDensityBins = [];
      this.hitDensityMax = 0;
    }

    this.invalidatePaint();
  }

  /**
   * Renders the interference pattern bands on the canvas.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    if ( !this.isEmitting && this.opacityScale < 0.01 && this.hitDensityMax === 0 ) {
      return;
    }

    const dx = this.dx;
    const dy = this.dy;
    const leftHeight = this.leftHeight;
    const r = this.beamColor.red;
    const g = this.beamColor.green;
    const b = this.beamColor.blue;

    if ( this.isHitsMode ) {
      // In Hits mode, render density bands from pre-computed bins
      if ( this.hitDensityMax === 0 ) {
        return;
      }

      const NUM_BINS = this.hitDensityBins.length;
      const bandWidth = dx / NUM_BINS;
      for ( let i = 0; i < NUM_BINS; i++ ) {
        if ( this.hitDensityBins[ i ] > 0 ) {
          const alpha = Math.min( 1, ( this.hitDensityBins[ i ] / this.hitDensityMax ) * this.brightness );
          context.fillStyle = `rgba(${r},${g},${b},${alpha})`;

          // Draw a vertical strip that follows the parallelogram skew
          const x = i * bandWidth;
          const topY = ( x / dx ) * dy;
          context.fillRect( x, topY, bandWidth + 0.5, leftHeight );
        }
      }
    }
    else {
      // Average Intensity mode: draw smooth theoretical intensity bands whose opacity
      // scales with accumulated data. The theoretical curve provides clean, immediate
      // feedback while the opacity build-up matches the time-dependent aggregation.
      const NUM_BANDS = this.intensityValues.length;
      const bandWidth = dx / NUM_BANDS;

      if ( this.opacityScale < 0.01 ) {
        return;
      }

      for ( let i = 0; i < NUM_BANDS; i++ ) {
        const intensity = this.intensityValues[ i ];
        const alpha = intensity * this.brightness * this.opacityScale;

        if ( alpha > 0.01 ) {
          context.fillStyle = `rgba(${r},${g},${b},${alpha})`;

          // Draw a vertical strip that follows the parallelogram skew
          const x = i * bandWidth;
          const topY = ( x / dx ) * dy;
          context.fillRect( x, topY, bandWidth + 0.5, leftHeight );
        }
      }
    }
  }
}

quantumWaveInterference.register( 'OverheadDetectorPatternNode', OverheadDetectorPatternNode );
