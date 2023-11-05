// queryVariables.ts
export const getInitialVariables = (searchName = "r74") => ({
    filter: {
        _and: [
            {
                wikidotInfo: {
                    isPrivate: false
                },
                attributions: {
                    user: {
                        name: {
                            eqLower: searchName
                        }
                    }
                }
            },
            {
                url: {
                    startsWith: "http://scp-jp.wikidot.com"
                }
            }
        ]
    },
    aggregateFilter: {
        _and: [
            {
                wikidotInfo: {
                    isPrivate: false
                },
                attributions: {
                    user: {
                        name: {
                            eqLower: searchName
                        }
                    }
                }
            },
            {
                url: {
                    startsWith: "http://scp-jp.wikidot.com"
                }
            }
        ]
    },
    sort: {
        key: "CREATED_AT",
        order: "DESC"
    },
    hideCount: false,
    after: null,
    before: null,
    first: 20,
    last: null
});
