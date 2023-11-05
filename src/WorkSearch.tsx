import React, { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { MiniCardPageFragment, WorksearchQuery } from './queries';
import { getInitialVariables } from './queryVariables';
import { Grid, List, ListItem, ListItemText, Paper, IconButton, CircularProgress, TextField, Button } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const WORK_SEARCH_QUERY = gql`
  ${MiniCardPageFragment}
  ${WorksearchQuery}
`;

const WorkSearch = () => {
    const [userName, setUserName] = useState('');
    const [variables, setVariables] = useState(getInitialVariables(''));
    const [prevCursors, setPrevCursors] = useState([]);
    const [nextCursors, setNextCursors] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // 現在のページインデックス



    const [search, { loading, data, error, fetchMore }] = useLazyQuery(WORK_SEARCH_QUERY, {
        variables,
        notifyOnNetworkStatusChange: true,
    });

    // ユーザー名での検索を行い、結果をリフェッチします。
    const searchByUser = (newUserName) => {
        setUserName(newUserName);
        const newVariables = getInitialVariables(newUserName);
        setVariables(newVariables);
        search({ variables: newVariables }); // useLazyQueryのsearch関数を使ってクエリを実行
    };

    // ページネーションで使用するカーソルを用いて追加データを取得する関数
    const handlePageChange = (newCursor, isNext) => {
        // 現在のページインデックスに基づいて変数を設定します
        let variables;
        if (isNext) {
            variables = { after: newCursor, first: 20 };
            setCurrentPageIndex(currentPageIndex + 1);
        } else {
            if (currentPageIndex === 1) {
                // 最初のページに戻る場合
                variables = { first: 20 };
            } else {
                variables = { before: newCursor, last: 20, first: null };
            }
            setCurrentPageIndex(currentPageIndex - 1);
        }

        // nextPageIndexを確定した後にカーソル配列を更新します
        const nextPageIndex = isNext ? currentPageIndex + 1 : currentPageIndex - 1;

        fetchMore({
            variables,
            updateQuery: (prevResult, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prevResult;

                // カーソル配列の更新
                if (isNext) {
                    setNextCursors(c => [...c, prevResult.pages.pageInfo.endCursor]);
                    if (nextPageIndex !== 1) {
                        setPrevCursors(c => [...c, fetchMoreResult.pages.pageInfo.startCursor]);
                    }
                } else {
                    if (nextPageIndex > 0) {
                        setNextCursors(c => c.slice(0, -1));
                        setPrevCursors(c => c.slice(0, -1));
                    } else {
                        // 最初のページに戻った場合、カーソルをリセット
                        setNextCursors([]);
                        setPrevCursors([]);
                    }
                }
                return fetchMoreResult;
            }
        }).catch(error => {
            console.error('Error during pagination:', error);
        });
    };

    const handleNewSearch = newUserName => {
        // カーソルとページインデックスをリセット
        setPrevCursors([]);
        setNextCursors([]);
        setCurrentPageIndex(0);
        // 新しい検索を実行
        searchByUser(newUserName);
    };

    return (
        <div>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={true}>
                    <TextField
                        placeholder="Enter a username..."
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        onKeyPress={e => {
                            if (e.key === 'Enter') {
                                handleNewSearch(userName);
                            }
                        }}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                </Grid>
                <Grid item>
                    <Button onClick={() => handleNewSearch(userName)} variant="contained" color="primary">
                        Search
                    </Button>
                </Grid>
                {/* ローディング表示 */}
                {loading && (
                    <div style={{
                        position: 'fixed', // または 'absolute' にすると、親要素に対して相対的になります
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)', // 半透明の白
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2, // モーダルを最前面に
                    }}>
                        <CircularProgress />
                    </div>
                )}
            </Grid>
            {/* エラーメッセージ */}
            {error && <p>Error! {error.message}</p>}
            {data && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px'}}>
                            {`計${data.aggregatePageWikidotInfos._count} ページ  ${currentPageIndex + 1} / ${Math.ceil(data.aggregatePageWikidotInfos._count / 20)}`}
                        </div>
                        <IconButton onClick={() => handlePageChange(prevCursors[prevCursors.length - 1], false)} disabled={currentPageIndex <= 0}>
                            <ArrowBackIosIcon />
                        </IconButton>
                        <IconButton onClick={() => handlePageChange(data.pages.pageInfo.endCursor, true)} disabled={!data.pages.pageInfo.hasNextPage}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </div>
                    <Paper style={{ margin: '10px', padding: '10px' }}>
                        <List>
                            {data.pages.edges.map(({ node }) => (
                                <ListItem
                                    key={node.url}
                                    button
                                    onClick={() => {
                                        if (window.self === window.top) {
                                            window.location.href = node.url;
                                        } else {
                                            window.parent.location.href = node.url;
                                        }
                                    }}
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                >
                                <>
                                    <ListItemText
                                        primary={
                                            <>
                                                <strong>{node.wikidotInfo.title}</strong>
                                                {node.alternateTitles &&
                                                    node.alternateTitles.length > 0 &&
                                                    ` - ${node.alternateTitles[0].title}`}
                                                <span style={{ fontSize: 'small' }}>
                                                    {` (${node.wikidotInfo.rating})`}
                                                </span>
                                            </>
                                        }
                                        secondary={
                                            <>
                                                作成日: {new Date(node.wikidotInfo.createdAt).toLocaleDateString()}
                                            </>
                                        }

                                    />
                                </>
                            </ListItem>
                            ))}
                        </List>
                    </Paper>

                </>
            )}
        </div>
    );
};

export default WorkSearch;