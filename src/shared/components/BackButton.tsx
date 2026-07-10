import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import styles from './BackButton.module.css'

type BackButtonProps = {
  className?: string
}

export function BackButton({ className }: BackButtonProps) {
  const navigate = useNavigate()
  const classes = className ? `${styles.backButton} ${className}` : styles.backButton

  return (
    <button type="button" className={classes} onClick={() => navigate(-1)}>
      <Icon name="back" className={styles.icon} />
      BACK
    </button>
  )
}
