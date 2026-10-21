import andCultureLogo from '../assets/andculture.png'
import dialpadIcon from '../assets/dialpad-icon.svg'
import stackOverflowLogo from '../assets/stack-overflow.svg'
import type { Role } from '../content/types.ts'

export type LogoSpec = {
  src: string
  /** a colour behind the picture. Giving one also clips the logo to a 3px-rounded square */
  background?: string
  /** the picture's size in px, when it is not simply the 20px of its frame: it is centred and cropped to the frame */
  size?: number
}

export const logos: Record<NonNullable<Role['logo']>, LogoSpec> = {
  dialpad: { src: dialpadIcon },
  'stack-overflow': { src: stackOverflowLogo },
  andculture: { src: andCultureLogo, background: '#ff5e00', size: 27 },
}
