import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './TopbarNotification.css';

const TopbarNotification = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <p className={css.TopbarNotificationText}>
        Wondering how Flex suits your idea? Have a call with our marketplace experts and discuss how
        to turn your ideas into reality.
      </p>
      <a
        className={css.TopbarNotificationButton}
        href="https://calendly.com/welcome-to-flex?utm_source=saunatime-demo&utm_campaign=banner"
        target="_blank"
        rel="noopener"
      >
        Book a call
      </a>
    </div>
  );
};

TopbarNotification.defaultProps = {
  rootClassName: null,
  className: null,
};

const { string } = PropTypes;

TopbarNotification.propTypes = {
  rootClassName: string,
  className: string,
};

export default TopbarNotification;
