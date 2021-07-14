/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';

import { Container } from 'components/Container';
import { formatDate } from 'utils/date';
import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
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
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const {
    data: { banner, title, author, content },
    first_publication_date,
  } = post;

  return (
    <article className={styles.post}>
      <div className={styles.banner}>
        <img src={banner.url} alt="banner" />
      </div>

      <Container>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.meta}>
          <div>
            <AiOutlineCalendar />
            <span>{formatDate(new Date(first_publication_date))}</span>
          </div>
          <div>
            <AiOutlineUser />
            <span>{author}</span>
          </div>
        </div>

        {content.map(({ heading, body }, index) => (
          <div className={styles.content} key={index}>
            <h2>{heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: body[0].text }} />
          </div>
        ))}
      </Container>
    </article>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'pos')
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: 'blocking', // See the "fallback" section below
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('pos', String(slug), {});

  const { data, first_publication_date } = response;
  const { title, author, banner } = data;

  const mc = data.content.map(dc => ({
    heading: dc.heading,
    body: [{ text: RichText.asHtml(dc.body) }],
  }));

  const post = {
    first_publication_date,
    data: {
      title,
      banner: {
        url: banner.url,
      },
      author,
      content: mc,
    },
  };

  return {
    props: {
      post,
    },
  };
};
