// Copyright 2026, University of Colorado Boulder

/**
 * ESLint configuration for quantum-wave-interference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import simEslintConfig from '../perennial-alias/js/eslint/config/sim.eslint.config.mjs';
import banTSCommentConfig from '../perennial-alias/js/eslint/config/util/banTSCommentConfig.mjs';

export default [
  ...simEslintConfig,
  ...banTSCommentConfig,
  {
    rules: {
      'phet/require-fluent': 'error'
    }
  },
  {
    files: [ '**/*.ts' ],
    rules: {
      'phet/additional-bad-text': [
        'error',
        {
          forbiddenTextObjects: [

            // Spell out the full sim name in identifiers, comments, and strings rather than abbreviating it,
            // e.g. QuantumWaveInterferenceTransitionDescriber, not QWITransitionDescriber.
            { id: 'Use QuantumWaveInterference, not the abbreviation QWI', regex: /qwi/i }
          ]
        }
      ]
    }
  }
];