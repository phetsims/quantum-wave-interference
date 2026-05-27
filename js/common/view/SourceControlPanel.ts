// Copyright 2026, University of Colorado Boulder

/**
 * SourceControlPanel is the shared panel for selecting source parameters.
 *
 * It owns the Panel shell and delegates the source-specific controls to smaller view classes:
 * - PhotonWavelengthControl for photon wavelength.
 * - ParticleVelocityControl for electron, neutron, and helium-atom speed.
 * - SourceIntensityControl for optional source intensity/emission rate.
 *
 * The panel creates one complete control subtree per scene, aligns all subtrees to the same size, then toggles
 * visibility as sceneProperty changes. Keeping each subtree alive preserves control state and prevents layout shifts
 * when the source type changes.
 *
 * Generic over any scene type that has the required source properties, so the Experiment, High Intensity, and Single
 * Particles screens can share the same controls while supplying different scene models.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import createSourceControlPanelContent from './createSourceControlPanelContent.js';
import linkSceneVisibility from './linkSceneVisibility.js';
import SourceControlScene from './SourceControlScene.js';
import { SOURCE_CONTROL_SECTION_SPACING } from './SourceControlPanelConstants.js';

export type { default as SourceControlScene } from './SourceControlScene.js';

type SelfOptions = {
  photonIntensityLabelStringProperty?: TReadOnlyProperty<string>;
  particleIntensityLabelStringProperty?: TReadOnlyProperty<string>;
  additionalContent?: Node | null;
};

type SourceControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SourceControlPanel<T extends SourceControlScene> extends Panel {

  public constructor(
    sceneProperty: Property<T>,
    scenes: T[],
    providedOptions: SourceControlPanelOptions
  ) {
    const options = optionize<SourceControlPanelOptions, SelfOptions, PanelOptions>()(
      {
        isDisposable: false,
        xMargin: 10,
        yMargin: 10,
        fill: QuantumWaveInterferenceColors.panelFillProperty,
        stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
        minWidth: 160,
        photonIntensityLabelStringProperty: QuantumWaveInterferenceFluent.sourceIntensityStringProperty,
        particleIntensityLabelStringProperty: QuantumWaveInterferenceFluent.emissionRateStringProperty,
        additionalContent: null
      },
      providedOptions
    );

    const sourceContent = createSourceControlPanelContent(
      sceneProperty,
      scenes,
      options.tandem,
      options.photonIntensityLabelStringProperty,
      options.particleIntensityLabelStringProperty
    );

    const panelContent = options.additionalContent ?
                         new VBox( {
                           spacing: SOURCE_CONTROL_SECTION_SPACING,
                           align: 'left',
                           children: [ sourceContent.contentNode, options.additionalContent ]
                         } ) :
                         sourceContent.contentNode;

    super( panelContent, options );

    linkSceneVisibility( sceneProperty, scenes, sourceContent.sceneNodes );
  }
}
