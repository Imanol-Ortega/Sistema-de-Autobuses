import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '../store/loaderSlice';

export const useLoader = () => {
  const dispatch = useDispatch();

  const startLoader = async () => {
    dispatch(showLoader());
  };

  const endLoader = async () => {
    dispatch(hideLoader());
  };

  return { startLoader, endLoader };
};
