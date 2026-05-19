// Copyright 2026, University of Colorado Boulder

/**
 * Tests for High Intensity semantic accessibility state, transition descriptions, and template rendering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PDOMUtils from '../../../../../scenery/js/accessibility/pdom/PDOMUtils.js';
import { render as litRender } from '../../../../../sherpa/lib/lit-core-3.3.1.min.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import HighIntensityAccessibleResponses from './HighIntensityAccessibleResponses.js';
import QWIAccessibleStateDescriber from './QWIAccessibleStateDescriber.js';
import QWIAccessibleStateTemplate from './QWIAccessibleStateTemplate.js';
import QWITransitionDescriber from './QWITransitionDescriber.js';

QUnit.module( 'QWIAccessibleState' );

const createModel = (): HighIntensityModel => new HighIntensityModel( { tandem: Tandem.OPT_OUT } );

const stepSceneToWavefrontFraction = ( model: HighIntensityModel, wavefrontFraction: number ): void => {
  const scene = model.sceneProperty.value;
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  scene.step( wavefrontFraction * scene.regionWidth / propagationSpeed );
};

QUnit.test( 'pattern kind follows slit configuration', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  assert.strictEqual( describer.getState().patternKind, 'doubleSlitInterference', 'both slits open produces interference' );

  scene.slitConfigurationProperty.value = 'leftCovered';
  assert.strictEqual( describer.getState().patternKind, 'singleSlitDiffraction', 'one covered slit produces single-slit diffraction' );

  scene.slitConfigurationProperty.value = 'leftDetector';
  assert.strictEqual( describer.getState().patternKind, 'whichPathDiffraction', 'slit detector produces which-path diffraction' );

  scene.slitConfigurationProperty.value = 'noBarrier';
  assert.strictEqual( describer.getState().patternKind, 'noBarrier', 'no barrier has its own state' );
} );

QUnit.test( 'transitions describe band spacing direction', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.isEmittingProperty.value = true;
  const beforeSeparation = describer.getState();
  scene.slitSeparationProperty.value = scene.slitSeparationProperty.range.max;
  const afterSeparation = describer.getState();
  assert.ok(
    QWITransitionDescriber.describe( { type: 'slitSeparationChanged' }, beforeSeparation, afterSeparation ).contextResponse!.includes( 'closer' ),
    'larger slit separation moves interference bands closer together'
  );

  scene.slitSeparationProperty.reset();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.min;
  const beforeWavelength = describer.getState();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.max;
  const afterWavelength = describer.getState();
  assert.ok(
    QWITransitionDescriber.describe( { type: 'wavelengthChanged' }, beforeWavelength, afterWavelength ).contextResponse!.includes( 'farther' ),
    'longer wavelength moves interference bands farther apart'
  );
} );

QUnit.test( 'source-off wavelength response does not describe visible interference bands', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  const before = describer.getState();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.max;
  const after = describer.getState();
  const response = QWITransitionDescriber.describe( { type: 'wavelengthChanged' }, before, after ).contextResponse!;

  assert.ok( response.includes( 'Turn on the source' ), 'source-off response tells the student how to observe the change' );
  assert.notOk( response.includes( 'Interference bands are' ), 'source-off response does not imply a visible pattern changed' );
} );

QUnit.test( 'particle type change emits one summary response', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const responses = new HighIntensityAccessibleResponses( model, describer );
  const emittedResponses: string[] = [];

  ( responses as unknown as { addAccessibleContextResponse: ( response: string ) => void } ).addAccessibleContextResponse = response => {
    emittedResponses.push( response );
  };

  model.sceneProperty.value = model.scenes[ 1 ];

  const particleTypeResponses = emittedResponses.filter( response => response.includes( 'Now experimenting with electrons' ) );
  assert.strictEqual( particleTypeResponses.length, 1, 'scene switch produces exactly one particle-type summary' );
  assert.ok( particleTypeResponses[ 0 ].includes( 'Source, slits, and screen settings updated.' ), 'summary uses the revised source-change language' );
} );

QUnit.test( 'wave progress follows source-on time and screen milestones', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.step( 1 );
  assert.strictEqual( describer.getState().waveProgress.stage, 'sourceOff', 'source-off state has no traveling wavefront' );

  scene.isEmittingProperty.value = true;
  assert.strictEqual( describer.getState().waveProgress.stage, 'travelingToSlits', 'newly started source begins at the source side' );
  assert.strictEqual( describer.getState().waveProgress.checkpoint, 'none', 'wave starts before the first checkpoint' );
  assert.strictEqual( describer.getState().waveProgress.wavefrontPercent, 0, 'progress is relative to source-on time' );

  const beforeQuarter = describer.getState();
  scene.slitConfigurationProperty.value = 'noBarrier';
  stepSceneToWavefrontFraction( model, 0.25 );
  const afterQuarter = describer.getState();
  assert.strictEqual( afterQuarter.waveProgress.checkpoint, 'quarter', 'wave announces the one-quarter checkpoint' );
  assert.ok(
    QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, beforeQuarter, afterQuarter ).contextResponse!.includes( 'one-quarter' ),
    'checkpoint response uses student-readable checkpoint language'
  );

  scene.slitConfigurationProperty.value = 'bothOpen';
  scene.clearScreen();
  scene.isEmittingProperty.value = true;

  const slitFraction = scene.slitPositionFractionProperty.value;
  stepSceneToWavefrontFraction( model, Math.max( 0, slitFraction - 0.1 ) );
  assert.strictEqual( describer.getState().waveProgress.stage, 'travelingToSlits', 'wave travels toward the slits first' );

  stepSceneToWavefrontFraction( model, 0.1 );
  assert.strictEqual( describer.getState().waveProgress.stage, 'atSlits', 'wave announces when it reaches the slits' );

  const beforeInterference = describer.getState();
  stepSceneToWavefrontFraction( model, 0.1 );
  const afterInterference = describer.getState();
  assert.strictEqual( afterInterference.waveProgress.stage, 'interferingAfterSlits', 'wave announces interference after both slits' );
  assert.ok(
    QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, beforeInterference, afterInterference ).contextResponse!.includes( 'interfering' ),
    'transition response describes the temporal interference event'
  );

  stepSceneToWavefrontFraction( model, 1 );
  assert.strictEqual( describer.getState().waveProgress.stage, 'hittingScreen', 'wave announces when it reaches the detector screen' );
} );

QUnit.test( 'model emits accessible-state ticks during temporal wave progress', assert => {
  const model = createModel();

  model.currentIsEmittingProperty.value = true;
  for ( let i = 0; i < 9; i++ ) {
    model.step( model.getNominalStepDt() );
  }
  assert.strictEqual( model.accessibleStateStepProperty.value, 0, 'accessible state waits for the configured frame interval' );

  model.step( model.getNominalStepDt() );
  assert.strictEqual( model.accessibleStateStepProperty.value, 1, 'accessible state tick emits after the configured frame interval' );

  model.reset();
  assert.strictEqual( model.accessibleStateStepProperty.value, 0, 'accessible state tick resets with the model' );
} );

QUnit.test( 'pattern complete response describes emerged interference pattern', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.isEmittingProperty.value = true;
  stepSceneToWavefrontFraction( model, 0.99 );
  scene.step( 0.05 );
  const beforeComplete = describer.getState();
  assert.strictEqual( beforeComplete.patternFormation, 'forming', 'pattern is forming after the wave reaches the screen' );

  scene.step( 2 );
  const afterComplete = describer.getState();
  assert.strictEqual( afterComplete.patternFormation, 'complete', 'pattern can reach the complete formation state' );

  const response = QWITransitionDescriber.describe( { type: 'patternFormationComplete' }, beforeComplete, afterComplete ).contextResponse!;
  assert.ok( response.includes( 'strong central maximum' ), 'complete response describes the central maximum' );
  assert.ok( response.includes( 'no intensity' ), 'complete response describes dark places beside the center' );
  assert.ok( response.includes( 'bright spots' ), 'complete response describes the bright interference regions' );
  assert.ok( response.includes( 'fading as you move away from the center' ), 'complete response describes the envelope fading from center' );
} );

QUnit.test( 'accessible template is readable and non-interactive', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const templateProperty = QWIAccessibleStateTemplate.createTemplateProperty( model, describer );
  const container = document.createElement( 'div' );

  litRender( templateProperty.value, container );

  assert.ok( container.textContent.includes( 'Source' ), 'template includes Source section' );
  assert.ok( container.textContent.includes( 'Detector pattern' ), 'template includes detector pattern section' );
  assert.ok( container.textContent.includes( 'Wave progress' ), 'template includes temporal wave progress section' );
  assert.ok( !PDOMUtils.hasDisallowedTemplateDescendant( container ), 'template has no disallowed interactive descendants' );

  templateProperty.dispose();
} );
