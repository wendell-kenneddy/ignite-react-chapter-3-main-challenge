import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
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
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
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
          </header>

          {post.data.content.map(part => (
            <section key={part.heading}>
              <h2>{part.heading}</h2>

              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(part.body) }}
              />
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      pageSize: 100,
    }
  );

  const paths = postsResponse.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  const post = {
    first_publication_date: response.first_publication_date,
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

  return {
    props: {
      post,
    },
  };
};
