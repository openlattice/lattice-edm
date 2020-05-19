/*
 * @flow
 */

import React, { Component } from 'react';

import isString from 'lodash/isString';
import styled from 'styled-components';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  Set,
  fromJS,
  isCollection,
} from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import type { RequestSequence } from 'redux-reqseq';

import { openPullRequest } from './GitHubActions';
import { SUBMIT_STATES } from './GitHubReducer';
import { isValidUUID } from '../../utils/ValidationUtils';

import Spinner from '../../components/spinner/Spinner';
import StyledButton from '../../components/buttons/StyledButton';
import * as Routes from '../../core/router/Routes';

const { FQN } = Models;

const ContainerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 40px;
  position: relative;
`;

const SpinnerWrapper = styled.div`
  position: relative;
  top: 0;
`;

const SubmitSuccess = styled.div`
  align-items: center;
  color: #00be84;
  display: flex;
  flex-direction: column;
  svg {
    font-size: 36px;
  }
`;

const SubmitFailure = styled.div`
  align-items: center;
  color: #ff3c5d;
  display: flex;
  flex-direction: column;
  svg {
    font-size: 36px;
  }
`;

const Input = styled.input`
  border: 1px solid #c5d5e5;
  border-radius: 4px;
  color: #135;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 24px;
  min-width: 300px;
  outline: none;
  padding: 10px 20px;
  &:focus {
    border-color: #95aabf;
  }
  &::placeholder {
    color: #687F96;
  }
`;

const fqnComparator = (path :string[]) => (valueA :Map, valueB :Map) => {

  const fqnStrA :string = FQN.toString(valueA.getIn(path));
  const fqnStrB :string = FQN.toString(valueB.getIn(path));

  if (fqnStrA < fqnStrB) {
    return -1;
  }
  if (fqnStrA > fqnStrB) {
    return 1;
  }
  return 0;
};

const extractKeys = (obj :Map) => {
  if (!isCollection(obj)) {
    return Set();
  }
  return obj.keySeq().reduce((keySet :Set, key :any[]) => {
    let keys = keySet;
    if (isString(key) && !isValidUUID(key)) {
      keys = keys.add(key);
    }
    const value = obj.get(key);
    if (isCollection(value)) {
      keys = keys.union(extractKeys(value));
    }
    return keys;
  }, Set());
};

type Props = {
  associationTypes :List<Map<*, *>>;
  entityTypes :List<Map<*, *>>;
  isFetchingEntityDataModel :boolean;
  namespaces :List<*>;
  openPullRequest :RequestSequence;
  propertyTypes :List<Map<*, *>>;
  schemas :List<Map<*, *>>;
  submitState :number;
};

type State = {
  otp :string;
  password :string;
  username :string;
};

class GitHubContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);
    this.state = {
      otp: '',
      password: '',
      username: '',
    };
  }

  handleOnChange = (event :SyntheticInputEvent<HTMLElement>) => {

    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  createPullRequest = () => {

    const {
      associationTypes,
      entityTypes,
      namespaces,
      propertyTypes,
      schemas,
    } = this.props;

    const {
      otp,
      password,
      username,
    } = this.state;

    // !!! IMPORTANT - order matters !!!
    const edm = fromJS({
      associationTypes: associationTypes.sort(fqnComparator(['entityType', 'type'])),
      entityTypes: entityTypes.sort(fqnComparator(['type'])),
      namespaces: namespaces.sort(),
      propertyTypes: propertyTypes.sort(fqnComparator(['type'])),
      schemas: schemas.sort(fqnComparator(['fqn'])),
    }).sortBy((v, k) => k);

    const keys = extractKeys(edm).sort();
    const edmAsString = JSON.stringify(edm.toJS(), keys.toJS(), 2);
    // !!! IMPORTANT - order matters !!!

    /* eslint-disable react/destructuring-assignment */
    this.props.openPullRequest({
      edmAsString,
      otp,
      password,
      username,
    });
    /* eslint-enable */
  }

  renderSubmitSuccess = () => {

    const { submitState } = this.props;
    if (submitState !== SUBMIT_STATES.SUBMIT_SUCCESS) {
      return null;
    }

    return (
      <SubmitSuccess>
        <FontAwesomeIcon icon={faCheckCircle} size="3x" />
        <p>
          Success!
        </p>
      </SubmitSuccess>
    );
  }

  renderSubmitFailure = () => {

    const { submitState } = this.props;
    if (submitState !== SUBMIT_STATES.SUBMIT_FAILURE) {
      return null;
    }

    return (
      <SubmitFailure>
        <FontAwesomeIcon icon={faTimesCircle} size="3x" />
        <p>
          Failure.
        </p>
      </SubmitFailure>
    );
  }

  renderForm = () => {

    const { submitState } = this.props;
    const {
      otp,
      password,
      username,
    } = this.state;

    if (submitState !== SUBMIT_STATES.PRE_SUBMIT) {
      return null;
    }

    return (
      <>
        <p>Please make sure you are using Google Chrome</p>
        <br />
        <Input
            name="username"
            onChange={this.handleOnChange}
            placeholder="GitHub username"
            type="text"
            value={username} />
        <Input
            name="password"
            onChange={this.handleOnChange}
            placeholder="GitHub password"
            type="password"
            value={password} />
        <Input
            name="otp"
            onChange={this.handleOnChange}
            placeholder="GitHub 2FA OTP (optional)"
            type="password"
            value={otp} />
        <StyledButton onClick={this.createPullRequest} type="button">Create Pull Request</StyledButton>
      </>
    );
  }

  render() {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return <Redirect to={Routes.ROOT} />;
    }

    const { isFetchingEntityDataModel, submitState } = this.props;
    if (isFetchingEntityDataModel || submitState === SUBMIT_STATES.IS_SUBMITTING) {
      return (
        <ContainerWrapper>
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        </ContainerWrapper>
      );
    }

    return (
      <ContainerWrapper>
        { this.renderSubmitSuccess() }
        { this.renderSubmitFailure() }
        { this.renderForm() }
      </ContainerWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes']),
  entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
  isFetchingEntityDataModel: state.getIn(['edm', 'isFetchingEntityDataModel']),
  namespaces: state.getIn(['edm', 'namespaces']),
  propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
  schemas: state.getIn(['edm', 'schemas', 'schemas']),
  submitState: state.getIn(['github', 'submitState'], SUBMIT_STATES.PRE_SUBMIT),
});

export default withRouter<*>(
  connect(mapStateToProps, { openPullRequest })(GitHubContainer)
);
