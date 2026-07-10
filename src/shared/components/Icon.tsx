import arrowSrc from '../../assets/icons/arrow.svg'
import bagSrc from '../../assets/icons/bag.svg'
import logoSrc from '../../assets/icons/logo.svg'

type IconName = 'logo' | 'bag' | 'back'

type IconProps = {
  name: IconName
  className?: string
}

const sources: Record<IconName, string> = {
  logo: logoSrc,
  bag: bagSrc,
  back: arrowSrc,
}

export function Icon({ name, className }: IconProps) {
  return <img src={sources[name]} className={className} alt="" aria-hidden="true" />
}
