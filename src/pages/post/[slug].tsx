import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { Comments } from '../../components/Comments';
import { QuitPreviewMode } from '../../components/QuitPreviewMode';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        heading: string;
        text: string;
      }[];
    }[];
  };
}

interface PostNavigation {
  slug: string;
  title: string;
}

interface PostProps {
  post: Post;
  preview: boolean;
  nextPost: PostNavigation | null;
  previousPost: PostNavigation | null;
}

export default function Post({
  post,
  preview,
  nextPost,
  previousPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const wordsCount = post.data.content.reduce((acc, part) => {
    const headingLength = part.heading.split(/\s+/gi).length;
    const bodyLength = RichText.asText(part.body).split(/\s+/gi).length;
    return acc + (headingLength + bodyLength);
  }, 0);

  const readingTime = Math.ceil(wordsCount / 200);

  return (
    <>
      <Head>
        <title>Spacetraveling | {post.data.title}</title>
      </Head>

      <div className={styles.content}>
        <Header />

        <main className={styles.mainContent}>
          <article className={styles.postContent}>
            <div className={styles.heroImage}>
              <img src={post.data.banner.url} alt="Hero" />
            </div>

            <header>
              <h1>{post.data.title}</h1>

              <div>
                <time>
                  <FiCalendar width="20" height="20" color="var(--info)" />
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
                <span>
                  <FiClock width="20" height="20" color="var(--info)" />
                  {readingTime} min
                </span>
              </div>

              <span>
                * editado em{' '}
                {format(new Date(post.last_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
            </header>

            {post.data.content.map(part => (
              <section key={part.heading}>
                <h2>{part.heading}</h2>

                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(part.body),
                  }}
                />
              </section>
            ))}
          </article>

          <div className={styles.nextAndPrevioustPost}>
            {previousPost && (
              <Link href={`/post/${previousPost.slug}`}>
                <a>
                  <span>{previousPost.title}</span>
                  Post anterior
                </a>
              </Link>
            )}

            {nextPost && (
              <Link href={`/post/${nextPost.slug}`}>
                <a>
                  <span>{nextPost.title}</span>
                  Próximo post
                </a>
              </Link>
            )}
          </div>

          <Comments />

          {preview && <QuitPreviewMode />}
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post')
  );

  const paths = postsResponse.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
  preview = false,
}) => {
  const { slug } = params;
  const previewRef = previewData ? previewData.ref : null;
  const refOption = previewRef ? { ref: previewRef } : null;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), refOption);
  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      subtitle: response.data.subtitle,
      content: response.data.content.map(part => ({
        heading: part.heading,
        body: part.body,
      })),
    },
    uid: response.uid,
  };

  const previousPostResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPostResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response.id,
    }
  );

  const nextPost = nextPostResponse.results[0]
    ? {
        slug: nextPostResponse.results[0]?.uid,
        title: nextPostResponse.results[0]?.data.title,
      }
    : null;

  const previousPost = previousPostResponse.results[0]
    ? {
        slug: previousPostResponse.results[0]?.uid,
        title: previousPostResponse.results[0]?.data.title,
      }
    : null;

  return {
    props: {
      post,
      preview,
      nextPost,
      previousPost,
    },
  };
};
