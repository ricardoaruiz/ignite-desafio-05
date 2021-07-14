import Link from 'next/link';
import Image from 'next/image';
import { Container } from '../Container';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <Container>
      <header className={styles.header}>
        <Link href="/">
          <a>
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={239}
              height={27}
              placeholder="blur"
            />
          </a>
        </Link>
      </header>
    </Container>
  )
}
