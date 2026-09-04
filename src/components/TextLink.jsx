import { Link } from "react-router-dom";

function TextLink({ children, href, addClass, to }) {
  const classes = `text-textAccent underline transition-opacity duration-150 hover:opacity-80 dark:text-textAccent-dark ${addClass}`;

  if (to)
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    );

  if (href)
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
}

export default TextLink;
