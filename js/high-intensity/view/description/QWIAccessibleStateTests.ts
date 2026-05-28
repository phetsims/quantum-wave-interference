// Copyright 2026, University of Colorado Boulder

/**
 * Tests for High Intensity semantic accessibility state, transition descriptions, and current-details rendering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TimeSpeed from '../../../../../scenery-phet/js/TimeSpeed.js';
import PDOMUtils from '../../../../../scenery/js/accessibility/pdom/PDOMUtils.js';
import { render as litRender } from '../../../../../sherpa/lib/lit-core-3.3.1.min.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import { DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD, DETECTOR_PATTERN_FORMATION_EASE_POWER, DETECTOR_PATTERN_FORMATION_TIME_CONSTANT } from '../../model/HighIntensitySceneModel.js';
import HighIntensityAccessibleResponses from './HighIntensityAccessibleResponses.js';
import QWIAccessibleStateDescriber from './QWIAccessibleStateDescriber.js';
import { formatSlitDescription } from './QWIAccessibleStateFormatters.js';
import QWIAccessibleStateTemplate from './QWIAccessibleStateTemplate.js';
import QWITransitionDescriber from './QWITransitionDescriber.js';

QUnit.module( 'QWIAccessibleState' );

const SOURCE_RESTARTED_TEXT = 'Source restarted.';
const GREEN_BEAM_TEXT = 'Green and black plane waves emanate from left.';
const RED_BEAM_TEXT = 'Red and black plane waves emanate from left.';
const GRAY_BEAM_TEXT = 'Gray and black plane waves emanate from left.';
const MODERATE_SPACING_TEXT = 'Wave peaks moderately spaced.';
const WIDE_SPACING_TEXT = 'Wave peaks somewhat far apart.';
const GREEN_WAVELENGTH_NM = 550;

const createModel = (): HighIntensityModel => new HighIntensityModel( { tandem: Tandem.OPT_OUT } );

const stepSceneToWavefrontFraction = ( model: HighIntensityModel, wavefrontFraction: number ): void => {
  const scene = model.sceneProperty.value;
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  scene.step( wavefrontFraction * scene.regionWidth / propagationSpeed );
};

const stepSceneUntilWavefrontReachesScreen = ( model: HighIntensityModel ): void => {
  const scene = model.sceneProperty.value;
  const dt = model.getNominalStepDt();
  for ( let i = 0; i < 600; i++ ) {
    scene.step( dt );
    if ( scene.hasWavefrontReachedScreen() ) {
      return;
    }
  }
  throw new Error( 'wavefront did not reach screen during test setup' );
};

const stepDetectorPatternFormationToFactor = ( model: HighIntensityModel, targetFactor: number ): void => {
  const scene = model.sceneProperty.value;
  const currentEasedFactor = Math.pow(
    scene.detectorPatternFormationFactorProperty.value,
    1 / DETECTOR_PATTERN_FORMATION_EASE_POWER
  );
  const targetEasedFactor = Math.pow( targetFactor, 1 / DETECTOR_PATTERN_FORMATION_EASE_POWER );
  const dt = -DETECTOR_PATTERN_FORMATION_TIME_CONSTANT * Math.log(
    ( 1 - targetEasedFactor ) / ( 1 - currentEasedFactor )
  );
  scene.step( dt );
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

QUnit.test( 'slit orientation controls left/right versus top/bottom description text', assert => {
  const leftRightCurrentDetails = QuantumWaveInterferenceFluent.a11y.screenSummary.currentDetails.format( {
    sourceType: 'photons',
    slitSetting: 'leftDetector',
    slitOrientation: 'leftRight',
    detectionMode: 'hits',
    isEmitting: 'true',
    isPlaying: 'true',
    isMaxHitsReached: 'false',
    hasHits: 'true'
  } );
  assert.ok( leftRightCurrentDetails.includes( 'detector on left slit' ), 'screen summary uses left slit for Experiment' );
  assert.notOk( leftRightCurrentDetails.includes( 'detector on top slit' ), 'screen summary does not mix in top slit for Experiment' );

  const topBottomCurrentDetails = QuantumWaveInterferenceFluent.a11y.screenSummary.currentDetails.format( {
    sourceType: 'photons',
    slitSetting: 'leftDetector',
    slitOrientation: 'topBottom',
    detectionMode: 'hits',
    isEmitting: 'true',
    isPlaying: 'true',
    isMaxHitsReached: 'false',
    hasHits: 'true'
  } );
  assert.ok( topBottomCurrentDetails.includes( 'detector on top slit' ), 'screen summary uses top slit for front-facing screens' );
  assert.notOk( topBottomCurrentDetails.includes( 'detector on left slit' ), 'screen summary does not mix in left slit for front-facing screens' );

  const leftRightSetupDetails = QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfiguration.format( {
    slitSetting: 'rightCovered',
    slitOrientation: 'leftRight'
  } );
  assert.ok( leftRightSetupDetails.includes( 'Right slit covered in barrier.' ), 'setup details use right slit for Experiment' );

  const topBottomSetupDetails = QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfiguration.format( {
    slitSetting: 'rightCovered',
    slitOrientation: 'topBottom'
  } );
  assert.ok( topBottomSetupDetails.includes( 'Bottom slit covered in barrier.' ), 'setup details use bottom slit for front-facing screens' );
} );

QUnit.test( 'temporally chained parameter changes describe reset instead of final pattern outcome', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.wavelengthProperty.value = GREEN_WAVELENGTH_NM;
  scene.isEmittingProperty.value = true;
  const beforeSeparation = describer.getState();
  scene.slitSeparationProperty.value = scene.slitSeparationProperty.range.max;
  const afterSeparation = describer.getState();
  const slitSeparationResponse = QWITransitionDescriber.describe( { type: 'slitSeparationChanged' }, beforeSeparation, afterSeparation ).contextResponse!;
  assert.ok( slitSeparationResponse.includes( SOURCE_RESTARTED_TEXT ), 'source-on slit separation response describes the immediate restart' );
  assert.ok( slitSeparationResponse.includes( GREEN_BEAM_TEXT ), 'source-on slit separation response describes the restarted beam' );
  assert.ok( slitSeparationResponse.includes( MODERATE_SPACING_TEXT ), 'source-on slit separation response describes the restarted spacing' );
  assert.notOk( slitSeparationResponse.includes( 'Interference bands' ), 'source-on slit separation response does not predict final band spacing' );

  scene.slitSeparationProperty.reset();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.min;
  const beforeWavelength = describer.getState();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.max;
  const afterWavelength = describer.getState();
  const wavelengthResponse = QWITransitionDescriber.describe( { type: 'wavelengthChanged' }, beforeWavelength, afterWavelength ).contextResponse!;
  assert.ok( wavelengthResponse.includes( SOURCE_RESTARTED_TEXT ), 'source-on wavelength response describes the immediate restart' );
  assert.ok( wavelengthResponse.includes( RED_BEAM_TEXT ), 'source-on wavelength response describes the restarted beam based on the new wavelength' );
  assert.ok( wavelengthResponse.includes( WIDE_SPACING_TEXT ), 'source-on wavelength response describes the restarted spacing based on the new wavelength' );
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

  photonScene.wavelengthProperty.value = photonScene.wavelengthProperty.range.max;
  const beforePhotons = describer.getState();
  photonScene.isEmittingProperty.value = true;
  const photonResponse = QWITransitionDescriber.describe( { type: 'sourceChanged' }, beforePhotons, describer.getState() ).contextResponse!;

  assert.ok( photonResponse.includes( 'Source started on normal speed.' ), 'source response describes clock speed' );
  assert.ok( photonResponse.includes( 'Red and black plane waves emanate from left.' ), 'photon source response describes plane waves' );
  assert.ok( photonResponse.includes( 'Wave peaks somewhat far apart.' ), 'red photon source response describes wide wave-peak spacing' );

  const electronModel = createModel();
  electronModel.sceneProperty.value = electronModel.scenes[ 1 ];
  const electronDescriber = new QWIAccessibleStateDescriber( electronModel );
  const electronScene = electronModel.sceneProperty.value;

  electronScene.velocityProperty.value = electronScene.velocityProperty.range.min;
  const beforeElectrons = electronDescriber.getState();
  electronScene.isEmittingProperty.value = true;
  const electronResponse = QWITransitionDescriber.describe( { type: 'sourceChanged' }, beforeElectrons, electronDescriber.getState() ).contextResponse!;

  assert.ok( electronResponse.includes( 'Gray and black plane waves emanate from left.' ), 'electron source response describes plane waves' );
  assert.ok( electronResponse.includes( 'Wave peaks somewhat far apart.' ), 'slow electron source response describes wide wave-peak spacing' );
} );

QUnit.test( 'source-on slit detector response does not spoil pattern outcome', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.wavelengthProperty.value = GREEN_WAVELENGTH_NM;
  scene.isEmittingProperty.value = true;
  const before = describer.getState();
  scene.slitConfigurationProperty.value = 'leftDetector';
  const response = QWITransitionDescriber.describe( { type: 'slitConfigurationChanged' }, before, describer.getState() ).contextResponse!;

  assert.ok( response.includes( SOURCE_RESTARTED_TEXT ), 'source-on slit change describes the immediate restart' );
  assert.ok( response.includes( GREEN_BEAM_TEXT ), 'source-on slit change describes the restarted beam' );
  assert.ok( response.includes( MODERATE_SPACING_TEXT ), 'source-on slit change describes the restarted spacing' );
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

QUnit.test( 'source-on particle type change uses restart response', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );

  model.scenes[ 1 ].isEmittingProperty.value = true;
  const before = describer.getState();
  model.sceneProperty.value = model.scenes[ 1 ];
  const response = QWITransitionDescriber.describe( { type: 'particleTypeChanged' }, before, describer.getState() ).contextResponse!;

  assert.ok( response.includes( SOURCE_RESTARTED_TEXT ), 'source-on particle type change describes the immediate restart' );
  assert.ok( response.includes( GRAY_BEAM_TEXT ), 'source-on particle type change describes the restarted beam based on the new source type' );
  assert.ok( response.includes( MODERATE_SPACING_TEXT ), 'source-on particle type change describes the restarted spacing' );
} );

QUnit.test( 'time speed remains in current details without context response', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const responses = new HighIntensityAccessibleResponses( model, describer );
  const emittedResponses: string[] = [];

  ( responses as unknown as { addAccessibleContextResponse: ( response: string ) => void } ).addAccessibleContextResponse = response => {
    emittedResponses.push( response );
  };

  model.timeSpeedProperty.value = TimeSpeed.SLOW;
  model.isPlayingProperty.value = true;

  assert.deepEqual( emittedResponses, [], 'time changes do not emit transition context responses' );

  const currentDetailsTemplateProperty = QWIAccessibleStateTemplate.createCurrentDetailsTemplateProperty( model, describer );
  const container = document.createElement( 'div' );

  litRender( currentDetailsTemplateProperty.value, container );

  assert.ok( container.textContent.includes( 'Time is running at slow speed.' ), 'current details still include time speed' );

  currentDetailsTemplateProperty.dispose();
} );

QUnit.test( 'clear button response describes wave area and source restart', assert => {
  const pausedModel = createModel();
  const pausedDescriber = new QWIAccessibleStateDescriber( pausedModel );
  const pausedResponses = new HighIntensityAccessibleResponses( pausedModel, pausedDescriber );
  const pausedEmittedResponses: string[] = [];

  ( pausedResponses as unknown as { addAccessibleContextResponse: ( response: string ) => void } ).addAccessibleContextResponse = response => {
    pausedEmittedResponses.push( response );
  };

  pausedModel.isPlayingProperty.value = false;
  pausedEmittedResponses.length = 0;
  pausedResponses.clearScreenAndEmitResponse( () => pausedModel.sceneProperty.value.clearScreen() );

  assert.strictEqual( pausedEmittedResponses.length, 1, 'paused clear response is emitted once' );
  assert.ok( pausedEmittedResponses[ 0 ].includes( 'Wave area cleared.' ), 'paused clear response describes the clear' );
  assert.ok( pausedEmittedResponses[ 0 ].includes( 'Sim still paused.' ), 'paused clear response confirms paused state' );
  assert.notOk( pausedEmittedResponses[ 0 ].includes( 'Source started.' ), 'paused clear response does not restart the source' );

  const runningModel = createModel();
  const runningDescriber = new QWIAccessibleStateDescriber( runningModel );
  const runningResponses = new HighIntensityAccessibleResponses( runningModel, runningDescriber );
  const runningEmittedResponses: string[] = [];

  ( runningResponses as unknown as { addAccessibleContextResponse: ( response: string ) => void } ).addAccessibleContextResponse = response => {
    runningEmittedResponses.push( response );
  };

  runningModel.sceneProperty.value.wavelengthProperty.value = GREEN_WAVELENGTH_NM;
  runningModel.isPlayingProperty.value = true;
  runningModel.currentIsEmittingProperty.value = true;
  runningEmittedResponses.length = 0;
  runningResponses.clearScreenAndEmitResponse( () => runningModel.sceneProperty.value.clearScreen() );

  assert.strictEqual( runningEmittedResponses.length, 1, 'running clear response is emitted once' );
  assert.ok( runningEmittedResponses[ 0 ].includes( 'Wave area cleared.' ), 'running clear response describes the clear' );
  assert.ok( runningEmittedResponses[ 0 ].includes( SOURCE_RESTARTED_TEXT ), 'running clear response describes the immediate restart' );
  assert.ok( runningEmittedResponses[ 0 ].includes( GREEN_BEAM_TEXT ), 'running clear response describes the restarted beam' );
  assert.ok( runningEmittedResponses[ 0 ].includes( MODERATE_SPACING_TEXT ), 'running clear response describes the restarted spacing' );
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
  stepSceneToWavefrontFraction( model, 0.25 );
  const afterQuarter = describer.getState();
  assert.strictEqual( afterQuarter.waveProgress.checkpoint, 'quarter', 'wave announces the one-quarter checkpoint' );
  assert.ok(
    QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, beforeQuarter, afterQuarter ).contextResponse!.includes( 'Wave approaching slits at fast speed.' ),
    'checkpoint response describes the approaching wave speed'
  );

  scene.slitConfigurationProperty.value = 'bothOpen';
  scene.clearScreen();
  scene.isEmittingProperty.value = true;

  const slitFraction = scene.slitPositionFractionProperty.value;
  stepSceneToWavefrontFraction( model, Math.max( 0, slitFraction - 0.1 ) );
  assert.strictEqual( describer.getState().waveProgress.stage, 'travelingToSlits', 'wave travels toward the slits first' );

  stepSceneToWavefrontFraction( model, 0.1 );
  assert.strictEqual( describer.getState().waveProgress.stage, 'atSlits', 'wave announces when it reaches the slits' );

  stepSceneToWavefrontFraction( model, 0.1 );
  assert.strictEqual( describer.getState().waveProgress.stage, 'atSlits', 'wave stays in the circular-waves description before the waves overlap' );

  const beforeInterference = describer.getState();
  stepSceneToWavefrontFraction( model, 0.1 );
  const afterInterference = describer.getState();
  assert.strictEqual( afterInterference.waveProgress.stage, 'interferingAfterSlits', 'wave announces interference after both slits' );
  assert.ok(
    QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, beforeInterference, afterInterference ).contextResponse!.includes( 'Circular waves overlap, creating checkered interference pattern where waves cancel or combine.' ),
    'transition response describes the temporal interference event'
  );

  stepSceneToWavefrontFraction( model, 1 );
  assert.strictEqual( describer.getState().waveProgress.stage, 'hittingScreen', 'wave announces when it reaches the detector screen' );
} );

QUnit.test( 'approaching-slits response describes qualitative wave speed', assert => {
  const model = createModel();
  model.sceneProperty.value = model.scenes[ 1 ];
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  const getResponse = (): string => {
    scene.clearScreen();
    scene.isEmittingProperty.value = true;
    const before = describer.getState();
    stepSceneToWavefrontFraction( model, 0.25 );
    return QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, before, describer.getState() ).contextResponse!;
  };

  scene.velocityProperty.value = scene.velocityProperty.range.min;
  assert.ok( getResponse().includes( 'Wave approaching slits at slow speed.' ), 'low slider speed uses slow description' );

  scene.velocityProperty.value = ( scene.velocityProperty.range.min + scene.velocityProperty.range.max ) / 2;
  assert.ok( getResponse().includes( 'Wave approaching slits at medium speed.' ), 'mid slider speed uses medium description' );

  scene.velocityProperty.value = scene.velocityProperty.range.max;
  assert.ok( getResponse().includes( 'Wave approaching slits at fast speed.' ), 'high slider speed uses fast description' );
} );

QUnit.test( 'slit detector wave progress describes visible setup without explaining', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.slitConfigurationProperty.value = 'leftDetector';
  scene.isEmittingProperty.value = true;

  const beforeDetectorRegion = describer.getState();
  stepSceneToWavefrontFraction( model, 0.7 );
  const response = QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, beforeDetectorRegion, describer.getState() ).contextResponse!;

  assert.ok( response.includes( 'detector over top slit' ), 'response describes detector position' );
  assert.ok( response.includes( 'Non-interfering circular waves emanate from the slits.' ), 'response describes the visible wave behavior' );
  assert.notOk( response.includes( 'Which-path information' ), 'response does not explain the concept for the student' );
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

  stepSceneToWavefrontFraction( model, 0.7 );
  model.accessibleStateStepProperty.value++;
  assert.strictEqual(
    emittedResponses.filter( response => response.includes( 'checkered interference pattern' ) ).length,
    1,
    'interference response is emitted when the circular waves overlap'
  );

  stepSceneToWavefrontFraction( model, 0.2 );
  model.accessibleStateStepProperty.value++;
  assert.strictEqual(
    emittedResponses.filter( response => response.includes( 'checkered interference pattern' ) ).length,
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
  stepSceneUntilWavefrontReachesScreen( model );
  stepDetectorPatternFormationToFactor( model, DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD - 1e-3 );
  const beforeComplete = describer.getState();
  assert.strictEqual( beforeComplete.patternFormation, 'forming', 'pattern is forming after the wave reaches the screen' );

  stepDetectorPatternFormationToFactor( model, DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD + 1e-3 );
  const afterComplete = describer.getState();
  assert.strictEqual( afterComplete.patternFormation, 'complete', 'pattern can reach the complete formation state' );

  const response = QWITransitionDescriber.describe( { type: 'patternFormationComplete' }, beforeComplete, afterComplete ).contextResponse!;
  assert.ok( response.includes( 'Detector screen stable' ), 'complete response describes the stable detector screen' );
  assert.ok( response.includes( 'medium-spaced equidistant bright spots' ), 'complete response describes the bright-spot spacing' );
  assert.ok( response.includes( 'brightest at center' ), 'complete response describes the center brightness' );

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
