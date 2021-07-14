import styles from './container.module.scss';

type ContainerProps = {
  children: React.ReactNode;
};

export const Container = ({ children }: ContainerProps): JSX.Element => (
  <div className={styles.container}>{children}</div>
);
