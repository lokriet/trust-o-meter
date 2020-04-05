import { ErrorMessage, Field, Form, Formik } from 'formik';
import { StitchUser } from 'mongodb-stitch-browser-sdk';
import React, { useCallback, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import * as Yup from 'yup';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { Gender, Profile } from '../../../store/model/profile';
import { State } from '../../../store/reducers/state';
import { generateIdentificator } from '../../../util/util';
import { Error } from '../../UI/Error/Error';
import Avatar from './Avatar/Avatar';
import classes from './EditProfile.module.css';

interface ProfileProps {
  user: StitchUser | null;
  profile: Profile | null;
  error: string | null;
  loading: boolean;
}

const EditProfile = (props: ProfileProps) => {
  const [isNew] = useState(props.profile == null);

  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    formValues => {
      if (isNew && props.user != null) {
        dispatch(
          actions.createProfile({
            avatarUrl: formValues.avatarUrl,
            username: formValues.username,
            ownerId: props.user.id,
            identificator: generateIdentificator()
          })
        );
      } else {
        dispatch(
          actions.updateProfile(props.profile?._id, {
            ...props.profile,
            ...formValues
          })
        );
      }
    },
    [dispatch, isNew, props.user, props.profile]
  );

  const handleAvatarChange = useCallback(
    (newAvatarUrl) => {
      // if (newAvatarUrl !== null) {
      //   const newAvatarUrlsToCheck = new Set(avatarUrlsToCheck);
      //   newAvatarUrlsToCheck.add(newAvatarUrl);
      //   setAvatarUrlsToCheck(newAvatarUrlsToCheck);
      // }
    },
    [/*avatarUrlsToCheck*/],
  );

  const form = (
    <Formik
      initialValues={{
        avatarUrl: isNew ? '' : props.profile?.avatarUrl,
        username: isNew ? '' : props.profile?.username,
        gender: isNew ? '' : props.profile?.gender
      }}
      validationSchema={Yup.object({
        avatarUrl: Yup.string().url('Invalid url'),
        username: Yup.string().required('Required'),
        gender: Yup.string().required('Required')
      })}
      onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
    >
      <Form className={classes.LoginForm}>
        {isNew ? <div>Awesome! What's your name?</div> : null}

        {/* <Field name="avatarUrl" type="text" placeholder="avatar" /> */}
        <Field id="avatarUrl" name="avatarUrl" component={Avatar} onAvatarChanged={handleAvatarChange} />
        <Error>
          <ErrorMessage name="avatarUrl" />
        </Error>

        <Field name="username" type="text" placeholder="Username" />
        <Error>
          <ErrorMessage name="username" />
        </Error>

        <div className={classes.RadioButtonsGroup}>
          <Field type="radio" name="gender" id="female" value={Gender.F} />
          <label htmlFor="female">She</label>

          <Field type="radio" name="gender" id="male" value={Gender.M} />
          <label htmlFor="male">He</label>

          <Field type="radio" name="gender" id="other" value={Gender.T} />
          <label htmlFor="other">Them</label>

          <Error>
            <ErrorMessage name="gender" />
          </Error>
        </div>

        {props.error ? <Error>{props.error}</Error> : null}

        <button type="submit" disabled={props.loading}>
          Save
        </button>
      </Form>
    </Formik>
  );
  return <div>{form}</div>;
};

const mapStateToProps = (state: State): ProfileProps => {
  return {
    user: state.auth.currentUser,
    profile: state.profile.profile,
    error: state.profile.error,
    loading: state.auth.loading
  };
};

export default connect(mapStateToProps)(withAuthCheck(EditProfile));
