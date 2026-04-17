// Copyright 2026, University of Colorado Boulder

/**
 * Colors for the 'Quantum Wave Interference' sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Color from '../../../scenery/js/util/Color.js';
import ProfileColorProperty from '../../../scenery/js/util/ProfileColorProperty.js';
import quantumWaveInterference from '../quantumWaveInterference.js';

export default class QuantumWaveInterferenceColors {

  private constructor() {
    // Not intended for instantiation.
  }

  public static readonly screenBackgroundColorProperty = new ProfileColorProperty(
    quantumWaveInterference, 'screenBackgroundColor', {
      default: 'white'
    } );

  // Panel fill and stroke used by SourceControlPanel, SlitControlPanel, and ScreenSettingsPanel
  public static readonly panelFillProperty = new ProfileColorProperty(
    quantumWaveInterference, 'panelFill', {
      default: '#f4f4f4'
    } );

  public static readonly panelStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'panelStroke', {
      default: '#c1c1c1'
    } );

  // Particle (non-photon) beam color, shared by OverheadBeamNode and FrontFacingSlitNode
  public static readonly particleBeamColorProperty = new ProfileColorProperty(
    quantumWaveInterference, 'particleBeamColor', {
      default: new Color( 180, 180, 180 )
    } );

  // Slit cover fill color, shared by OverheadDoubleSlitNode and FrontFacingSlitNode
  public static readonly slitCoverFillProperty = new ProfileColorProperty(
    quantumWaveInterference, 'slitCoverFill', {
      default: '#3f3f3f'
    } );

  // Detector overlay colors, shared by OverheadDoubleSlitNode, FrontFacingSlitNode,
  // and WhichPathDetectorIndicatorNode
  public static readonly detectorOverlayFillProperty = new ProfileColorProperty(
    quantumWaveInterference, 'detectorOverlayFill', {
      default: new Color( 255, 200, 50 )
    } );

  public static readonly detectorOverlayStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'detectorOverlayStroke', {
      default: new Color( 180, 140, 0 )
    } );

  // Front-facing screen/slit stroke, shared by DetectorScreenNode and FrontFacingSlitNode
  public static readonly frontFacingStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'frontFacingStroke', {
      default: '#333'
    } );

  // Graph grid line color
  public static readonly graphGridLineColorProperty = new ProfileColorProperty(
    quantumWaveInterference, 'graphGridLineColor', {
      default: 'rgb(200,200,200)'
    } );

  public static readonly graphAccordionBoxStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'graphAccordionBoxStroke', {
      default: 'rgb(160,160,160)'
    } );

  // Snapshot/zoom button base color
  public static readonly snapshotButtonBaseColorProperty = new ProfileColorProperty(
    quantumWaveInterference, 'snapshotButtonBaseColor', {
      default: 'rgb(200,215,240)'
    } );

  // Particle histogram fill and stroke (non-photon hits mode)
  public static readonly particleHistogramFillProperty = new ProfileColorProperty(
    quantumWaveInterference, 'particleHistogramFill', {
      default: new Color( 100, 100, 180, 0.7 )
    } );

  public static readonly particleHistogramStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'particleHistogramStroke', {
      default: new Color( 50, 50, 130, 0.8 )
    } );

  // Scene radio button selected fill and stroke
  public static readonly sceneButtonSelectedFillProperty = new ProfileColorProperty(
    quantumWaveInterference, 'sceneButtonSelectedFill', {
      default: '#e6f4ff'
    } );

  public static readonly sceneButtonSelectedStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'sceneButtonSelectedStroke', {
      default: '#73bce1'
    } );

  // Snapshot/camera button base color
  public static readonly screenButtonBaseColorProperty = new ProfileColorProperty(
    quantumWaveInterference, 'screenButtonBaseColor', {
      default: '#E8E8E8'
    } );

  // Snapshot indicator dot colors
  public static readonly indicatorDotActiveFillProperty = new ProfileColorProperty(
    quantumWaveInterference, 'indicatorDotActiveFill', {
      default: '#555'
    } );

  public static readonly indicatorDotInactiveFillProperty = new ProfileColorProperty(
    quantumWaveInterference, 'indicatorDotInactiveFill', {
      default: 'white'
    } );

  public static readonly indicatorDotStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'indicatorDotStroke', {
      default: '#888'
    } );

  // Snapshot border stroke
  public static readonly snapshotStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'snapshotStroke', {
      default: '#555'
    } );

  // Zoom-callout lines between the mini symbol and the main wave region on the High Intensity screen
  public static readonly zoomCalloutStrokeProperty = new ProfileColorProperty(
    quantumWaveInterference, 'zoomCalloutStroke', {
      default: 'rgb(150,150,150)'
    } );
}
