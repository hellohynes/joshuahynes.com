import icon from '../../assets/dialpad-icon.svg'

/**
 * The Dialpad app icon, placed exactly as the approved file (src/assets/dialpad-icon.svg is a byte-for-byte
 * copy of Dialpad-Icon-Tile-Gradient.svg). It is scaled by height only, so its proportions never change.
 */
export function DialpadMark() {
  return <img src={icon} alt="Dialpad" className="mx-[0.2em] inline-block h-[1.05em] w-auto align-[-0.16em]" />
}
