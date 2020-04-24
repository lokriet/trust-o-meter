import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { Gender, Profile } from '../../../store/model/profile';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import Avatar from './Avatar/Avatar';
import classes from './EditProfile.module.css';

interface ProfileProps {
  profile: Profile | null;
  error: string | null;
  loading: boolean;
}

const EditProfile = (props: ProfileProps) => {
  const [isNew] = useState(!(props.profile && props.profile.initialized));
  const history = useHistory();

  useEffect(() => {
    if (isNew && props.profile && props.profile.initialized) {
      history.push('/');
    }
  }, [props.profile])

  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    (formValues) => {
      dispatch(actions.updateProfile(formValues));
    },
    [dispatch]
  );

  const handleAvatarChange = useCallback(
    (newAvatarUrl) => {
      // if (newAvatarUrl !== null) {
      //   const newAvatarUrlsToCheck = new Set(avatarUrlsToCheck);
      //   newAvatarUrlsToCheck.add(newAvatarUrl);
      //   setAvatarUrlsToCheck(newAvatarUrlsToCheck);
      // }
    },
    [
      /*avatarUrlsToCheck*/
    ]
  );

  const form = (
    <>
      {isNew ? <div>Awesome! Before we go on, please tell us about yourself!</div> : null}

      <Formik
        initialValues={{
          avatarUrl: props.profile?.avatarUrl || '',
          username: props.profile?.username || '',
          gender: props.profile?.gender || ''
        }}
        validationSchema={Yup.object({
          avatarUrl: Yup.string().url('Invalid url'),
          username: Yup.string().required('Required'),
          gender: Yup.string().required('Required')
        })}
        onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
      >
        <Form className={classes.LoginForm}>
          {/* <Field name="avatarUrl" type="text" placeholder="avatar" /> */}
          <Field
            id="avatarUrl"
            name="avatarUrl"
            component={Avatar}
            onAvatarChanged={handleAvatarChange}
          />
          <Error>
            <ErrorMessage name="avatarUrl" />
          </Error>

          <Field name="username" type="text" placeholder="Name" />
          <Error>
            <ErrorMessage name="username" />
          </Error>

          <div className={classes.RadioButtonsGroup}>
            <Field
              type="radio"
              name="gender"
              id="female"
              value={Gender.Female}
            />
            <label htmlFor="female">She</label>

            <Field type="radio" name="gender" id="male" value={Gender.Male} />
            <label htmlFor="male">He</label>

            <Field type="radio" name="gender" id="other" value={Gender.Other} />
            <label htmlFor="other">Them</label>

            <Error>
              <ErrorMessage name="gender" />
            </Error>
          </div>

          {isNew ? null : 
          <div>
            Your identificator is: {props.profile?.identificator}
          </div>
          }

          {props.error ? <Error>{props.error}</Error> : null}

          <button type="submit" disabled={props.loading}>
            Save
          </button>
        </Form>
      </Formik>
    </>
  );
  return <div>{form}</div>;
};

const mapStateToProps = (state: State): ProfileProps => {
  return {
    profile: state.profile.profile,
    error: state.profile.error,
    loading: state.profile.loading
  };
};

export default connect(mapStateToProps)(withAuthCheck(EditProfile));
