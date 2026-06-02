// Copyright 2026, University of Colorado Boulder

/**
 * Tests for High Intensity semantic accessibility state, transition descriptions, and current-details rendering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TimeSpeed from '../../../../../scenery-phet/js/TimeSpeed.js';
import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import { render as litRender } from '../../../../../sherpa/lib/lit-core-3.3.1.min.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import BandAnalysis from '../../../common/view/description/BandAnalysis.js';
import { formatIntensityDescription, formatLiveHitsDescription } from '../../../common/view/description/DetectorScreenDescriptionFormatter.js';
import DetectorScreenDescriber from '../../../common/view/description/DetectorScreenDescriber.js';
import QuantumWaveInterferenceScreenSummaryContent from '../../../common/view/description/QuantumWaveInterferenceScreenSummaryContent.js';
import QuantumWaveInterferenceScreenViewDescription from '../../../common/view/description/QuantumWaveInterferenceScreenViewDescription.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import { DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD, DETECTOR_PATTERN_FORMATION_EASE_POWER, DETECTOR_PATTERN_FORMATION_TIME_CONSTANT } from '../../model/HighIntensitySceneModel.js';
import SingleParticlesModel from '../../../single-particles/model/SingleParticlesModel.js';
import HighIntensityAccessibleResponses from './HighIntensityAccessibleResponses.js';
import QWIAccessibleStateDescriber from './QWIAccessibleStateDescriber.js';
import { formatSlitDescription } from './QWIAccessibleStateFormatters.js';
import QWIAccessibleStateTemplate from './QWIAccessibleStateTemplate.js';
import QWITransitionDescriber from './QWITransitionDescriber.js';

QUnit.module( 'QWIAccessibleState' );

const SOURCE_RESTARTED_TEXT = 'Source restarted.';
const GREEN_BEAM_TEXT = 'Green and black plane wave fronts move right from the source.';
const RED_BEAM_TEXT = 'Red and black plane wave fronts move right from the source.';
const GRAY_BEAM_TEXT = 'Gray and black plane wave fronts move right from the source.';
const MODERATE_SPACING_TEXT = 'Wave peaks moderately spaced.';
const WIDE_SPACING_TEXT = 'Wave peaks somewhat far apart.';
const GREEN_WAVELENGTH_NM = 550;

const createModel = (): HighIntensityModel => new HighIntensityModel( { tandem: Tandem.OPT_OUT } );

const createSingleParticlesModel = (): SingleParticlesModel => new SingleParticlesModel( { tandem: Tandem.OPT_OUT } );

const createHighIntensityScreenSummaryContent = ( model: HighIntensityModel ): QuantumWaveInterferenceScreenSummaryContent =>
  new QuantumWaveInterferenceScreenSummaryContent(
    model,
    model.currentSlitConfigurationProperty,
    {
      detectionMode: model.currentDetectionModeProperty,
      slitOrientation: 'topBottom',
      detectorScreenHasPatternProperty: DerivedProperty.deriveAny(
        [
          model.sceneProperty,
          model.currentIsEmittingProperty,
          model.currentDetectionModeProperty,
          model.currentTotalHitsProperty,
          model.accessibleStateStepProperty
        ],
        () => model.currentDetectionModeProperty.value === 'averageIntensity' ?
              model.currentIsEmittingProperty.value && model.sceneProperty.value.hasWavefrontReachedScreen() :
              model.currentTotalHitsProperty.value > 0
      )
    }
  );

const renderAccessibleTemplateText = ( node: Node ): string => {
  const container = document.createElement( 'div' );
  litRender( node.accessibleTemplate, container );
  const textContent = container.textContent || '';
  litRender( null, container );
  return textContent;
};

const getAccessibleString = ( value: unknown ): string => typeof value === 'string' ? value : ( value as { value: string } ).value;

const getExperimentSetupDetailsText = ( screenViewDescription: QuantumWaveInterferenceScreenViewDescription ): string => {
  const experimentSetupPDOMOrder = screenViewDescription.experimentSetupHeadingNode.pdomOrder as Node[];
  return renderAccessibleTemplateText( experimentSetupPDOMOrder[ 1 ] );
};

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
  assert.strictEqual( describer.getState().patternKind, 'singleSlitDiffraction', 'one covered slit produces a one-slit pattern kind' );

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
  assert.notOk( slitSeparationResponse.includes( 'Experiment changed. Previous hits cleared.' ), 'source-on slit separation response omits redundant cleared-data text' );
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
  assert.notOk( wavelengthResponse.includes( 'Experiment changed. Previous hits cleared.' ), 'source-on wavelength response omits redundant cleared-data text' );
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
  assert.ok( response.includes( 'Experiment changed. Previous hits cleared.' ), 'source-off wavelength response describes cleared data' );
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
  assert.ok( photonResponse.includes( 'Red and black plane wave fronts move right from the source.' ), 'photon source response describes plane wave fronts' );
  assert.ok( photonResponse.includes( 'Wave peaks somewhat far apart.' ), 'red photon source response describes wide wave-peak spacing' );

  const electronModel = createModel();
  electronModel.sceneProperty.value = electronModel.scenes[ 1 ];
  const electronDescriber = new QWIAccessibleStateDescriber( electronModel );
  const electronScene = electronModel.sceneProperty.value;

  electronScene.velocityProperty.value = electronScene.velocityProperty.range.min;
  const beforeElectrons = electronDescriber.getState();
  electronScene.isEmittingProperty.value = true;
  const electronResponse = QWITransitionDescriber.describe( { type: 'sourceChanged' }, beforeElectrons, electronDescriber.getState() ).contextResponse!;

  assert.ok( electronResponse.includes( 'Gray and black plane wave fronts move right from the source.' ), 'electron source response describes plane wave fronts' );
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
  assert.notOk( response.includes( 'Experiment changed. Previous hits cleared.' ), 'source-on slit detector response omits redundant cleared-data text' );
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

QUnit.test( 'source stopped response distinguishes hits from intensity pattern', assert => {
  const hitsModel = createModel();
  const hitsDescriber = new QWIAccessibleStateDescriber( hitsModel );
  const hitsScene = hitsModel.sceneProperty.value;

  hitsScene.detectionModeProperty.value = 'hits';
  hitsScene.isEmittingProperty.value = true;
  hitsScene.totalHitsProperty.value = 20;
  const beforeHitsStop = hitsDescriber.getState();
  hitsScene.isEmittingProperty.value = false;
  const hitsResponse = QWITransitionDescriber.describe( { type: 'sourceChanged' }, beforeHitsStop, hitsDescriber.getState() ).contextResponse!;

  assert.ok( hitsResponse.includes( 'Source stopped. Wave display clears. Hits remain.' ), 'hits-mode source stop preserves hits in response' );
  assert.notOk( hitsResponse.includes( 'Intensity pattern cleared.' ), 'hits-mode source stop does not say intensity pattern cleared' );

  const intensityModel = createModel();
  const intensityDescriber = new QWIAccessibleStateDescriber( intensityModel );
  const intensityScene = intensityModel.sceneProperty.value;

  intensityScene.detectionModeProperty.value = 'averageIntensity';
  intensityScene.isEmittingProperty.value = true;
  const beforeIntensityStop = intensityDescriber.getState();
  intensityScene.isEmittingProperty.value = false;
  const intensityResponse = QWITransitionDescriber.describe( { type: 'sourceChanged' }, beforeIntensityStop, intensityDescriber.getState() ).contextResponse!;

  assert.ok( intensityResponse.includes( 'Source stopped. Wave display clears. Intensity pattern cleared.' ), 'intensity-mode source stop describes cleared intensity pattern' );
  assert.notOk( intensityResponse.includes( 'Hits remain.' ), 'intensity-mode source stop does not mention retained hits' );
} );

QUnit.test( 'clearing responses are limited to data-clearing parameter changes', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  const beforeSlitConfiguration = describer.getState();
  scene.slitConfigurationProperty.value = 'noBarrier';
  const slitConfigurationResponse = QWITransitionDescriber.describe( { type: 'slitConfigurationChanged' }, beforeSlitConfiguration, describer.getState() ).contextResponse!;
  assert.ok( slitConfigurationResponse.includes( 'Experiment changed. Previous hits cleared.' ), 'barrier configuration response describes cleared hits' );

  scene.slitConfigurationProperty.value = 'bothOpen';
  const beforeSlitSeparation = describer.getState();
  scene.slitSeparationProperty.value = scene.slitSeparationProperty.range.max;
  const slitSeparationResponse = QWITransitionDescriber.describe( { type: 'slitSeparationChanged' }, beforeSlitSeparation, describer.getState() ).contextResponse!;
  assert.ok( slitSeparationResponse.includes( 'Experiment changed. Previous hits cleared.' ), 'slit separation response describes cleared hits' );

  const beforeWavelength = describer.getState();
  scene.wavelengthProperty.value = scene.wavelengthProperty.range.max;
  const wavelengthResponse = QWITransitionDescriber.describe( { type: 'wavelengthChanged' }, beforeWavelength, describer.getState() ).contextResponse!;
  assert.ok( wavelengthResponse.includes( 'Experiment changed. Previous hits cleared.' ), 'wavelength response describes cleared hits' );

  const beforeWaveDisplay = describer.getState();
  scene.photonWaveDisplayModeProperty.value = 'timeAveragedIntensity';
  const waveDisplayResponse = QWITransitionDescriber.describe( { type: 'waveDisplayChanged' }, beforeWaveDisplay, describer.getState() ).contextResponse!;
  assert.ok( waveDisplayResponse.includes( 'Wave display changed to Amplitude.' ), 'wave display response describes display-only change' );
  assert.notOk( waveDisplayResponse.includes( 'Previous hits cleared.' ), 'wave display response does not say hits cleared' );

  const beforeDisplayMode = describer.getState();
  model.isIntensityGraphVisibleProperty.value = true;
  const displayModeResponse = QWITransitionDescriber.describe( { type: 'displayModeChanged' }, beforeDisplayMode, describer.getState() ).contextResponse!;
  assert.ok( displayModeResponse.includes( 'Graph shown.' ), 'screen/graph response describes display-only change' );
  assert.notOk( displayModeResponse.includes( 'Previous hits cleared.' ), 'screen/graph response does not say hits cleared' );
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
    QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, beforeQuarter, afterQuarter ).contextResponse!.includes( 'Plane wave fronts move right from the source toward the slits at fast speed.' ),
    'checkpoint response describes the plane wave fronts and speed'
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
    QWITransitionDescriber.describe( { type: 'waveProgressChanged' }, beforeInterference, afterInterference ).contextResponse!.includes( 'Overlapping waves add and cancel, forming bright bands.' ),
    'transition response describes the temporal bright-band formation event'
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
  assert.ok( getResponse().includes( 'Plane wave fronts move right from the source toward the slits at slow speed.' ), 'low slider speed uses slow description' );

  scene.velocityProperty.value = ( scene.velocityProperty.range.min + scene.velocityProperty.range.max ) / 2;
  assert.ok( getResponse().includes( 'Plane wave fronts move right from the source toward the slits at medium speed.' ), 'mid slider speed uses medium description' );

  scene.velocityProperty.value = scene.velocityProperty.range.max;
  assert.ok( getResponse().includes( 'Plane wave fronts move right from the source toward the slits at fast speed.' ), 'high slider speed uses fast description' );
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

  assert.ok( response.includes( 'Detection events occur.' ), 'response describes aggregate detector behavior' );
  assert.ok( response.includes( 'Waves emerge from one slit at a time.' ), 'response describes aggregate wave behavior' );
  assert.ok( response.includes( 'Waves from the two slits do not interact.' ), 'response describes absent wave interaction' );
  assert.notOk( response.includes( 'detector over top slit' ), 'response does not narrate detector-position details here' );
  assert.notOk( response.includes( 'Which-path information' ), 'response does not explain the concept for the student' );
} );

QUnit.test( 'no-barrier hit-stage responses describe scattered hits instead of bands', assert => {
  const model = createModel();
  const describer = new QWIAccessibleStateDescriber( model );
  const scene = model.sceneProperty.value;

  scene.slitConfigurationProperty.value = 'noBarrier';
  scene.detectionModeProperty.value = 'hits';

  scene.totalHitsProperty.value = 10;
  const beforeEmerging = describer.getState();
  scene.totalHitsProperty.value = 20;
  const emergingResponse = QWITransitionDescriber.describe( { type: 'hitStageChanged' }, beforeEmerging, describer.getState() ).contextResponse!;

  assert.ok( emergingResponse.includes( 'Hits pattern is now showing evenly scattered hits.' ), 'no-barrier emerging hits describe scattered hits' );
  assert.notOk( emergingResponse.includes( 'forming faint bands' ), 'no-barrier emerging hits do not describe faint bands' );

  const beforeClear = describer.getState();
  scene.totalHitsProperty.value = 60;
  const clearResponse = QWITransitionDescriber.describe( { type: 'hitStageChanged' }, beforeClear, describer.getState() ).contextResponse!;

  assert.ok( clearResponse.includes( 'Hits pattern is now showing evenly scattered hits.' ), 'no-barrier clear hits describe scattered hits' );
  assert.notOk( clearResponse.includes( 'showing evenly spaced bands' ), 'no-barrier clear hits do not describe evenly spaced bands' );

  const noBarrierHitsDescription = formatLiveHitsDescription(
    'clear',
    false,
    true,
    BandAnalysis.analyzeTheoreticalPattern( scene, scene.regionWidth / 2 ),
    ''
  );
  assert.ok( noBarrierHitsDescription.includes( 'Evenly scattered hits appear across the detector screen.' ), 'no-barrier detector-screen paragraph describes scattered hits' );
  assert.notOk( noBarrierHitsDescription.includes( 'broad central area' ), 'no-barrier detector-screen paragraph does not use one-slit language' );

  scene.detectionModeProperty.value = 'averageIntensity';
  scene.isEmittingProperty.value = true;
  stepSceneUntilWavefrontReachesScreen( model );
  stepDetectorPatternFormationToFactor( model, DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD + 1e-3 );
  const noBarrierIntensityResponse = QWITransitionDescriber.describe( {
    type: 'patternFormationComplete'
  }, beforeClear, describer.getState() ).contextResponse!;

  assert.ok(
    noBarrierIntensityResponse.includes( 'Uniform glow from plane wave fronts.' ),
    'no-barrier intensity response describes uniform glow from plane wave fronts'
  );
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
    emittedResponses.filter( response => response.includes( 'Overlapping waves add and cancel, forming bright bands.' ) ).length,
    1,
    'bright-band response is emitted when the circular waves overlap'
  );

  stepSceneToWavefrontFraction( model, 0.2 );
  model.accessibleStateStepProperty.value++;
  assert.strictEqual(
    emittedResponses.filter( response => response.includes( 'Overlapping waves add and cancel, forming bright bands.' ) ).length,
    1,
    'bright-band response is not repeated when only the progress checkpoint changes'
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
  assert.ok( response.includes( 'Evenly spaced bright bands form across the screen. Bands are medium-spaced.' ), 'complete response describes bright-band spacing' );
  assert.ok( response.includes( 'Center band is brightest.' ), 'complete response describes the center brightness' );
  assert.notOk( response.includes( 'equidistant' ), 'complete response avoids equidistant language' );
  assert.notOk( response.includes( 'spots' ), 'complete response avoids spots language' );

  const currentDetailsTemplateProperty = QWIAccessibleStateTemplate.createCurrentDetailsTemplateProperty( model, describer );
  const container = document.createElement( 'div' );
  litRender( currentDetailsTemplateProperty.value, container );

  assert.ok(
    container.textContent.includes( response ),
    'summary current details include the same emerged-pattern description as the context response'
  );

  currentDetailsTemplateProperty.dispose();
} );

QUnit.test( 'high-intensity screen summary current details are compact', assert => {
  const model = createModel();
  const screenSummaryContent = createHighIntensityScreenSummaryContent( model );

  const currentDetails = screenSummaryContent.getVoicingDetailsString()!.trim();

  assert.ok( currentDetails.includes( 'Currently,' ), 'current details include compact summary state content' );
  assert.ok( currentDetails.includes( 'source is off. Detector screen is empty.' ), 'current details summarize source and detector state' );
  assert.notOk( currentDetails.includes( 'Source is off, so no wave is traveling.' ), 'current details omit temporal wave-progress paragraphs' );
  assert.notOk( currentDetails.includes( 'Detector screen view is active.' ), 'current details omit display and tools state' );
  assert.notOk( currentDetails.includes( 'Current Experiment State' ), 'current details omit the former Play Area heading' );
  assert.notOk( currentDetails.includes( 'What to notice' ), 'current details omit the former notice heading' );

  screenSummaryContent.dispose();
} );

QUnit.test( 'high-intensity screen summary waits for wave to reach detector screen', assert => {
  const model = createModel();
  const screenSummaryContent = createHighIntensityScreenSummaryContent( model );

  model.currentIsEmittingProperty.value = true;
  const beforeWaveArrivalDetails = screenSummaryContent.getVoicingDetailsString()!.trim();
  assert.ok( beforeWaveArrivalDetails.includes( 'Detector screen is empty.' ), 'source-on summary reports empty detector before wave arrival' );
  assert.notOk( beforeWaveArrivalDetails.includes( 'Detector screen shows intensity pattern.' ), 'source-on summary does not announce intensity pattern before wave arrival' );

  stepSceneUntilWavefrontReachesScreen( model );
  model.accessibleStateStepProperty.value++;
  const afterWaveArrivalDetails = screenSummaryContent.getVoicingDetailsString()!.trim();
  assert.ok( afterWaveArrivalDetails.includes( 'Detector screen shows intensity pattern.' ), 'summary announces intensity pattern after wave arrival' );

  screenSummaryContent.dispose();
} );

QUnit.test( 'detector screen description uses qualitative band spacing and envelope', assert => {
  const model = createModel();
  const scene = model.sceneProperty.value;

  scene.slitSeparationProperty.value = scene.slitSeparationProperty.range.max;
  scene.slitPositionFractionProperty.value = scene.slitPositionFractionProperty.range.max;

  const analysis = BandAnalysis.analyzeTheoreticalPattern( scene, scene.regionWidth / 2 );
  const envelopeAnalysis = BandAnalysis.analyzeEnvelopeHeuristic( scene )!;
  const intensityDescription = formatIntensityDescription( true, false, analysis, '' );
  const expectedEnvelopeDescription = envelopeAnalysis.category === 'clusteringIntoTwoDistinctSections' ?
                                      'clustering into two distinct sections, directly across from slits' :
                                      envelopeAnalysis.category === 'clusteringIntoTwoFaintSections' ?
                                      'clustering into two faint sections, directly across from slits' :
                                      'brightest band at center';

  assert.ok( intensityDescription.includes( 'Evenly spaced bright bands form across the screen.' ), 'intensity description uses qualitative band-spacing language' );
  assert.notOk( intensityDescription.includes( 'alternating bright and dark vertical bands' ), 'intensity description avoids band-count framing' );
  assert.notOk( intensityDescription.includes( `${analysis.bandCount}` ), 'intensity description avoids band counts' );
  assert.ok( intensityDescription.includes( expectedEnvelopeDescription ), 'intensity description respects shared envelope heuristic category' );

  const developingHitsDescription = formatLiveHitsDescription( 'developing', true, false, analysis, '' );
  assert.ok( developingHitsDescription.includes( 'Hits form evenly spaced bands' ), 'hits description includes accumulated-hit formation layer' );
  assert.ok( developingHitsDescription.includes( 'Bands are' ), 'hits description also includes qualitative pattern spacing once bands are developing' );
} );

QUnit.test( 'detector screen description waits for wave arrival', assert => {
  const model = createModel();
  const detectorScreenDescriber = new DetectorScreenDescriber(
    model.sceneProperty,
    new BooleanProperty( false ),
    model.sceneProperty.derived( scene => scene.regionWidth / 2 ),
    model.accessibleStateStepProperty
  );

  model.currentIsEmittingProperty.value = true;

  assert.ok(
    detectorScreenDescriber.descriptionProperty.value.includes( 'Detector screen is empty.' ),
    'detector screen description remains empty while source-on wavefront is still traveling'
  );
  assert.notOk(
    detectorScreenDescriber.descriptionProperty.value.includes( 'Evenly spaced bright bands' ),
    'detector screen description does not announce bands before wave arrival'
  );

  stepSceneUntilWavefrontReachesScreen( model );
  model.accessibleStateStepProperty.value++;

  assert.ok(
    detectorScreenDescriber.descriptionProperty.value.includes( 'Evenly spaced bright bands' ),
    'detector screen description announces bands after wave arrival'
  );
} );

QUnit.test( 'high-intensity play area includes experiment setup details', assert => {
  const model = createModel();
  const screenViewDescription = new QuantumWaveInterferenceScreenViewDescription(
    model,
    model.currentSlitConfigurationProperty,
    {
      detectionModeProperty: model.currentDetectionModeProperty,
      slitOrientation: 'topBottom',
      sourceNodes: [ new Node() ],
      slitNodes: [ new Node() ],
      detectorScreenControlNodes: [ new Node() ]
    }
  );

  const experimentSetupPDOMOrder = screenViewDescription.experimentSetupHeadingNode.pdomOrder as Node[];
  assert.strictEqual( experimentSetupPDOMOrder.length, 2, 'experiment setup heading begins with detector screen and details descriptions' );
  assert.ok(
    getAccessibleString( experimentSetupPDOMOrder[ 0 ].accessibleParagraph ).includes( 'Detector screen' ),
    'detector screen description paragraph is first'
  );

  const experimentSetupDetails = getExperimentSetupDetailsText( screenViewDescription );

  assert.ok( experimentSetupDetails.includes( 'Current experimental details:' ), 'details list has leading paragraph' );
  assert.ok( experimentSetupDetails.includes( 'Photon Source Emitter is off.' ), 'details list includes source state' );
  assert.ok( experimentSetupDetails.includes( 'Screen Detection set to Intensity Mode.' ), 'details list includes detection mode' );
  assert.ok( experimentSetupDetails.includes( 'Wavelength is' ), 'details list includes wavelength' );
  assert.ok( experimentSetupDetails.includes( 'Both slits open in barrier.' ), 'details list includes slit configuration' );
  assert.ok( experimentSetupDetails.includes( 'Slit Separation distance is' ), 'details list includes slit separation' );
  assert.notOk( experimentSetupDetails.includes( 'Distance from double-slit barrier to detector screen' ), 'details list omits screen distance' );

  screenViewDescription.dispose();
} );

QUnit.test( 'single-particles summary and play area details remain compact', assert => {
  const model = createSingleParticlesModel();
  const screenSummaryContent = new QuantumWaveInterferenceScreenSummaryContent(
    model,
    model.currentSlitConfigurationProperty,
    {
      detectionMode: 'hits',
      slitOrientation: 'topBottom',
      detectorScreenHasPatternProperty: model.currentTotalHitsProperty.derived( totalHits => totalHits > 0 )
    }
  );

  const currentDetails = screenSummaryContent.getVoicingDetailsString()!.trim();

  assert.ok( currentDetails.includes( 'Currently,' ), 'single-particles summary uses compact current details' );
  assert.ok( currentDetails.includes( 'source is off. Detector screen is empty.' ), 'single-particles summary reports source and detector state' );
  assert.notOk( currentDetails.includes( 'Source is off, so no wave is traveling.' ), 'single-particles summary omits high-intensity temporal template content' );

  model.currentIsEmittingProperty.value = true;
  const beforeHitDetails = screenSummaryContent.getVoicingDetailsString()!.trim();
  assert.ok( beforeHitDetails.includes( 'Detector screen has no hits.' ), 'single-particles summary reports no hits while packet is still propagating' );
  assert.notOk( beforeHitDetails.includes( 'Detector screen shows hits pattern.' ), 'single-particles summary does not announce hits pattern before a hit' );

  model.sceneProperty.value.totalHitsProperty.value = 1;
  const afterHitDetails = screenSummaryContent.getVoicingDetailsString()!.trim();
  assert.ok( afterHitDetails.includes( 'Detector screen shows hits pattern.' ), 'single-particles summary announces hits pattern after first hit' );

  const screenViewDescription = new QuantumWaveInterferenceScreenViewDescription(
    model,
    model.currentSlitConfigurationProperty,
    {
      slitOrientation: 'topBottom',
      sourceNodes: [ new Node() ],
      slitNodes: [ new Node() ],
      detectorScreenControlNodes: [ new Node() ]
    }
  );
  const experimentSetupDetails = getExperimentSetupDetailsText( screenViewDescription );

  assert.ok( experimentSetupDetails.includes( 'Current experimental details:' ), 'single-particles details list has leading paragraph' );
  assert.ok( experimentSetupDetails.includes( 'Photon Source Emitter is on.' ), 'single-particles details list includes source state' );
  assert.ok( experimentSetupDetails.includes( 'Wavelength is' ), 'single-particles details list includes wavelength' );
  assert.ok( experimentSetupDetails.includes( 'Both slits open in barrier.' ), 'single-particles details list includes slit configuration' );
  assert.ok( experimentSetupDetails.includes( 'Slit Separation distance is' ), 'single-particles details list includes slit separation' );
  assert.notOk( experimentSetupDetails.includes( 'Screen Detection set to' ), 'single-particles details list omits detection mode' );
  assert.notOk( experimentSetupDetails.includes( 'Distance from double-slit barrier to detector screen' ), 'single-particles details list omits screen distance' );

  screenViewDescription.dispose();
  screenSummaryContent.dispose();
} );
