import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <section className={styles.page} aria-labelledby="not-found-heading">
      <p className={styles.code}>404</p>
      <h1 id="not-found-heading">Page not found</h1>
      <p className="introduction">
        There’s still more to uncover at Joara, but this page couldn’t be found. It may have moved,
        or the link may be incorrect.
      </p>
      <Link className="back-link" href="/">
        Back to Exploring Joara <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
