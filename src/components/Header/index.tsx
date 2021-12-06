import Link from 'next/link';

import styles from './header.module.scss';
import common from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={common.container}>
      <header className={styles.header}>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo" width="239" height="27" />
          </a>
        </Link>
      </header>
    </div>
  );
}
