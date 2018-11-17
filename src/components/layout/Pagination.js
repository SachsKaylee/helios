import React from "react";
import A from "../system/A";
import { FormattedMessage } from "react-intl";

export default class Pagination extends React.PureComponent {
  constructor(p) {
    super(p);
  }

  render() {
    const { count, page, perPage, children } = this.props;
    const endThisPage = page * perPage;
    const totalPages = Math.ceil(count / perPage);
    return (<>
      <div className="container">
        {children}
      </div>
      <div className="container" style={{ marginTop: 16 }}>
        <nav className="pagination" role="navigation" aria-label="pagination">
          {page !== 1 && (<A className="pagination-previous" href={"?page=" + (page - 1)}><FormattedMessage id="navigation.previousPage" /></A>)}
          {endThisPage < count && (<A className="pagination-next" href={"?page=" + (page + 1)}><FormattedMessage id="navigation.nextPage" /></A>)}
          <ul className="pagination-list">
            {page > 1 && (<li>
              <A className="pagination-link" aria-label="#1" href={"?page=1"}>1</A>
            </li>)}
            {page > 2 && (<>
              <li>
                <span className="pagination-ellipsis">&hellip;</span>
              </li>
              <li>
                <A className="pagination-link" aria-label={"#" + (page - 1)} href={"?page=" + (page - 1)}>{page - 1}</A>
              </li>
            </>)}
            <li>
              <a className="pagination-link is-current" aria-label={"#" + page} aria-current="page" href="#">{page}</a>
            </li>
            {page < totalPages && (<li>
              <A className="pagination-link" aria-label={"#" + (page + 1)} href={"?page=" + (page + 1)}>{page + 1}</A>
            </li>)}
            {page + 1 < totalPages && (<><li>
              <span className="pagination-ellipsis">&hellip;</span>
            </li>
              <li>
                <A className="pagination-link" aria-label={"#" + totalPages} href={"?page=" + totalPages}>{totalPages}</A>
              </li></>)}
          </ul>
        </nav>
      </div>
    </>);
  }
};