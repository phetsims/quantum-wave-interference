// Copyright 2026, University of Colorado Boulder

/**
 * Tests for High Intensity semantic accessibility state, transition descriptions, and current-details rendering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PDOMUtils from '../../../../../scenery/js/accessibility/pdom/PDOMUtils.js';
import { render as litRender } from '../../../../../sherpa/lib/lit-core-3.3.1.min.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import HighIntensityAccessibleResponses from './HighIntensityAccessibleResponses.js';
import QWIAccessibleStateDescriber from './QWIAccessibleStateDescriber.js';
import { formatSlitDescription } from './QWIAccessibleStateFormatters.js';
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

QUnit.test( 'matter-wave slit separation uses readable units', assert => {
  const model = createModel();
  model.sceneProperty.value = model.scenes[ 1 ];
  const describer = new QWIAccessibleStateDescriber( model );
  const response = formatSlitDescription( describer.getState() );

  assert.ok( response.includes( 'nanometers' ), 'electron slit separation uses nanometers at readable precision' );
  assert.notOk( response.includes( '0 micrometers' ), 'electron slit separation is not rounded to zero micrometers' );
} );

QUnit.test( 'temporally chained parameter changes describe reset instead of final pattern outcome', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.isEmittingProperty.value = true;
  const beforeSeparation = describer.getState();
  scene.slitSeparationProperty.value = scene.slitSeparationProperty.range.max;
  const afterSeparation = describer.getState();
  const slitSeparationResponse = QWITransitionDescriber.describe( { type: 'slitSeparationChanged' }, beforeSeparation, afterSeparation ).contextResponse!;
  assert.ok( slitSeparationResponse.includes( 'wave area and detector screen clear' ), 'source-on slit separation response describes the immediate reset' );
  assert.notOk( slitSeparationResponse.includes( 'Interference bands' ), 'source-on slit separation response does not predict final band spacing' );

  scene.slitSeparationProperty.reset();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.min;
  const beforeWavelength = describer.getState();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.max;
  const afterWavelength = describer.getState();
  const wavelengthResponse = QWITransitionDescriber.describe( { type: 'wavelengthChanged' }, beforeWavelength, afterWavelength ).contextResponse!;
  assert.ok( wavelengthResponse.includes( 'wave area and detector screen clear' ), 'source-on wavelength response describes the immediate reset' );
  assert.notOk( wavelengthResponse.includes( 'Interference bands' ), 'source-on wavelength response does not predict final band spacing' );
} );

QUnit.test( 'source-off wavelength response does not describe visible interference bands', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  const before = describer.getState();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.max;
  const after = describer.getState();
  const response = QWITransitionDescriber.describe( { type: 'wavelengthChanged' }, before, after ).contextResponse!;

  assert.ok( response.includes( 'Wavelength changed.' ), 'source-off response reports only the immediate control change' );
  assert.notOk( response.includes( 'Interference bands are' ), 'source-off response does not imply a visible pattern changed' );
} );

QUnit.test( 'source started response describes beam appearance', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const photonScene = model.sceneProperty.value;

  photonScene.wavelengthProperty.value = photonScene.wavelengthProperty.range.min;
  const beforePhotons = describer.getState();
  photonScene.isEmittingProperty.value = true;
  const photonResponse = QWITransitionDescriber.describe( { type: 'sourceChanged' }, beforePhotons, describer.getState() ).contextResponse!;

  assert.ok( photonResponse.includes( 'continuous stream of photons' ), 'photon source response describes stream of photons' );
  assert.ok( photonResponse.includes( 'violet and black vertical stripes' ), 'photon source response describes wavelength color' );
  assert.ok( photonResponse.includes( 'tightly packed' ), 'violet photon source response describes tight wavefront spacing' );

  const electronModel = createModel();
  electronModel.sceneProperty.value = electronModel.scenes[ 1 ];
  const electronDescriber = new QWIAccessibleStateDescriber( electronModel );
  const electronScene = electronModel.sceneProperty.value;

  electronScene.velocityProperty.value = electronScene.velocityProperty.range.min;
  const beforeElectrons = electronDescriber.getState();
  electronScene.isEmittingProperty.value = true;
  const electronResponse = QWITransitionDescriber.describe( { type: 'sourceChanged' }, beforeElectrons, electronDescriber.getState() ).contextResponse!;

  assert.ok( electronResponse.includes( 'continuous stream of electrons' ), 'electron source response describes stream of electrons' );
  assert.ok( electronResponse.includes( 'gray and black vertical stripes' ), 'massive-particle source response describes gray and black wavefronts' );
  assert.ok( electronResponse.includes( 'somewhat far apart' ), 'slow electron source response describes wide wavefront spacing without comparison wording' );
} );

QUnit.test( 'source-on slit detector response does not spoil pattern outcome', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.isEmittingProperty.value = true;
  const before = describer.getState();
  scene.slitConfigurationProperty.value = 'leftDetector';
  const response = QWITransitionDescriber.describe( { type: 'slitConfigurationChanged' }, before, describer.getState() ).contextResponse!;

  assert.ok( response.includes( 'wave area and detector screen clear' ), 'source-on slit change describes the immediate reset' );
  assert.ok( response.includes( 'source starts emanating from the left again' ), 'source-on slit change describes the immediate beam restart' );
  assert.notOk( response.includes( 'removes double-slit interference' ), 'source-on slit detector response does not spoil the final pattern' );
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

QUnit.test( 'interference wave progress response does not repeat for checkpoint-only changes', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const responses = new HighIntensityAccessibleResponses( model, describer );
  const emittedResponses: string[] = [];

  ( responses as unknown as { addAccessibleContextResponse: ( response: string ) => void } ).addAccessibleContextResponse = response => {
    emittedResponses.push( response );
  };

  model.currentIsEmittingProperty.value = true;
  emittedResponses.length = 0;

  stepSceneToWavefrontFraction( model, 0.55 );
  model.accessibleStateStepProperty.value++;
  assert.strictEqual(
    emittedResponses.filter( response => response.includes( 'Overlapping wavefronts are interfering' ) ).length,
    1,
    'interference response is emitted when the wave first passes both slits'
  );

  stepSceneToWavefrontFraction( model, 0.2 );
  model.accessibleStateStepProperty.value++;
  assert.strictEqual(
    emittedResponses.filter( response => response.includes( 'Overlapping wavefronts are interfering' ) ).length,
    1,
    'interference response is not repeated when only the progress checkpoint changes'
  );
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

  const currentDetailsTemplateProperty = QWIAccessibleStateTemplate.createCurrentDetailsTemplateProperty( model, describer );
  const container = document.createElement( 'div' );
  litRender( currentDetailsTemplateProperty.value, container );

  assert.ok(
    container.textContent.includes( response ),
    'summary current details include the same emerged-pattern description as the context response'
  );

  currentDetailsTemplateProperty.dispose();
} );

QUnit.test( 'summary current details are readable template content', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const currentDetailsTemplateProperty = QWIAccessibleStateTemplate.createCurrentDetailsTemplateProperty( model, describer );
  const container = document.createElement( 'div' );

  litRender( currentDetailsTemplateProperty.value, container );

  const currentDetails = container.textContent;

  assert.ok( currentDetails.includes( 'Currently,' ), 'current details begin as summary state content' );
  assert.ok( currentDetails.includes( 'Source is off, so no wave is traveling.' ), 'current details include temporal wave progress' );
  assert.ok( currentDetails.includes( 'Source is off, so there is no pattern on the detector.' ), 'source-off current details do not describe a visible detector pattern' );
  assert.ok( currentDetails.includes( 'Detector screen view is active.' ), 'current details include display and tools state' );
  assert.notOk( currentDetails.includes( 'Current Experiment State' ), 'current details omit the former Play Area heading' );
  assert.notOk( currentDetails.includes( 'What to notice' ), 'current details omit the former notice heading' );
  assert.strictEqual( container.querySelectorAll( 'p' ).length, 6, 'current details use paragraph formatting' );
  assert.ok( container.querySelector( 'br' ), 'current details can use line break formatting inside a paragraph' );
  assert.strictEqual( container.querySelectorAll( 'h3, h4' ).length, 0, 'current details omit section headings' );
  assert.ok( !PDOMUtils.hasDisallowedTemplateDescendant( container ), 'current details template has no disallowed interactive descendants' );

  currentDetailsTemplateProperty.dispose();
} );
