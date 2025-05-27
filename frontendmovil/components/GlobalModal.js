import React from 'react';
import { Modal, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { hideModal } from '../store/modalSlice';

export const GlobalModal = () => {
  const { visible, content } = useSelector(state => state.modal);
  const dispatch = useDispatch();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => dispatch(hideModal())}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#00000088',
        }}
      >
        {content}
      </View>
    </Modal>
  );
};
