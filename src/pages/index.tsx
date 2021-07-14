/* eslint-disable no-use-before-define */
import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';

import { Container } from '../components/Container';

import { formatDate } from '../utils/date';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
}

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps): JSX.Element {
  const [nextPageUrl, setNextPageUrl] = React.useState<string | null>(
    next_page
  );
  const [posts, setPosts] = React.useState<Post[]>(results);

  const loadMore = React.useCallback(async () => {
    try {
      const response = await fetch(nextPageUrl);
      const data = await response.json();

      const newPosts = data.results.map(post => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }));

      setPosts(state => [...state, ...newPosts]);
      setNextPageUrl(data.next_page);
    } catch (error) {
      // TODO: handle the error
      console.error('Error on load more posts', error);
    }
  }, [nextPageUrl]);

  return (
    <Container>
      <div className={styles.posts}>
        {/* Posts */}
        {posts.map(({ uid, first_publication_date, data }) => (
          <Link href={`/post/${uid}`} key={uid}>
            <a className={styles.post}>
              <h2 className={styles.title}>{data.title}</h2>
              <p className={styles.subtitle}>{data.subtitle}</p>

              {/* Footer  */}
              <div className={styles.footer}>
                <div>
                  <AiOutlineCalendar />
                  <span>{formatDate(new Date(first_publication_date))}</span>
                </div>
                <div>
                  <AiOutlineUser />
                  <span>{data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {nextPageUrl && (
          <button
            type="button"
            className={styles.loadMorePosts}
            onClick={loadMore}
          >
            Carregar mais posts
          </button>
        )}
      </div>
    </Container>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'pos')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 3,
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

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 60, // 1 hora
  };
};
