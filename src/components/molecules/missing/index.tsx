import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

const Missing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-1);
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <section style={{ padding: '10rem' }}>
      <Helmet>
        <meta name="description" content="Page Not Found!" key="description" />
        <meta
          property="og:description"
          content="Page Not Found!"
          key="og:description"
        />
        <meta property="og:title" content="Audiophile E-Commerce" key="title" />
        <title>404 | Page Not Found</title>
      </Helmet>

      <h1>Oops!</h1>
      <p>Page Not Found</p>
      <p>
        This page is asleep and is wearing its' noice cancellation headphones so
        you may not get it today. Not to worry.
      </p>
      <p className="">
        You can go back to<Link to="/">our Homepage</Link>
        &nbsp;or another page using the navigation menu
        <strong>(It will go back to the previous page after 10 seconds)</strong>
      </p>
    </section>
  );
};
export { Missing };
