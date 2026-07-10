import bagSrc from '../../assets/icons/bag.svg'
import logoSrc from '../../assets/icons/logo.svg'

type IconName = 'logo' | 'bag'

type IconProps = {
  name: IconName
  className?: string
}

const sources: Record<IconName, string> = {
  logo: logoSrc,
  bag: bagSrc,
}

export function Icon({ name, className }: IconProps) {
  return <img src={sources[name]} className={className} alt="" aria-hidden="true" />
}
