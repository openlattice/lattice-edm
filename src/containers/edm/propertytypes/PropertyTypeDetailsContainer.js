/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { Modal, Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as PropertyTypesActions from './PropertyTypesActions';

import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import AbstractTypes from '../../../utils/AbstractTypes';
import StyledButton from '../../../components/buttons/StyledButton';

const { FQN } = Models;

const PII_RADIO_NAME :string = 'propertyTypePii';
const PII_YES_RADIO_ID :string = 'propertyTypePii-yes';
const PII_NO_RADIO_ID :string = 'propertyTypePii-no';

/*
 * styled components
 */

const DeleteButton = styled(StyledButton)`
  align-self: center;
  margin-top: 18px;
`;

const RadiosRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  label {
    margin-right: 20px;
  }
  input {
    margin-right: 8px;
  }
`;

/*
 * types
 */

type Props = {
  actions :{
    localDeletePropertyType :RequestSequence;
    localUpdatePropertyTypeMeta :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  entityTypes :List<Map<*, *>>;
  propertyType :Map<*, *>;
  updateRequestState :RequestState;
};

type State = {
  modalState :{
    actionPrimary :() => void;
    isVisible :boolean;
    textTitle :string;
    textContent :string;
  };
}

const INITIAL_MODAL_STATE = {
  actionPrimary: () => {},
  isVisible: false,
  textTitle: '',
  textContent: '',
};

class PropertyTypeDetailsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      modalState: INITIAL_MODAL_STATE,
    };
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, updateRequestState } = this.props;
    if (prevProps.updateRequestState === RequestStates.PENDING && updateRequestState === RequestStates.SUCCESS) {
      this.resetModalState();
      actions.resetRequestState(PropertyTypesActions.LOCAL_UPDATE_PROPERTY_TYPE_META);
    }
  }

  resetModalState = () => {

    this.setState({
      modalState: INITIAL_MODAL_STATE,
    });
  }

  handleOnChangePii = (event :SyntheticInputEvent<HTMLElement>) => {

    const { actions, propertyType } = this.props;

    let pii;
    if (event.target.id === PII_YES_RADIO_ID) {
      pii = true;
    }
    else if (event.target.id === PII_NO_RADIO_ID) {
      pii = false;
    }
    else {
      // TODO: handle edge case, though this should not be possible
      return;
    }

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const actionPrimary = () => {
        if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
          const propertyTypeId :?UUID = propertyType.get('id');
          const propertyTypeFQN :FQN = FQN.of(propertyType.get('type'));
          actions.localUpdatePropertyTypeMeta({
            propertyTypeFQN,
            propertyTypeId,
            metadata: { pii },
          });
        }
      };
      this.setState({
        modalState: {
          actionPrimary,
          isVisible: true,
          textTitle: 'Update PropertyType metadata',
          textContent: `Are you sure you want to change PII to ${String(pii)}?`,
        },
      });
    }
  }

  handleOnClickDelete = () => {

    const { actions, propertyType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const propertyTypeId :?UUID = propertyType.get('id');
      const propertyTypeFQN :FQN = FQN.of(propertyType.get('type'));
      actions.localDeletePropertyType({ propertyTypeFQN, propertyTypeId });
    }
  }

  renderEntityTypesSection = () => {

    const { entityTypes } = this.props;
    if (!entityTypes || entityTypes.isEmpty()) {
      return null;
    }

    return (
      <section>
        <h2>
          EntityTypes Utilizing this PropertyType
        </h2>
        <AbstractTypeDataTable
            abstractTypes={entityTypes}
            highlightOnHover
            maxHeight={500}
            workingAbstractTypeType={AbstractTypes.EntityType} />
      </section>
    );
  }

  renderPropertyTypePiiSection = () => {

    const { propertyType } = this.props;
    if (!propertyType || propertyType.isEmpty()) {
      return null;
    }

    const piiValue :boolean = propertyType.get('pii', false);

    return (
      <section>
        <h2>PII</h2>
        <RadiosRowWrapper>
          <label htmlFor={PII_YES_RADIO_ID}>
            <input
                checked={piiValue === true}
                id={PII_YES_RADIO_ID}
                name={PII_RADIO_NAME}
                onChange={this.handleOnChangePii}
                type="radio" />
            Yes
          </label>
          <label htmlFor={PII_NO_RADIO_ID}>
            <input
                type="radio"
                id={PII_NO_RADIO_ID}
                name={PII_RADIO_NAME}
                onChange={this.handleOnChangePii}
                checked={piiValue === false} />
            No
          </label>
        </RadiosRowWrapper>
      </section>
    );
  }

  renderDeleteButtonSection = () => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      return (
        <section>
          <DeleteButton onClick={this.handleOnClickDelete}>
            Delete PropertyType
          </DeleteButton>
        </section>
      );
    }

    return null;
  }

  renderConfirmationModal = () => {

    const { updateRequestState } = this.props;
    const { modalState } = this.state;

    let body = (
      <div>{modalState.textContent}</div>
    );
    let withFooter = true;

    if (updateRequestState === RequestStates.PENDING) {
      body = (
        <Spinner size="2x" />
      );
      withFooter = false;
    }

    if (updateRequestState === RequestStates.FAILURE) {
      body = (
        <div>Update failed. Please try again.</div>
      );
    }

    return (
      <Modal
          isVisible={modalState.isVisible}
          onClose={this.resetModalState}
          onClickPrimary={modalState.actionPrimary}
          onClickSecondary={this.resetModalState}
          shouldStretchButtons
          textPrimary="Yes"
          textSecondary="Cancel"
          textTitle={modalState.textTitle}
          withFooter={withFooter}>
        {body}
      </Modal>
    );
  }

  render() {

    const { propertyType } = this.props;
    if (!propertyType || propertyType.isEmpty()) {
      return null;
    }

    const ptMultiValued :boolean = propertyType.get('multiValued', false);
    const multiValuedAsString :string = ptMultiValued === true ? 'true' : 'false';

    return (
      <div>
        <h1>PropertyType Details</h1>
        <section>
          <h2>ID</h2>
          <p>
            { propertyType.get('id') }
          </p>
        </section>
        <section>
          <AbstractTypeFieldType
              abstractType={propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <AbstractTypeFieldTitle
              abstractType={propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <AbstractTypeFieldDescription
              abstractType={propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <h2>DataType</h2>
          <p>{ propertyType.get('datatype') }</p>
        </section>
        { this.renderPropertyTypePiiSection() }
        <section>
          <h2>Multi Valued</h2>
          <p>{ multiValuedAsString }</p>
        </section>
        <section>
          <h2>Analyzer</h2>
          <p>{ propertyType.get('analyzer') }</p>
        </section>
        <section>
          <h2>Index Type</h2>
          <p>{ propertyType.get('indexType') }</p>
        </section>
        {this.renderEntityTypesSection()}
        {this.renderDeleteButtonSection()}
        {this.renderConfirmationModal()}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {

  const propertyTypeId :?UUID = props.propertyType.get('id');
  const entityTypes :List<Map<*, *>> = state.getIn(['edm', 'entityTypes', 'entityTypes'], List())
    .filter((entityType :Map<*, *>) => entityType.get('properties').includes(propertyTypeId));

  const updateRequestState :RequestState = state.getIn([
    'edm',
    'propertyTypes',
    PropertyTypesActions.LOCAL_UPDATE_PROPERTY_TYPE_META,
    'requestState',
  ]);

  return {
    entityTypes,
    updateRequestState,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    localDeletePropertyType: PropertyTypesActions.localDeletePropertyType,
    localUpdatePropertyTypeMeta: PropertyTypesActions.localUpdatePropertyTypeMeta,
    resetRequestState: PropertyTypesActions.resetRequestState,
  }, dispatch)
});

export default connect<*, *, *, *, *, *>(mapStateToProps, mapDispatchToProps)(PropertyTypeDetailsContainer);
