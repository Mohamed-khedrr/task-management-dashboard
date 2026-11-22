import { EnvironmentProviders } from '@angular/core';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

const AppPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
      950: '#0a3880',
    },
    formField: {
      paddingX: '1rem',
      paddingY: '0.5rem',
      borderRadius: '4px',
      // Figma's toolbar controls: 32px tall with 13px text
      sm: {
        fontSize: 'var(--font-size-label)',
        paddingX: '1rem',
        paddingY: '0.4375rem',
      },
      focusRing: {
        width: '2px',
        style: 'solid',
        color: '{primary.color}',
        offset: '-1px',
        shadow: 'none',
      },
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
          contrastColor: '#ffffff',
        },
        text: {
          color: '#212121',
          mutedColor: '#757575',
        },
        content: {
          borderColor: '#e0e0e0',
        },
        formField: {
          color: '#212121',
          borderColor: '#e0e0e0',
          hoverBorderColor: '#757575',
          placeholderColor: '#757575',
          shadow: 'none',
        },
      },
    },
  },
});

export function provideTheme(): EnvironmentProviders {
  return providePrimeNG({
    theme: {
      preset: AppPreset,
      options: { darkModeSelector: false },
    },
  });
}
