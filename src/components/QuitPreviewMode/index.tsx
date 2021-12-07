import Link from 'next/link';

import styles from './styles.module.scss';

export function QuitPreviewMode(): JSX.Element {
  return (
    <aside className={styles.quitPreview}>
      <Link href="/api/exit-preview">
        <a>Sair do modo preview</a>
      </Link>
    </aside>
  );
}
