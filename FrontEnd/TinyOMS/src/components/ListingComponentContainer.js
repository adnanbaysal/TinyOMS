import React from 'react';
import { View, StyleSheet, Platform} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Divider, Card, Layout, Spinner, Modal, Button } from '@ui-kitten/components';
import { WidthContext } from "../config";
import { TopNavigationBar } from "./TopNavigationBar";
import { SearchSortAddBar } from "./SearchSortAddBar";
import i18n from '../i18n';

export const ListingComponentContainer = ({ 
  navigation,
  asModal = false,
  ListingComponent, 
  fetchItemsPromise, 
  resetListState, 
  pageNum, 
  showLoading, 
  sortingOptions, 
  searchPlaceholder,
  currentPage, 
  addButtonParams,
  showListingModal = null, 
  setShowListingModal = null,
  searchKey,
  setSearchKey,
  sorting, 
  setSorting,
  selectSingle = false,
  numberOfSelected = 0
}) => {
  const [usefulWidth, setUsefulWidth] = React.useContext(WidthContext);

  const [sortingVisible, setSortingVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch when focused
  useFocusEffect(
    React.useCallback(() => {
      async function fetchItems() {
        await fetchItemsPromise();
      }
      fetchItems();
    }, [])
  );

  // Search input
  React.useEffect(() => {
    if (searchKey !== '' && pageNum === 1){
      async function fetchItems() {
        await fetchItemsPromise();
      }
      fetchItems();
    }
  }, [searchKey, pageNum]); // TODO: look if pageNum is necessary

  // Sorting input
  React.useEffect(() => {
    if (pageNum === 1){
      async function fetchItems() {
        await fetchItemsPromise();
      }
      fetchItems();
    }
  }, [sorting, pageNum]); // TODO: look if pageNum is necessary

  const handleSearchSubmit = searchValue => () => {
    resetListState();
    setSearchKey(searchValue);
  };

  const handleSetSorting = newSorting => {
    resetListState();
    setSorting(newSorting);
  };

  const renderSearchBar = () => {
    return (
      <SearchSortAddBar
        placeholder={searchPlaceholder} 
        handleSearchSubmit={handleSearchSubmit}
        sortingVisible={sortingVisible}
        setSortingVisible={visible => setSortingVisible(visible)}
        sortingOptions={sortingOptions}
        onSetSorting={handleSetSorting}
        onAddPressed={() => {
          if (asModal) return;
          navigation.navigate(addButtonParams.route, addButtonParams.params);
        }}
        showAddButton={!asModal}
      />
    );
  };

  const listingRefreshCallback = async () => {
    async function fetchProducts() {
      setRefreshing(true);
      await fetchItemsPromise(searchKey, sorting);
      setRefreshing(false);
    }
    fetchProducts();
  }

  const renderListInnerContent = () => (
    <>
      <Modal visible={showLoading} backdropStyle={styles.backdrop}>
        <Spinner size='giant'/>
      </Modal>
      <View style={{
        flex: 0, 
        flexBasis: 40, 
        flexShrink: 0, 
        width: usefulWidth, 
        paddingLeft:5, 
        paddingRight:5
      }}>
        {renderSearchBar()}
        <Divider />
      </View>
      {ListingComponent(refreshing, listingRefreshCallback)}
    </>
  );

  // TODO: on web, modal doesn't show correctly, fix this
  if (asModal) {
    return (
      <Modal 
        visible={showListingModal} 
        backdropStyle={styles.backdrop} 
        style={{width: usefulWidth, height: 500, justifyContent: 'flex-start', alignItems: 'center', flex: 0}} 
        onBackdropPress={() => setShowListingModal(false)}
      >
        <Card disabled={false} style={Platform.OS === 'web' ? {width: usefulWidth + 48, height: 500} : null}>
          {renderListInnerContent()}
          <Divider />
          <Button 
            onPress={() => setShowListingModal(false)}
            disabled={selectSingle && (numberOfSelected < 1)}
          >
            {i18n.t("ok")}
          </Button>
        </Card>
      </Modal>
    );
  } else {
    return (
      <View style={{flex: 1}}>
        <TopNavigationBar navigation={navigation} currentPage={currentPage}/>
        <Layout style={styles.layout}>
          {renderListInnerContent()}
        </Layout>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  layout: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
