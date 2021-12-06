import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import GridImageView from 'react-native-grid-image-viewer';
import i18n from '../i18n'
import { TopNavigationBar } from "../components/TopNavigationBar";

export const FullScreenImage = ({ route, navigation }) => {
  const { title, images } = route.params;

  return (
    <View style={styles.background}>
      <TopNavigationBar navigation={navigation} currentPage={title}/>
      <Text style={styles.explore_text}>{i18n.t("click_to_full")}</Text>
      <GridImageView data={images} />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'black',
    flex: 1
  },
  headline_text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 50,
    marginLeft: 20
  },
  explore_text: {
    marginTop: 5,
    marginBottom: 10,
    color: 'white',
    marginLeft: 20,
    fontSize: 12,
    fontWeight: '600'
  },
});