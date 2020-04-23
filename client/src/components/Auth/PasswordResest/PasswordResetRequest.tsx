import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';

import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';

interface PasswordResetRequestProps {
  error: string | null;
  loading: boolean;
  requestSuccess: boolean;
}

const PasswordResetRequest = (props: PasswordResetRequestProps) => {
  const [query] = useState(new URLSearchParams(useLocation().search));
  const [requestSent, setRequestSent] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.authInit());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (formValues) => {
      setRequestSent(true);
      dispatch(actions.requestPasswordReset(formValues.email));
    },
    [dispatch]
  );

  console.log(props);
  console.log(requestSent);
  let view: JSX.Element;
  if (requestSent && props.requestSuccess) {
    view = (
      <>
        <h1>Email sent</h1>
        <p>Please check your inbox for the instructions about how to complete the process.</p>
      </>
    )
  } else {
    view = (
      <div>
        <h1>Reset your password</h1>
        <p>
          To reset your password, enter your email below and submit. An email
          will be sent to you with instructions about how to complete the
          process.
        </p>
        <Formik
          initialValues={{
            email: query.get('email')
          }}
          validationSchema={Yup.object({
            email: Yup.string()
              .required('Required')
              .email('Invalid email address')
          })}
          onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
        >
          <Form>
            <Field
              name="email"
              type="text"
              placeholder="E-mail"
              autoComplete="username"
            />
            <Error>
              <ErrorMessage name="email" />
            </Error>

            {props.error ? <Error>{props.error}</Error> : null}

            <button type="submit">
              Reset password
            </button>
          </Form>
        </Formik>
      </div>
    );
  }

  return view;
};

const mapStateToProps = (state: State): PasswordResetRequestProps => {
  return {
    error: state.auth.error,
    loading: state.auth.loading,
    requestSuccess: state.auth.resetPasswordEmailSent
  };
};

export default connect(mapStateToProps)(PasswordResetRequest);
