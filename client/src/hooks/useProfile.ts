import { useSelector } from 'react-redux';

import { State } from '../store/reducers/state';
import { Profile } from '../store/model/profile';

const useProfile = (): Profile => {
  const profile = useSelector(
    (state: State) => state.profile.profile
  );

  return profile;
}

export default useProfile;