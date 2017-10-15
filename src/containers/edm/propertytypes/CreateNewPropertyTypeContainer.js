/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Models, Types } from 'lattice';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import InlineEditableControl from '../../../components/controls/InlineEditableControl';
import StyledButton from '../../../components/buttons/StyledButton';
import StyledCard from '../../../components/cards/StyledCard';

import { EDM_PRIMITIVE_TYPES } from '../../../utils/EdmPrimitiveTypes';
import { createPropertyTypeRequest } from './PropertyTypesActionFactory';

const {
  FullyQualifiedName,
  PropertyType,
  PropertyTypeBuilder
} = Models;

const {
  AnalyzerTypes
} = Types;

/*
 * styled components
 */

const CreateNewPropertyTypeCard = StyledCard.extend`
  flex: 1 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

const PhoneticCheckboxWrapper = styled.label`
  margin-top: 20px;
  input {
    margin-right: 8px;
  }
`;

const ActionButtons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 20px;
  button {
    margin: 0 10px;
  }
`;

/*
 * constants
 */

const DATA_TYPE_OPTIONS = EDM_PRIMITIVE_TYPES.map((primitive :string) => {
  return (
    <option key={primitive} value={primitive}>{primitive}</option>
  );
});

/*
 * types
 */

type Props = {
  actions :{
    createPropertyTypeRequest :Function
  },
  onCancel :Function
}

type State = {
  datatypeValue :string,
  descriptionValue :string,
  isInEditModeName :boolean,
  isInEditModeNamespace :boolean,
  isInEditModeTitle :boolean,
  nameValue :string,
  namespaceValue :string,
  phoneticValue :boolean,
  piiValue :boolean,
  titleValue :string
}

class CreateNewPropertyTypeContainer extends React.Component<Props, State> {

  static defaultProps = {
    onCancel: () => {}
  }

  constructor(props :Props) {

    super(props);

    /*
     * TODO: check values against exisitng PropertyTypes to notify the user in realtime
     */

    this.state = {
      datatypeValue: 'String',
      descriptionValue: '',
      isInEditModeName: true,
      isInEditModeNamespace: true,
      isInEditModeTitle: true,
      nameValue: '',
      namespaceValue: '',
      phoneticValue: false,
      piiValue: false,
      titleValue: ''
    };
  }

  isReadyToSubmit = () :boolean => {

    return !this.state.isInEditModeNamespace
        && !this.state.isInEditModeName
        && !this.state.isInEditModeTitle
        && !!this.state.nameValue
        && !!this.state.namespaceValue
        && !!this.state.titleValue
        && !!this.state.datatypeValue;
  }

  handleOnChangeDataType = (event :SyntheticInputEvent<*>) => {

    this.setState({
      datatypeValue: event.target.value || ''
    });
  }

  handleOnChangeDescription = (description :string) => {

    this.setState({
      descriptionValue: description || ''
    });
  }

  handleOnChangeName = (name :string) => {

    this.setState({
      nameValue: name || '',
      isInEditModeName: false
    });
  }

  handleOnChangeNamespace = (namespace :string) => {

    this.setState({
      namespaceValue: namespace || '',
      isInEditModeNamespace: false
    });
  }

  handleOnChangePhonetic = (event :SyntheticInputEvent<*>) => {

    this.setState({
      phoneticValue: event.target.checked || false
    });
  }

  handleOnChangeTitle = (title :string) => {

    this.setState({
      titleValue: title || '',
      isInEditModeTitle: false
    });
  }

  handleOnClickCreate = () => {

    const analyzer :string = (this.state.datatypeValue === 'String' && this.state.phoneticValue)
      ? AnalyzerTypes.METAPHONE
      : AnalyzerTypes.STANDARD;

    const newPropertyType :PropertyType = new PropertyTypeBuilder()
      .setType(new FullyQualifiedName(this.state.namespaceValue, this.state.nameValue))
      .setTitle(this.state.titleValue)
      .setDescription(this.state.descriptionValue)
      .setDataType(this.state.datatypeValue)
      .setPii(this.state.piiValue)
      .setAnalyzer(analyzer)
      .build();

    this.props.actions.createPropertyTypeRequest(newPropertyType);
  }

  render() {

    return (
      <CreateNewPropertyTypeCard>
        <h1>Create New PropertyType</h1>
        <section>
          <h2>Namespace</h2>
          <InlineEditableControl
              type="text"
              placeholder="Namespace..."
              viewOnly={false}
              onChange={this.handleOnChangeNamespace}
              onEditable={(editable) => {
                this.setState({ isInEditModeNamespace: editable });
              }} />
        </section>
        <section>
          <h2>Name</h2>
          <InlineEditableControl
              type="text"
              placeholder="Name..."
              viewOnly={false}
              onChange={this.handleOnChangeName}
              onEditable={(editable) => {
                this.setState({ isInEditModeName: editable });
              }} />
        </section>
        <section>
          <h2>Title</h2>
          <InlineEditableControl
              type="text"
              placeholder="Title..."
              viewOnly={false}
              onChange={this.handleOnChangeTitle}
              onEditable={(editable) => {
                this.setState({ isInEditModeTitle: editable });
              }} />
        </section>
        <section>
          <h2>Description</h2>
          <InlineEditableControl
              type="textarea"
              placeholder="Description..."
              viewOnly={false}
              onChange={this.handleOnChangeDescription} />
        </section>
        <section>
          <h2>Data Type</h2>
          <select onChange={this.handleOnChangeDataType} defaultValue="String">
            { DATA_TYPE_OPTIONS }
          </select>
          {
            this.state.datatypeValue !== 'String'
              ? null
              : (
                <PhoneticCheckboxWrapper htmlFor="phonetic">
                  <input
                      type="checkbox"
                      id="phonetic"
                      onChange={this.handleOnChangePhonetic}
                      checked={this.state.phoneticValue} />
                  Allow phonetic searches
                </PhoneticCheckboxWrapper>
              )
          }
        </section>
        <ActionButtons>
          {
            (this.isReadyToSubmit())
              ? <StyledButton onClick={this.handleOnClickCreate}>Create</StyledButton>
              : <StyledButton disabled>Create</StyledButton>
          }
          <StyledButton onClick={this.props.onCancel}>Cancel</StyledButton>
        </ActionButtons>
      </CreateNewPropertyTypeCard>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], Immutable.List())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    createPropertyTypeRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewPropertyTypeContainer);
