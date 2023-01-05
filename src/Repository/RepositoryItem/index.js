import React, { useState } from 'react';

import { Mutation } from 'react-apollo';
import Button from '../../Button';
import Link from '../../Link';
import REPOSITORY_FRAGMENT from '../fragments';

import {STAR_REPOSITORY, UNSTAR_REPOSITORY, WATCH_REPOSITORY} from '../mutations';

import '../style.css';

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = viewerSubscription =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;


const updateAddStar = (client, mutationResult) => {
  const { data: { addStar: { starrable: { id } } } } = mutationResult;
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });

  const totalCount = repository.stargazers.totalCount + 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount
      }
    }
  });
};

const updateRemoveStar = (client, mutationResult) => {
  const { data: { removeStar: { starrable: { id } } } } = mutationResult;
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });

  const totalCount = repository.stargazers.totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount
      }
    }
  });
};

const updateWatch = (
  client,
  {
    data: {
      updateSubscription: {
        subscribable: { id, viewerSubscription },
      },
    },
  },
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });

  let { totalCount } = repository.watchers;
  totalCount = isWatch(viewerSubscription) ? totalCount + 1 : totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount,
      },
    },
  });
};



const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerHasStarred,
  viewerSubscription
}) => {

  return (
    <div>
      <div className='RepositoryItem-title'>
        <h2><Link href={url}>{name}</Link></h2>

        <div className="RepositoryItem-title-action">
          {!viewerHasStarred ? (
            <Mutation
              mutation={STAR_REPOSITORY}
              variables={{id}}
              update={updateAddStar}
              optimisticResponse={{
                addStar: {
                  __typename: 'Mutation',
                  starrable: {
                    __typename: 'Repository',
                    id,
                    viewerHasStarred: !viewerHasStarred,
                  },
                },
              }}
            >
              {(addStar, {data, loading, error}) => (
                <Button
                  className={'RepositoryItem-title-action'}
                  onClick={addStar}
                  title="Add star"
                >
                  {stargazers.totalCount} Star
                </Button>
              )}
            </Mutation>
          ) : (
            <Mutation
              mutation={UNSTAR_REPOSITORY}
              variables={{id}}
              update={updateRemoveStar}
              optimisticResponse={{
                removeStar: {
                  __typename: 'Mutation',
                  starrable: {
                    __typename: 'Repository',
                    id,
                    viewerHasStarred: !viewerHasStarred,
                  },
                },
              }}
            >
              {(removeStar, {data, loading, error}) => (
                <Button
                  className={'RepositoryItem-title-action'}
                  onClick={removeStar}
                  title="Unstar"
                >
                  {stargazers.totalCount} Unstar
                </Button>
              )}
            </Mutation>
          )}
        </div>
        <Mutation
          mutation={WATCH_REPOSITORY}
          variables={{
            id,
            viewerSubscription: isWatch(viewerSubscription) ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED : VIEWER_SUBSCRIPTIONS.SUBSCRIBED
          }}
          update={updateWatch}
          optimisticResponse={{
            updateSubscription: {
              __typename: 'Mutation',
              subscribable: {
                __typename: 'Repository',
                id,
                viewerSubscription: isWatch(viewerSubscription) ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED : VIEWER_SUBSCRIPTIONS.SUBSCRIBED
              }
            }
          }}
        >
          {(updateSubscription, { data, loading, error }) => (
            <Button
              className="RepositoryItem-title-action"
              data-test-id="updateSubscription"
              onClick={updateSubscription}
            >
              {watchers.totalCount}{' '}
              {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
            </Button>
          )}
        </Mutation>
      </div>

      <div className="RepositoryItem-description">
        <div
          className="RepositoryItem-description-info"
          dangerouslySetInnerHTML={{ __html: descriptionHTML }}
        />
        <div className="RepositoryItem-description-details">
          <div>
            {primaryLanguage && (
              <span>Language: {primaryLanguage.name}</span>
            )}
          </div>
          <div>
            {owner && (
              <span>
                Owner: <a href={owner.url}>{owner.login}</a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RepositoryItem;