import { useState } from 'react';

import Link from 'next/link';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';

import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { QuitPreviewMode } from '../components/QuitPreviewMode';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [results, setResults] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  async function loadNextPage(): Promise<void> {
    const response = await fetch(nextPage);
    const postsResponse = (await response.json()) as ApiSearchResponse;

    const posts = postsResponse.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setResults([...results, ...posts]);
    setNextPage(postsResponse.next_page);
  }

  return (
    <div className={styles.content}>
      <Header />

      <main role="main" className={styles.mainContent}>
        <section className={styles.posts}>
          <h1 className={commonStyles.srOnly}>Posts</h1>

          {results.length &&
            results.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <div className={styles.post}>
                    <h3>{post.data.title}</h3>
                    <p>{post.data.subtitle}</p>

                    <div className={styles.postMetadata}>
                      <time>
                        <FiCalendar
                          width="20"
                          height="20"
                          color="var(--info)"
                        />
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          {
                            locale: ptBR,
                          }
                        )}
                      </time>

                      <span>
                        <FiUser width="20" height="20" color="var(--info)" />
                        {post.data.author}
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
        </section>

        {nextPage && (
          <button
            type="button"
            className={styles.loadMore}
            onClick={loadNextPage}
          >
            Carregar mais posts
          </button>
        )}

        {preview && <QuitPreviewMode />}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.banner'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    results: posts,
    next_page: postsResponse.next_page,
  };

  return {
    props: { postsPagination, preview },
  };
};
