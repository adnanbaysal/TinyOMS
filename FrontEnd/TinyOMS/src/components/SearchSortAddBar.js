import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Input, Modal, Radio, RadioGroup, Text, Card } from '@ui-kitten/components';
import { AddIcon, SortIcon, IconGhostButton } from "./Generics";
import i18n from '../i18n';

const SortingModal = ({visible, setVisible, sortingOptions, setSorting}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    setSorting(sortingOptions[selectedIndex].value);
    setVisible(false);
  }, [selectedIndex]);

  return (
    <View style={styles.buttonContainer}>
      <Modal 
        visible={visible} 
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setVisible(false)}
      >
        <Card disabled={true}>
          <Text category='h6'>
            {i18n.t("sort_by")}:
          </Text>
          <RadioGroup
            selectedIndex={selectedIndex}
            onChange={index => setSelectedIndex(index)}
          >
            {sortingOptions.map(option => <Radio key={option.description}>{option.description}</Radio>)}
          </RadioGroup>
        </Card>
      </Modal>
    </View>
  );
};

const SearchInput = ({placeholder, searchValue, setSearchValue, handleSubmit}) => {
  return (
    <Input 
      style={styles.input}
      placeholder={placeholder}
      value={searchValue}
      onChangeText={value => setSearchValue(value)}
      onSubmitEditing={handleSubmit}
    />
  );
};

export const SearchSortAddBar = ({placeholder, handleSearchSubmit, sortingVisible, setSortingVisible, sortingOptions, onSetSorting, onAddPressed, showAddButton = true}) => {
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <Layout style={{flex:1, flexDirection: 'row'}}>
      <SearchInput 
        style={{height: 24}}
        placeholder={placeholder}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        handleSubmit={handleSearchSubmit(searchValue)}
      />
      <SortingModal
        visible={sortingVisible} 
        setVisible={visible => setSortingVisible(visible)} 
        sortingOptions={sortingOptions} 
        setSorting={sorting => onSetSorting(sorting)}
      />
      <IconGhostButton style={styles.button} icon={SortIcon} onPress={() => setSortingVisible(true)}/>
      {showAddButton ? <IconGhostButton style={styles.button} icon={AddIcon} onPress={onAddPressed}/> : null}
    </Layout>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1
  },
  button: {
    height: 24,
    flex: 0,
    flexBasis: 24,
    flexShrink: 0
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
