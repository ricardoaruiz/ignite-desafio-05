import Link from 'next/link'
import { Container } from 'components/Container';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <Container>
      <header className={styles.header}>
        <Link href="/">
          <a>
            <img src="images/logo.svg" alt="spacetraveling" />
          </a>
        </Link>
      </header>
    </Container>
  )
}
