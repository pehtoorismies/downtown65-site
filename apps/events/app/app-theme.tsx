import {
  createTheme,
  DEFAULT_THEME,
  MantineProvider,
  type MantineProviderProps,
} from '@mantine/core'

const appTheme = createTheme({
  breakpoints: {
    lg: '74em',
    md: '64em',
    sm: '48em',
    xl: '90em',
    xs: '30em',
  },
  colors: {
    brand: DEFAULT_THEME.colors.blue,
    dtPink: [
      '#F7D9F2',
      '#F6AFEA',
      '#FF80EA', // original
      '#EE6AD9',
      '#DB5BC6',
      '#C751B3',
      '#B14AA0',
      '#964C8A',
      '#804B78',
      '#804B78',
    ],
  },
  defaultGradient: { deg: 45, from: 'indigo', to: 'cyan' },

  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: '2rem' },
    },
  },
  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },
})

export function AppTheme({
  children,
  theme = appTheme,
  ...props
}: MantineProviderProps) {
  return (
    <MantineProvider theme={theme} {...props}>
      {children}
    </MantineProvider>
  )
}
