// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenViewDescription owns the Experiment screen's PDOM-only content and heading groups.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TimeSpeed from '../../../../../scenery-phet/js/TimeSpeed.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import { showsDoubleSlitInterferencePattern } from '../../../common/model/SlitConfiguration.js';
import BandAnalysis from '../../../common/view/description/BandAnalysis.js';
import { formatLiveHitsDescription } from '../../../common/view/description/DetectorScreenDescriptionFormatter.js';
import ExperimentSetupDetailsNode from '../../../common/view/description/ExperimentSetupDetailsNode.js';
import formatSourceStoppedResponse from '../../../common/view/description/formatSourceStoppedResponse.js';
import type SceneRadioButtonGroup from '../../../common/view/SceneRadioButtonGroup.js';
import type SourceControlPanel from '../../../common/view/SourceControlPanel.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import type SceneModel from '../../model/SceneModel.js';
import type OverheadEmitterNode from '../OverheadEmitterNode.js';
import type ScreenSettingsPanel from '../ScreenSettingsPanel.js';
import type SlitControlPanel from '../SlitControlPanel.js';
import ExperimentDetectorScreenDetailsNode from './ExperimentDetectorScreenDetailsNode.js';
import formatExperimentDetectorPatternResponse from './formatExperimentDetectorPatternResponse.js';

type ClockSpeedDescription = 'slow' | 'normal' | 'fast';

// Response-group key so that rapid wavelength/speed/slit-separation changes self-interrupt rather than flooding
// the speech queue; only the most recent band-spacing change is spoken.
const BAND_SPACING_RESPONSE_GROUP = 'quantum-wave-interference-experiment-band-spacing';
const HIT_STAGE_RESPONSE_GROUP = 'quantum-wave-interference-experiment-hit-stage';

function getClockSpeedDescription( model: ExperimentModel ): ClockSpeedDescription {
  const timeSpeed = model.timeSpeedProperty.value;
  return timeSpeed === TimeSpeed.SLOW ? 'slow' :
         timeSpeed === TimeSpeed.NORMAL ? 'normal' :
         timeSpeed === TimeSpeed.FAST ? 'fast' :
         ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();
}

export default class ExperimentScreenViewDescription extends Node {

  public readonly detectorScreenAndExperimentDetailsHeadingNode: Node;
  public readonly sourceHeadingNode: Node;
  public readonly slitsHeadingNode: Node;
  public readonly detectorScreenHeadingNode: Node;

  public constructor(
    model: ExperimentModel,
    overheadEmitterNode: OverheadEmitterNode,
    sourceControlPanel: SourceControlPanel<SceneModel>,
    sceneRadioButtonGroup: SceneRadioButtonGroup<SceneModel>,
    slitControlPanel: SlitControlPanel,
    detectorScreenPDOMNodes: Node[],
    screenSettingsPanel: ScreenSettingsPanel
  ) {

    super();

    const sourceStartedResponseNode = new Node();
    this.addChild( sourceStartedResponseNode );
    model.currentIsEmittingProperty.lazyLink( isEmitting => {
      if ( !isEmitting ) {
        sourceStartedResponseNode.addAccessibleContextResponse(
          formatSourceStoppedResponse( model.currentDetectionModeProperty.value, model.currentTotalHitsProperty.value ),
          { flush: true }
        );
        return;
      }

      sourceStartedResponseNode.addAccessibleContextResponse(
        QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.sourceStarted.format( {
          isPlaying: model.isPlayingProperty.value ? 'true' : 'false',
          timeSpeed: getClockSpeedDescription( model )
        } ),
        { flush: true }
      );

      if ( !model.isPlayingProperty.value ) {
        return;
      }

      sourceStartedResponseNode.addAccessibleContextResponse(
        model.currentDetectionModeProperty.value === 'intensity' ?
        formatExperimentDetectorPatternResponse( model ) :
        QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.hitsRadioButton.accessibleContextResponse.format( {
          isEmitting: 'true'
        } )
      );
    } );

    const maxHitsReachedResponseNode = new Node();
    this.addChild( maxHitsReachedResponseNode );
    model.scenes.forEach( scene => {
      scene.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
        if ( isMaxHitsReached ) {
          maxHitsReachedResponseNode.addAccessibleContextResponse(
            QuantumWaveInterferenceFluent.a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty,
            { responseGroup: 'quantum-wave-interference-experiment-max-hits-reached' }
          );
        }
      } );
    } );

    const hitStageResponseNode = new Node();
    this.addChild( hitStageResponseNode );

    let previousTotalHits = model.currentTotalHitsProperty.value;
    let previousHitStage = BandAnalysis.getHitStage( previousTotalHits );

    const syncHitStageBaseline = () => {
      previousTotalHits = model.currentTotalHitsProperty.value;
      previousHitStage = BandAnalysis.getHitStage( previousTotalHits );
    };

    model.currentTotalHitsProperty.lazyLink( totalHits => {
      const scene = model.sceneProperty.value;
      const slitSetting = model.currentSlitConfigurationProperty.value;
      const isDoubleSlit = showsDoubleSlitInterferencePattern( slitSetting );
      const hitStage = BandAnalysis.getHitStage( totalHits );

      if (
        model.currentDetectionModeProperty.value !== 'hits' ||
        totalHits <= previousTotalHits ||
        hitStage === previousHitStage
      ) {
        syncHitStageBaseline();
        return;
      }

      const analysis = BandAnalysis.analyzeTheoreticalPattern(
        scene,
        scene.fullScreenHalfWidth
      );
      const spatialDescription = BandAnalysis.formatSpatialDescription(
        analysis,
        isDoubleSlit,
        model.isRulerVisibleProperty.value,
        false
      );

      previousTotalHits = totalHits;
      previousHitStage = hitStage;

      hitStageResponseNode.addAccessibleContextResponse(
        formatLiveHitsDescription( hitStage, isDoubleSlit, false, analysis, spatialDescription ), {
          responseGroup: HIT_STAGE_RESPONSE_GROUP
        }
      );
    } );

    model.sceneProperty.lazyLink( syncHitStageBaseline );
    model.currentDetectionModeProperty.lazyLink( syncHitStageBaseline );
    model.currentSlitConfigurationProperty.lazyLink( syncHitStageBaseline );
    model.currentWavelengthProperty.lazyLink( syncHitStageBaseline );
    model.currentParticleSpeedProperty.lazyLink( syncHitStageBaseline );
    model.currentSlitSeparationProperty.lazyLink( syncHitStageBaseline );
    model.currentScreenDistanceProperty.lazyLink( syncHitStageBaseline );

    // Announce how the double-slit fringe spacing responds to wavelength (photon scenes), particle speed (matter
    // scenes), and slit-separation changes — but only while both slits are open, the source is on, and the detector
    // screen shows intensity. The barrier-screen-distance slider already reports its own band-spacing effect, so it
    // is intentionally excluded here.
    const bandSpacingResponseNode = new Node();
    this.addChild( bandSpacingResponseNode );

    // Per-parameter baselines, compared against the latest value to derive the change direction. They are resynced
    // (without announcing) whenever the active scene changes, so switching particle type never announces a spacing
    // change. activeScene is updated only by the sceneProperty listener below; the DynamicProperty handlers run
    // before that listener during a scene switch, so they detect the switch via isSceneSwitchInFlight() and skip.
    let activeScene = model.sceneProperty.value;
    let previousWavelength = model.currentWavelengthProperty.value;
    let previousParticleSpeed = model.currentParticleSpeedProperty.value;
    let previousSlitSeparation = model.currentSlitSeparationProperty.value;

    const bandSpacingConditionsMet = () =>
      model.currentSlitConfigurationProperty.value === 'bothOpen' &&
      model.currentIsEmittingProperty.value &&
      model.currentDetectionModeProperty.value === 'intensity';

    // True while a scene switch is in flight: the current* DynamicProperties have already jumped to the new scene's
    // values but activeScene still references the previous scene. Used to suppress announcements caused by switching.
    const isSceneSwitchInFlight = () => model.sceneProperty.value !== activeScene;

    model.sceneProperty.lazyLink( scene => {
      activeScene = scene;
      previousWavelength = model.currentWavelengthProperty.value;
      previousParticleSpeed = model.currentParticleSpeedProperty.value;
      previousSlitSeparation = model.currentSlitSeparationProperty.value;
    } );

    model.currentWavelengthProperty.lazyLink( wavelength => {
      if ( isSceneSwitchInFlight() ) { return; }
      const increased = wavelength > previousWavelength;
      const changed = wavelength !== previousWavelength;
      previousWavelength = wavelength;
      if ( changed && activeScene.sourceType === 'photons' && bandSpacingConditionsMet() ) {
        bandSpacingResponseNode.addAccessibleContextResponse(
          QuantumWaveInterferenceFluent.a11y.wavelengthSlider.bandSpacingContextResponse.format( { trend: increased ? 'increased' : 'decreased' } ),
          { responseGroup: BAND_SPACING_RESPONSE_GROUP }
        );
      }
    } );

    model.currentParticleSpeedProperty.lazyLink( particleSpeed => {
      if ( isSceneSwitchInFlight() ) { return; }
      const increased = particleSpeed > previousParticleSpeed;
      const changed = particleSpeed !== previousParticleSpeed;
      previousParticleSpeed = particleSpeed;
      if ( changed && activeScene.sourceType !== 'photons' && bandSpacingConditionsMet() ) {
        bandSpacingResponseNode.addAccessibleContextResponse(
          QuantumWaveInterferenceFluent.a11y.particleSpeedSlider.bandSpacingContextResponse.format( { trend: increased ? 'increased' : 'decreased' } ),
          { responseGroup: BAND_SPACING_RESPONSE_GROUP }
        );
      }
    } );

    model.currentSlitSeparationProperty.lazyLink( slitSeparation => {
      if ( isSceneSwitchInFlight() ) { return; }
      const increased = slitSeparation > previousSlitSeparation;
      const changed = slitSeparation !== previousSlitSeparation;
      previousSlitSeparation = slitSeparation;
      if ( changed && bandSpacingConditionsMet() ) {
        bandSpacingResponseNode.addAccessibleContextResponse(
          QuantumWaveInterferenceFluent.a11y.slitSeparationSlider.bandSpacingContextResponse.format( { trend: increased ? 'increased' : 'decreased' } ),
          { responseGroup: BAND_SPACING_RESPONSE_GROUP }
        );
      }
    } );

    const detectorScreenDetailsNode = new ExperimentDetectorScreenDetailsNode( model );
    this.addChild( detectorScreenDetailsNode );

    const experimentSetupDetailsListNode = new ExperimentSetupDetailsNode( model, model.currentSlitConfigurationProperty, {
      screenDistanceProperty: model.currentScreenDistanceProperty,
      leadingParagraphStringProperty:
      QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.experimentDetailsLeadingParagraphStringProperty,
      includeSourceEmitter: false,
      includeDetectionMode: false,
      includeSlitWidth: true
    } );
    this.addChild( experimentSetupDetailsListNode );

    // NOTE: see other duplicate in
    // quantum-wave-interference/js/common/view/description/QuantumWaveInterferenceScreenViewDescription.ts.
    // Heading nodes for PDOM navigation. Each groups related controls under a heading so screen reader users can jump
    // between major sections with heading shortcuts.
    this.detectorScreenAndExperimentDetailsHeadingNode = new Node( {
      accessibleHeading:
      QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.detectorScreenAndExperimentDetailsHeadingStringProperty
    } );
    this.addChild( this.detectorScreenAndExperimentDetailsHeadingNode );

    this.sourceHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.sourceHeadingStringProperty
    } );
    this.addChild( this.sourceHeadingNode );

    this.slitsHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.slitsHeadingStringProperty
    } );
    this.addChild( this.slitsHeadingNode );

    this.detectorScreenHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.detectorScreenHeadingStringProperty
    } );
    this.addChild( this.detectorScreenHeadingNode );

    // Play Area focus order, organized under headings for screen reader navigation.
    this.detectorScreenAndExperimentDetailsHeadingNode.pdomOrder = [
      detectorScreenDetailsNode,
      experimentSetupDetailsListNode
    ];

    this.sourceHeadingNode.pdomOrder = [
      ...overheadEmitterNode.emitterNodes,
      sourceControlPanel,
      sceneRadioButtonGroup
    ];

    this.slitsHeadingNode.pdomOrder = [ slitControlPanel ];

    this.detectorScreenHeadingNode.pdomOrder = [
      ...detectorScreenPDOMNodes,
      screenSettingsPanel
    ];
  }
}
