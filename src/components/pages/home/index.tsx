import { HomeTemplate } from '@src/components/templates';

type Props = {};

const Home = (props: Props) => {
  console.log(process.env?.REACT_APP_API_KEY);
  return <HomeTemplate />;
};

export { Home };
