// Copyright 2026, University of Colorado Boulder

/**
 * SourceControlPanel is the shared panel for selecting source parameters.
 *
 * It owns the Panel shell and delegates the source-specific controls to smaller view classes:
 * - PhotonWavelengthControl for photon wavelength.
 * - ParticleVelocityControl for electron, neutron, and helium-atom speed.
 * - SourceStrengthControl for optional source intensity/emission rate.
 *
 * The panel creates one complete control subtree per scene, aligns all subtrees to the same width, then toggles
 * visibility as sceneProperty changes. Keeping each subtree alive preserves control state, while the panel height
 * follows the visible controls in the active scene.
 *
 * Generic over any scene type that has the required source properties, so the Experiment, High Intensity, and Single
 * Particles screens can share the same controls while supplying different scene models.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import createSourceControlPanelContent from './createSourceControlPanelContent.js';
import { SOURCE_CONTROL_SECTION_SPACING } from './SourceControlPanelConstants.js';
import SourceControlScene from './SourceControlScene.js';

/**
 * Options specific to SourceControlPanel that are not forwarded from PanelOptions.
 *
 * The two label overrides let each screen supply its own localized string for the source-strength slider.
 * Defaults are the shared sim strings; screens that display different terminology (e.g., "Emission Rate" vs
 * "Source Intensity") pass a replacement here.
 *
 * additionalContent, when provided, is placed below the source controls inside the panel (e.g., the Auto-Repeat
 * checkbox in the Single Particles screen). Null means no extra content.
 */
type SelfOptions = {
  photonSourceStrengthLabelStringProperty?: TReadOnlyProperty<string>;
  particleSourceStrengthLabelStringProperty?: TReadOnlyProperty<string>;
  additionalContent?: Node | null;
};

/**
 * Public options for SourceControlPanel. Callers must supply a tandem; all other options have defaults.
 */
export type SourceControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SourceControlPanel<T extends SourceControlScene> extends Panel {

  public constructor(
    sceneProperty: Property<T>,
    scenes: T[],
    sceneTandems: ReadonlyMap<object, Tandem> | null,
    providedOptions: SourceControlPanelOptions
  ) {
    const options = optionize<SourceControlPanelOptions, SelfOptions, PanelOptions>()(
      {
        isDisposable: false,
        xMargin: 10,
        yMargin: 10,
        fill: QuantumWaveInterferenceColors.panelFillProperty,
        stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
        align: 'center',
        minWidth: 160,
        photonSourceStrengthLabelStringProperty: QuantumWaveInterferenceFluent.sourceIntensityStringProperty,
        particleSourceStrengthLabelStringProperty: QuantumWaveInterferenceFluent.emissionRateStringProperty,
        additionalContent: null
      },
      providedOptions
    );

    const sourceContent = createSourceControlPanelContent(
      sceneProperty,
      scenes,
      options.tandem,
      sceneTandems,
      options.photonSourceStrengthLabelStringProperty,
      options.particleSourceStrengthLabelStringProperty
    );

    const panelContent = options.additionalContent ?
                         new VBox( {
                           spacing: SOURCE_CONTROL_SECTION_SPACING,
                           align: 'center',
                           minContentWidth: sourceContent.contentNode.width,
                           children: [ sourceContent.contentNode, options.additionalContent ]
                         } ) :
                         sourceContent.contentNode;

    const visibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'visibleProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Controls whether the source control panel is allowed to be visible. ' +
                           'The panel is automatically hidden when all controls for the active scene are hidden.'
    } );
    const hasVisibleContentProperty = options.additionalContent ?
                                      DerivedProperty.or( [
                                        sourceContent.hasVisibleContentProperty,
                                        options.additionalContent.visibleProperty
                                      ] ) :
                                      sourceContent.hasVisibleContentProperty;
    options.visibleProperty = DerivedProperty.and( [ visibleProperty, hasVisibleContentProperty ] );

    super( panelContent, options );
  }
}
