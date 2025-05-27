import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';

export const GlobalLoader = () => {
  const { loading } = useSelector(state => state.loader);

  if (!loading) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000044',
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};
