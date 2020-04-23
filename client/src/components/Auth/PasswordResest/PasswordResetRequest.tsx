import { ErrorMessage, Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';

import * as actions from '../../../store/actions';
import { Error } from '../../UI/Error/Error';

const PasswordResetRequest = (props) => {
  const [query] = useState(new URLSearchParams(useLocation().search));
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    (formValues) => {
      dispatch(
        actions.requestPasswordReset(formValues.email)
      );
    },
    [dispatch]
  );

  return (
    <div>
      <h1>Reset your password</h1>
      <p>To reset your password, enter your email below and submit. An email will be sent to you with instructions about how to complete the process.</p>
      <Formik
        initialValues={{
          email: query.get('email')
        }}
        validationSchema={Yup.object({
          email: Yup.string()
            .required('Required')
            .email('Invalid email address'),
          password: Yup.string()
            .required('Required')
            .min(6, 'Must be at least 6 characters long')
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

          <button type="submit" disabled={props.loading}>
            Reset password
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default PasswordResetRequest;
