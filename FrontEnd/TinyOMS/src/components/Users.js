import React from 'react';
import { Avatar, ListItem, Layout, Text } from '@ui-kitten/components';
import { ListingComponent } from "./ListingComponent";
import { backendURL, userSortingOptions } from "../config";
import { handleListItemSelect, handleListItemRadioSelect } from "../components/Generics";

export const Users = ({ 
  navigation, 
  userType, 
  itemsName, 
  userSearchName, 
  currentPage, 
  renderAccessoryRight,
  asModal = false,
  visible = null, 
  setVisible = null, 
  selectable = false,
  selectedUsers = null, 
  setSelectedUsers = null,
  showOnlySelected = false,
  selectSingle = false
}) => {
  const [sortingOptions, setSortingOptions] = React.useState(userSortingOptions);

  const renderListItem = (item, index) => ( 
    <ListItem 
      title={`${item.first_name} ${item.last_name}`} 
      description={`${item.username} - ${item.email}`}
      accessoryLeft={() => {
        let source = require("../../assets/default.png");
        if (item.profile_image !== null) {
          source = {uri: item.profile_image};
        }
        return (
          <Layout style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text category='label' style={{width: 32}}>{index + 1}</Text>
            <Avatar source={source} size='large' shape='rounded'/>
          </Layout>
        );
      }}
      accessoryRight={renderAccessoryRight(item)}
      onPress={() => {
        if (selectable){
          if (selectSingle) {
            handleListItemRadioSelect(selectedUsers, setSelectedUsers, item);
          } else {
            handleListItemSelect(selectedUsers, setSelectedUsers, item);
          }
        } else if (!showOnlySelected) {
          navigation.navigate("UserRead", {user: item, usertype: userType});
        }
      }}
    />
  ); 
  // TODO: change render 

  return (
    <ListingComponent 
      navigation={navigation}
      asModal={asModal}
      sortingOptions={sortingOptions}
      baseurl={backendURL + `api/users/?usertype=${userType}`}
      renderListItem={renderListItem}
      itemsName={itemsName}
      searchPlaceholder={userSearchName}
      currentPage={currentPage}
      addButtonParams={{route: "AddUser", params: {usertype: userType}}}
      showListingModal={visible}
      setShowListingModal={setVisible}
      selectable={selectable}
      numberOfSelected={selectedUsers?.size}
      selectedItems={selectedUsers}
      showOnlySelected={showOnlySelected}
      selectSingle={selectSingle}
    />
  );
};
