import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { Gender, Profile } from '../../../store/model/profile';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import Spinner from '../../UI/Spinner/Spinner';
import Avatar from './Avatar/Avatar';
import classes from './EditProfile.module.scss';

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
  }, [props.profile, isNew, history]);

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
      {isNew ? (
        <>
          <h1>Awesome!</h1>
          <p>Before we go on, please tell us about yourself!</p>
        </>
      ) : null}

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
        <Form>
          {/* <Field name="avatarUrl" type="text" placeholder="avatar" /> */}
          <div className={classes.FieldHeader}>What's your name?</div>
          <Field
            name="username"
            type="text"
            placeholder="Name"
            className={classes.NameInput}
          />
          <Error>
            <ErrorMessage name="username" />
          </Error>

          <div className={classes.FieldHeader}>What are your pronouns?</div>
          <div className={classes.RadioButtonsGroup}>
            <Field
              type="radio"
              name="gender"
              id="female"
              value={Gender.Female}
            />
            <label htmlFor="female" className={classes.PronounLabel}>
              She
            </label>

            <Field type="radio" name="gender" id="male" value={Gender.Male} />
            <label htmlFor="male" className={classes.PronounLabel}>
              He
            </label>

            <Field type="radio" name="gender" id="other" value={Gender.Other} />
            <label htmlFor="other" className={classes.PronounLabel}>
              Them
            </label>
          </div>
          <Error>
            <ErrorMessage name="gender" />
          </Error>

          <div className={classes.FieldHeader}>Your profile picture</div>
          <Field
            id="avatarUrl"
            name="avatarUrl"
            component={Avatar}
            onAvatarChanged={handleAvatarChange}
          />
          <Error>
            <ErrorMessage name="avatarUrl" />
          </Error>

          {isNew ? null : (
            <div className={classes.FieldHeader}>
              Your identificator is: {props.profile?.identificator}
            </div>
          )}

          <button
            type="submit"
            disabled={props.loading}
            className={`${classes.Button} ${classes.SaveButton}`}
          >
            {props.loading ? <Spinner className="ButtonSpinner" /> : 'Save'}
          </button>

          {props.error ? <Error>{props.error}</Error> : null}
        </Form>
      </Formik>
    </>
  );
  return <div className={classes.Content}>{form}</div>;
};

const mapStateToProps = (state: State): ProfileProps => {
  return {
    profile: state.profile.profile,
    error: state.profile.error,
    loading: state.profile.loading
  };
};

export default connect(mapStateToProps)(withAuthCheck(EditProfile));
