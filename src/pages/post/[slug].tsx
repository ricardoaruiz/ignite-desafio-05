/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import {
  AiOutlineCalendar,
  AiOutlineUser,
  AiOutlineClockCircle,
} from 'react-icons/ai';

import { Container } from '../../components/Container';
import { formatDate } from '../../utils/date';
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
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const totWordsInPost = post.data.content.reduce((totWords, contentPart) => {
    const totWordsInHead = contentPart.heading.split(/\s+/).length;
    const totWordsInBody =
      contentPart.heading.split(/\s+/).length +
      RichText.asText(contentPart.body).split(/\s+/).length;

    return totWords + totWordsInHead + totWordsInBody;
  }, 0);

  const parsedPost = {
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      banner: {
        url: post.data.banner.url,
      },
      author: post.data.author,
      content: post.data.content.map(dc => ({
        heading: dc.heading,
        body: [{ text: RichText.asHtml(dc.body) }],
      })),
    },
  };

  const {
    data: { banner, title, author, content },
    first_publication_date,
  } = parsedPost;

  return (
    <article className={styles.post}>
      <div className={styles.banner}>
        <Image
          src={banner.url}
          alt="banner"
          placeholder="blur"
          layout="fill"
          objectPosition="center center"
          objectFit="cover"
        />
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
          <div>
            <AiOutlineClockCircle />
            <span>{`${Math.ceil(totWordsInPost / 200)} min`}</span>
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
    [Prismic.Predicates.at('document.type', 'pos')],
    {
      pageSize: 3,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('pos', String(slug), {});

  return {
    props: {
      post,
    },
  };
};
