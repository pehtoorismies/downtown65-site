/// <reference types="astro/client" />

declare namespace astro.JSX {
  interface IntrinsicElements {
    button: astro.JSX.IntrinsicElements['button'] & {
      command?: string
      commandfor?: string
    }
  }
}
