import React, { Fragment } from 'react';
import RepositoryItem from '../RepositoryItem';
import Loading from '../../Loading';

const updateQuery = (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return {
    ...previousResult,
    viewer: {
      ...previousResult.viewer,
      repositories: {
        ...previousResult.viewer.repositories,
        ...fetchMoreResult.viewer.repositories,
        edges: [
          ...previousResult.viewer.repositories.edges,
          ...fetchMoreResult.viewer.repositories.edges,
        ],
      },
    },
  };
};

const RepositoryList = ({repositories, fetchMore, loading}) => {

  const doFetchMore = () => {
    fetchMore({
      variables: {cursor: repositories.pageInfo.endCursor},
      updateQuery
    });
  }
  return (
    <Fragment>
      {repositories.edges.map(({node}) => (
        <div key={node.id} className="RepositoryItem">
          <RepositoryItem {...node} />
        </div>
      ))}

      {loading ? <Loading /> : repositories.pageInfo.hasNextPage && (
        <button type="button" onClick={doFetchMore}>
          More Repositories
        </button>
      )}
    </Fragment>
  )
};

export default RepositoryList;