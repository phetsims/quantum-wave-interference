// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenNode is the front-facing view of the detector screen. It displays either individual hit dots
 * (in Hits mode) or an intensity glow pattern (in Average Intensity mode) on a black rounded rectangle.
 * Hit rendering uses CanvasNode for efficient drawing of potentially thousands of dots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import DetectionMode from '../model/DetectionMode.js';
import SceneModel from '../model/SceneModel.js';
import SourceType from '../model/SourceType.js';

// Dimensions of the front-facing detector screen display
const SCREEN_WIDTH = 217;
const SCREEN_HEIGHT = 250;
const SCREEN_CORNER_RADIUS = 10;

// Hit dot radius in view coordinates
const HIT_DOT_RADIUS = 1.5;

// Number of horizontal bins for the intensity display
const INTENSITY_BINS = 200;

type SelfOptions = EmptySelfOptions;

type DetectorScreenNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class DetectorScreenNode extends Node {

  private readonly screenCanvasNode: DetectorScreenCanvasNode;

  public constructor( sceneModel: SceneModel, providedOptions: DetectorScreenNodeOptions ) {

    const options = optionize<DetectorScreenNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    // Black rounded rectangle background representing the detector screen
    const backgroundRect = new Rectangle( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CORNER_RADIUS, SCREEN_CORNER_RADIUS, {
      fill: 'black',
      stroke: '#333',
      lineWidth: 1
    } );
    this.addChild( backgroundRect );

    // Canvas node for rendering hits and intensity, clipped to the screen area
    this.screenCanvasNode = new DetectorScreenCanvasNode( sceneModel, SCREEN_WIDTH, SCREEN_HEIGHT );
    this.screenCanvasNode.clipArea = backgroundRect.shape!;
    this.addChild( this.screenCanvasNode );

    // Hit count text - only visible in Hits mode
    const hitCountText = new Text( '', {
      font: new PhetFont( 13 ),
      fill: 'white',
      maxWidth: 100
    } );
    hitCountText.right = SCREEN_WIDTH - 6;
    hitCountText.top = -hitCountText.height - 4;
    this.addChild( hitCountText );

    // Scale label showing the physical size of the screen
    const scaleLabelText = new Text( '', {
      font: new PhetFont( 11 ),
      fill: 'black',
      maxWidth: 80
    } );
    scaleLabelText.left = 0;
    scaleLabelText.top = -scaleLabelText.height - 4;
    this.addChild( scaleLabelText );

    // Update scale label based on the screen half-width
    const updateScaleLabel = () => {
      const halfWidth = sceneModel.screenHalfWidth;
      const fullWidth = halfWidth * 2;

      // Format the width with appropriate units
      if ( fullWidth >= 0.01 ) {
        scaleLabelText.string = `${toFixed( fullWidth * 100, 1 )} cm`;
      }
      else if ( fullWidth >= 1e-4 ) {
        scaleLabelText.string = `${toFixed( fullWidth * 1e3, 2 )} mm`;
      }
      else {
        scaleLabelText.string = `${toFixed( fullWidth * 1e6, 1 )} μm`;
      }
      scaleLabelText.left = 0;
      scaleLabelText.bottom = -4;
    };
    updateScaleLabel();

    // Update the hit count text and canvas when hits change
    const updateDisplay = () => {
      if ( sceneModel.detectionModeProperty.value === DetectionMode.HITS ) {
        hitCountText.string = `${sceneModel.totalHitsProperty.value} hits`;
        hitCountText.right = SCREEN_WIDTH - 6;
        hitCountText.bottom = -4;
        hitCountText.visible = true;
      }
      else {
        hitCountText.visible = false;
      }
      this.screenCanvasNode.invalidatePaint();
    };

    sceneModel.hitsChangedEmitter.addListener( updateDisplay );
    sceneModel.detectionModeProperty.link( () => updateDisplay() );
    sceneModel.screenBrightnessProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // Eraser button to clear the screen - positioned to the right of the screen, top-aligned
    const eraserButton = new EraserButton( {
      iconWidth: 18,
      listener: () => sceneModel.clearScreen(),
      right: SCREEN_WIDTH + 30,
      top: 0,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      tandem: providedOptions.tandem.createTandem( 'eraserButton' )
    } );
    this.addChild( eraserButton );
  }
}

/**
 * Inner CanvasNode that renders hit dots or intensity bands on the detector screen.
 */
class DetectorScreenCanvasNode extends CanvasNode {

  private readonly sceneModel: SceneModel;

  public constructor( sceneModel: SceneModel, width: number, height: number ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );

    this.sceneModel = sceneModel;
  }

  /**
   * Renders either hit dots or intensity bands depending on the detection mode.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const sceneModel = this.sceneModel;
    const brightness = sceneModel.screenBrightnessProperty.value;

    if ( sceneModel.detectionModeProperty.value === DetectionMode.HITS ) {
      this.paintHits( context, brightness );
    }
    else {
      this.paintIntensity( context, brightness );
    }
  }

  /**
   * Renders individual hit dots on the canvas.
   */
  private paintHits( context: CanvasRenderingContext2D, brightness: number ): void {
    const hits = this.sceneModel.hits;
    if ( hits.length === 0 ) {
      return;
    }

    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT;

    // Determine the hit dot color based on source type
    const hitColor = this.getHitColor( brightness );
    context.fillStyle = hitColor;

    for ( let i = 0; i < hits.length; i++ ) {
      const hit = hits[ i ];

      // Map normalized coordinates [-1, 1] to view coordinates
      const viewX = ( hit.x + 1 ) / 2 * width;
      const viewY = ( hit.y + 1 ) / 2 * height;

      context.beginPath();
      context.arc( viewX, viewY, HIT_DOT_RADIUS, 0, Math.PI * 2 );
      context.fill();
    }
  }

  /**
   * Renders the average intensity pattern as vertical glowing bands.
   */
  private paintIntensity( context: CanvasRenderingContext2D, brightness: number ): void {
    if ( !this.sceneModel.isEmittingProperty.value && this.sceneModel.hits.length === 0 ) {
      return;
    }

    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT;
    const binWidth = width / INTENSITY_BINS;

    for ( let i = 0; i < INTENSITY_BINS; i++ ) {
      // Map bin center to normalized x position [-1, 1]
      const normalizedX = ( ( i + 0.5 ) / INTENSITY_BINS ) * 2 - 1;

      // Convert to physical position on screen
      const physicalX = normalizedX * this.sceneModel.screenHalfWidth;

      // Get the theoretical intensity at this position
      const intensity = this.sceneModel.getIntensityAtPosition( physicalX );

      // Apply brightness control
      const alpha = intensity * brightness;

      if ( alpha > 0.01 ) {
        const color = this.getIntensityColor( alpha );
        context.fillStyle = color;
        context.fillRect( i * binWidth, 0, binWidth + 0.5, height );
      }
    }
  }

  /**
   * Returns the CSS color string for a hit dot based on the source type and brightness.
   */
  private getHitColor( brightness: number ): string {
    const sourceType = this.sceneModel.sourceType;

    if ( sourceType === SourceType.PHOTONS ) {
      // Use wavelength-based color for photons
      const wavelength = this.sceneModel.wavelengthProperty.value;
      const rgb = wavelengthToRGB( wavelength );
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${brightness})`;
    }
    else {
      // White dots for particles
      return `rgba(255,255,255,${brightness})`;
    }
  }

  /**
   * Returns the CSS color string for an intensity band based on the source type and alpha.
   */
  private getIntensityColor( alpha: number ): string {
    const sourceType = this.sceneModel.sourceType;

    if ( sourceType === SourceType.PHOTONS ) {
      const wavelength = this.sceneModel.wavelengthProperty.value;
      const rgb = wavelengthToRGB( wavelength );
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
    }
    else {
      // White glow for particles
      return `rgba(255,255,255,${alpha})`;
    }
  }
}

/**
 * Converts a visible light wavelength (380-780 nm) to an RGB color.
 * Based on Dan Bruton's algorithm.
 */
function wavelengthToRGB( wavelength: number ): { r: number; g: number; b: number } {
  let r = 0;
  let g = 0;
  let b = 0;

  if ( wavelength >= 380 && wavelength < 440 ) {
    r = -( wavelength - 440 ) / ( 440 - 380 );
    g = 0;
    b = 1;
  }
  else if ( wavelength >= 440 && wavelength < 490 ) {
    r = 0;
    g = ( wavelength - 440 ) / ( 490 - 440 );
    b = 1;
  }
  else if ( wavelength >= 490 && wavelength < 510 ) {
    r = 0;
    g = 1;
    b = -( wavelength - 510 ) / ( 510 - 490 );
  }
  else if ( wavelength >= 510 && wavelength < 580 ) {
    r = ( wavelength - 510 ) / ( 580 - 510 );
    g = 1;
    b = 0;
  }
  else if ( wavelength >= 580 && wavelength < 645 ) {
    r = 1;
    g = -( wavelength - 645 ) / ( 645 - 580 );
    b = 0;
  }
  else if ( wavelength >= 645 && wavelength <= 780 ) {
    r = 1;
    g = 0;
    b = 0;
  }

  // Intensity factor for edges of visible spectrum
  let factor = 1;
  if ( wavelength >= 380 && wavelength < 420 ) {
    factor = 0.3 + 0.7 * ( wavelength - 380 ) / ( 420 - 380 );
  }
  else if ( wavelength >= 700 && wavelength <= 780 ) {
    factor = 0.3 + 0.7 * ( 780 - wavelength ) / ( 780 - 700 );
  }

  return {
    r: Utils.roundSymmetric( 255 * r * factor ),
    g: Utils.roundSymmetric( 255 * g * factor ),
    b: Utils.roundSymmetric( 255 * b * factor )
  };
}

quantumWaveInterference.register( 'DetectorScreenNode', DetectorScreenNode );
