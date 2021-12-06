import React from 'react';
import axios from "axios";
import { RefreshControl, View, Platform } from 'react-native';
import { Divider, Spinner, List, Text, Layout } from '@ui-kitten/components';
import { LoginContext, WidthContext } from "../config";
import { ListingComponentContainer } from "./ListingComponentContainer";
import i18n from '../i18n';

export const ListingComponent = ({ 
  navigation, 
  asModal = false,
  sortingOptions, 
  baseurl, 
  renderListItem, 
  itemsName, 
  searchPlaceholder, 
  currentPage, 
  addButtonParams,
  showListingModal = null, 
  setShowListingModal = null,
  selectable = false, 
  numberOfSelected = null,
  selectedItems = null,
  showOnlySelected = false,
  selectSingle = false
}) => {
  const [loginContext, setLoginContext] = React.useContext(LoginContext);
  const [usefulWidth, setUsefulWidth] = React.useContext(WidthContext);
  
  const [itemList, setItemList] = React.useState([]);
  const [itemCount, setItemCount] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(false);
  const [pageNum, setPageNum] = React.useState(1);
  const [loadMore, setLoadMore] = React.useState(false);
  const [noMoreData, setNoMoreData] = React.useState(false);
  const [searchKey, setSearchKey] = React.useState('');
  const [sorting, setSorting] = React.useState(sortingOptions[0].value);
  
  const resetState = () => {
    setPageNum(1);
    setItemList([]); 
    setItemCount(0); 
    setNoMoreData(false);
    setLoadMore(false);
  };

  const fetchItemsPromise = async () => {
    if (pageNum === 1) {
      setShowLoading(true);
    }
    const page_size = (asModal || Platform.OS !== 'web') ? 10 : 20;
    const url = baseurl + `&page=${pageNum}&page_size=${page_size}&search=${searchKey || ""}&ordering=${sorting || ""}`; 
    axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${loginContext.token}`
      },
    }).then(response => {
      const items = [...(itemList.filter(item => item.id !== 0)), ...response.data.results]; 
      setItemCount(response.data.count); 
      if (response.data.current_page * page_size < response.data.count) {
        items.push({id: 0});
      } else {
        setNoMoreData(true);
      }
      setItemList(items);
      setPageNum(pageNum + 1);
    })
    .catch(error => console.log(error))
    .finally(() => {
      setShowLoading(false);
    });
  };

  // Table end reached and there are still items
  React.useEffect(() => {
    if (loadMore && !noMoreData){
      async function fetchItems() {
        await fetchItemsPromise();
      }
      fetchItems();
      setLoadMore(false);
    }
  }, [loadMore]);

  const handleLoadMore = () => {
    setLoadMore(true);
  };

  const loadingListItem = (
    <View style={{alignItems: 'center'}}>
      <Spinner/>
    </View>
  );

  const renderItem = ({ item, index }) => {
    if (item.id === 0) {
      return loadingListItem;
    } else {
      return renderListItem(item, index);
    }
  };

  const listViewStyle = {
    flex: 1, 
    alignItems: 'stretch', 
    width: usefulWidth - (asModal ? 10 : 0), 
    paddingLeft:5, 
    paddingRight: 5
  };

  const renderListingView = (refreshing, handleRefresh) => ( 
    <View style={listViewStyle}>
      <Layout style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        { showOnlySelected ? 
          <Text status={numberOfSelected > 0 ? 'success' : 'danger'}>
            {numberOfSelected} {i18n.t("item_selected")}
          </Text>
          :
          <Text>{itemCount} {itemsName}</Text>
        }
        { selectable ? 
          <Text status={numberOfSelected > 0 ? 'success' : 'danger'}>
            {numberOfSelected} {i18n.t("item_selected")}
          </Text> 
          : null
        }
      </Layout>
      <Divider />
      <List
        data={showOnlySelected ? itemList.filter(item => selectedItems.has(item.id)) : itemList}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id.toString()}
        ItemSeparatorComponent={Divider}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );

  return ( 
    <ListingComponentContainer
      navigation={navigation}
      asModal={asModal}
      ListingComponent={renderListingView}
      fetchItemsPromise={fetchItemsPromise}
      resetListState={resetState}
      pageNum={pageNum}
      showLoading={showLoading}
      sortingOptions={sortingOptions}
      searchPlaceholder={searchPlaceholder}
      currentPage={currentPage}
      addButtonParams={addButtonParams}
      showListingModal={showListingModal}
      setShowListingModal={setShowListingModal}
      searchKey={searchKey}
      setSearchKey={setSearchKey}
      sorting={sorting}
      setSorting={setSorting}
      selectSingle={selectSingle}
      numberOfSelected={numberOfSelected}
    />
  ); 
};
