export const MiniCardPageFragment = `
fragment MiniCardPageFragment on Page {
  url
  wikidotInfo {
    title
    createdAt
    rating
    realtimeRating
    thumbnailUrl
    tags
  }
  alternateTitles {
    title
  }
  attributions {
    user {
      name
    }
  }
}
`;

export const WorksearchQuery = `
query Worksearch($filter: QueryPagesFilter!, $aggregateFilter: QueryAggregatePageWikidotInfosFilter!, $sort: QueryPagesSort, $after: ID, $before: ID, $first: Int, $last: Int, $hideCount: Boolean!) {
  aggregatePageWikidotInfos(filter: $aggregateFilter) @skip(if: $hideCount) {
    _count
  }
  pages(
    filter: $filter
    sort: $sort
    after: $after
    before: $before
    first: $first
    last: $last
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    edges {
      node {
        ...MiniCardPageFragment
      }
    }
  }
}
`;