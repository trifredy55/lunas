function PageHeader({ kicker, title, description, action }) {
  return (
    <div className="page-header">
      <div className="page-header-copy">
        {kicker ? <p className="page-kicker">{kicker}</p> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>

      {action ? <div className="page-header-actions">{action}</div> : null}
    </div>
  );
}

export default PageHeader;
