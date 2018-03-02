/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../components/datatable/AbstractTypeDataTable';
import AbstractTypeSearchableSelect from '../../components/controls/AbstractTypeSearchableSelect';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import StyledButton from '../../components/buttons/StyledButton';
import StyledCard from '../../components/cards/StyledCard';

import { EDM_PRIMITIVE_TYPES } from '../../utils/EdmPrimitiveTypes';

import type { AbstractType } from '../../utils/AbstractTypes';

const {
  createAssociationType,
  createEntityType,
  createPropertyType,
  createSchema
} = EntityDataModelApiActionFactory;

const {
  FullyQualifiedName,
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder,
  PropertyType,
  PropertyTypeBuilder,
  Schema,
  SchemaBuilder
} = Models;

const {
  AnalyzerTypes,
  SecurableTypes
} = Types;

/*
 * constants
 */

const BIDI_RADIO_NAME :string = 'associationTypeBidi';
const BIDI_YES_RADIO_ID :string = 'associationTypeBidi-1';
const BIDI_NO_RADIO_ID :string = 'associationTypeBidi-2';

const PII_RADIO_NAME :string = 'propertyTypePii';
const PII_YES_RADIO_ID :string = 'propertyTypePii-1';
const PII_NO_RADIO_ID :string = 'propertyTypePii-2';

const DATA_TYPE_OPTIONS = EDM_PRIMITIVE_TYPES.map((primitive :string) => (
  <option key={primitive} value={primitive}>{primitive}</option>
));

/*
 * styled components
 */

const AbstractTypeCreateCard = StyledCard.extend`
  flex: 50%;
  max-width: 1000px;
  min-width: 500px;
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

const DataTypeSelect = styled.select`
  align-self: left;
  background: none;
  border: 1px solid #c5d5e5;
  height: 32px;
  outline: none;
`;

const PhoneticCheckboxWrapper = styled.label`
  margin-top: 20px;
  input {
    margin-right: 8px;
  }
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

const AbstractTypeSearchableSelectWrapper = styled.div`
  margin: 20px 0;
`;

const PrimaryKeyPropertyTypesSection = styled.section`
  z-index: 1000;
`;

const PropertyTypesSection = styled.section`
  z-index: 900;
`;

/*
 * types
 */

type Props = {
  actions :{
    createAssociationType :RequestSequence;
    createEntityType :RequestSequence;
    createPropertyType :RequestSequence;
    createSchema :RequestSequence;
  };
  entityTypes :List<Map<*, *>>;
  propertyTypes :List<Map<*, *>>;
  workingAbstractTypeType :AbstractType;
  onCancel :() => void;
};

type State = {
  bidiValue :boolean;
  datatypeValue :string;
  descriptionValue :string;
  isInEditModeName :boolean;
  isInEditModeNamespace :boolean;
  isInEditModeTitle :boolean;
  nameValue :string;
  namespaceValue :string;
  phoneticSearchesValue :boolean;
  piiValue :boolean;
  titleValue :string;
  selectedDestinationEntityTypes :Set<Map<*, *>>;
  selectedPrimaryKeyPropertyTypes :Set<Map<*, *>>;
  selectedPropertyTypes :Set<Map<*, *>>;
  selectedSourceEntityTypes :Set<Map<*, *>>;
};

class AbstractTypeCreateContainer extends React.Component<Props, State> {

  static defaultProps = {
    workingAbstractTypeType: AbstractTypes.PropertyType,
    onCancel: () => {}
  }

  constructor(props :Props) {

    super(props);

    this.state = {
      bidiValue: false,
      datatypeValue: 'String',
      descriptionValue: '',
      isInEditModeName: true,
      isInEditModeNamespace: true,
      isInEditModeTitle: true,
      nameValue: '',
      namespaceValue: '',
      phoneticSearchesValue: false,
      piiValue: false,
      selectedDestinationEntityTypes: Set(),
      selectedPrimaryKeyPropertyTypes: Set(),
      selectedPropertyTypes: Set(),
      selectedSourceEntityTypes: Set(),
      titleValue: ''
    };
  }

  isReadyToSubmit = () :boolean => {

    let isReadyToSubmit :boolean =
      !this.state.isInEditModeName
      && !this.state.isInEditModeNamespace
      && !!this.state.nameValue
      && !!this.state.namespaceValue;

    if (this.props.workingAbstractTypeType === AbstractTypes.Schema) {
      return isReadyToSubmit;
    }

    isReadyToSubmit = isReadyToSubmit
      && !this.state.isInEditModeTitle
      && !!this.state.titleValue;

    if (this.props.workingAbstractTypeType === AbstractTypes.PropertyType) {
      isReadyToSubmit = isReadyToSubmit && !!this.state.datatypeValue;
    }
    else {
      isReadyToSubmit = isReadyToSubmit
        && (!this.state.selectedPropertyTypes.isEmpty() || !this.state.selectedPrimaryKeyPropertyTypes.isEmpty());
    }

    return isReadyToSubmit;
  }

  submitCreateAbstractTypeRequest = () => {

    if (this.props.workingAbstractTypeType === AbstractTypes.Schema) {

      const newSchema :Schema = (new SchemaBuilder())
        .setFullyQualifiedName(new FullyQualifiedName(this.state.namespaceValue, this.state.nameValue))
        .build();

      this.props.actions.createSchema(newSchema);
    }
    else if (this.props.workingAbstractTypeType === AbstractTypes.PropertyType) {

      const analyzer :string = (this.state.datatypeValue === 'String' && this.state.phoneticSearchesValue)
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

      this.props.actions.createPropertyType(newPropertyType);
    }
    else {

      const primaryKeyPropertyTypeIds :Set<string> = this.state.selectedPrimaryKeyPropertyTypes
        .map((propertyType :Map<*, *>) => propertyType.get('id', ''));

      const propertyTypeIds :Set<string> = this.state.selectedPropertyTypes
        .map((propertyType :Map<*, *>) => propertyType.get('id', ''))
        .concat(primaryKeyPropertyTypeIds);

      const entityTypeBuilder :EntityTypeBuilder = new EntityTypeBuilder()
        .setType(new FullyQualifiedName(this.state.namespaceValue, this.state.nameValue))
        .setTitle(this.state.titleValue)
        .setDescription(this.state.descriptionValue)
        .setKey(primaryKeyPropertyTypeIds.toJS())
        .setPropertyTypes(propertyTypeIds.toJS());

      if (this.props.workingAbstractTypeType === AbstractTypes.EntityType) {

        const newEntityType :EntityType = entityTypeBuilder
          .setCategory(SecurableTypes.EntityType)
          .build();

        this.props.actions.createEntityType(newEntityType);
      }
      else if (this.props.workingAbstractTypeType === AbstractTypes.AssociationType) {

        const newAssociationEntityType :EntityType = entityTypeBuilder
          .setCategory(SecurableTypes.AssociationType)
          .build();

        const sourceEntityTypeIds :Set<string> = this.state.selectedSourceEntityTypes
          .map((entityType :Map<*, *>) => entityType.get('id', ''));

        const destinationEntityTypeIds :Set<string> = this.state.selectedDestinationEntityTypes
          .map((entityType :Map<*, *>) => entityType.get('id', ''));

        const newAssociationType :AssociationType = new AssociationTypeBuilder()
          .setEntityType(newAssociationEntityType)
          .setSourceEntityTypeIds(sourceEntityTypeIds.toJS())
          .setDestinationEntityTypeIds(destinationEntityTypeIds.toJS())
          .setBidirectional(this.state.bidiValue)
          .build();

        this.props.actions.createAssociationType(newAssociationType);
      }
      else {
        // TODO: need a Logger class
        // console.error('invalid AbstractType: ', this.props.workingAbstractTypeType);
      }
    }
  }

  addToSelectedDestinationEntityTypes = (selectedEntityTypeId :string) => {

    const selectedEntityType :Map<*, *> = this.props.entityTypes.find((entityType :Map<*, *>) => (
      entityType.get('id', '') === selectedEntityTypeId
    ));

    const selectedDestinationEntityTypes :Set<Map<*, *>> = this.state.selectedDestinationEntityTypes
      .add(selectedEntityType);

    this.setState({
      selectedDestinationEntityTypes
    });
  }

  addToSelectedPrimaryKeyPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPropertyType :Map<*, *> = this.props.propertyTypes.find((propertyType :Map<*, *>) => (
      propertyType.get('id', '') === selectedPropertyTypeId
    ));

    const selectedPrimaryKeyPropertyTypes = this.state.selectedPrimaryKeyPropertyTypes.add(selectedPropertyType);
    const selectedPropertyTypes = this.state.selectedPropertyTypes.subtract(selectedPrimaryKeyPropertyTypes);

    this.setState({
      selectedPrimaryKeyPropertyTypes,
      selectedPropertyTypes
    });
  }

  addToSelectedPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPropertyType :Map<*, *> = this.props.propertyTypes.find((propertyType :Map<*, *>) => (
      propertyType.get('id', '') === selectedPropertyTypeId
    ));

    if (this.state.selectedPrimaryKeyPropertyTypes.contains(selectedPropertyType)) {
      return;
    }

    this.setState({
      selectedPropertyTypes: this.state.selectedPropertyTypes.add(selectedPropertyType)
    });
  }

  addToSelectedSourceEntityTypes = (selectedEntityTypeId :string) => {

    const selectedEntityType :Map<*, *> = this.props.entityTypes.find((entityType :Map<*, *>) => (
      entityType.get('id', '') === selectedEntityTypeId
    ));

    const selectedSourceEntityTypes :Set<Map<*, *>> = this.state.selectedSourceEntityTypes
      .add(selectedEntityType);

    this.setState({
      selectedSourceEntityTypes
    });
  }

  removeFromSelectedDestinationEntityTypes = (selectedEntityTypeId :string) => {

    const selectedDestinationEntityTypes :Set<Map<*, *>> = this.state.selectedDestinationEntityTypes
      .filterNot((entityType :Map<*, *>) => entityType.get('id', '') === selectedEntityTypeId);

    this.setState({
      selectedDestinationEntityTypes
    });
  }

  removeFromSelectedPrimaryKeyPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPrimaryKeyPropertyTypes :Set<Map<*, *>> = this.state.selectedPrimaryKeyPropertyTypes
      .filterNot((propertyType :Map<*, *>) => propertyType.get('id', '') === selectedPropertyTypeId);

    this.setState({
      selectedPrimaryKeyPropertyTypes
    });
  }

  removeFromSelectedPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPropertyTypes :Set<Map<*, *>> = this.state.selectedPropertyTypes
      .filterNot((propertyType :Map<*, *>) => propertyType.get('id', '') === selectedPropertyTypeId);

    this.setState({
      selectedPropertyTypes
    });
  }

  removeFromSelectedSourceEntityTypes = (selectedEntityTypeId :string) => {

    const selectedSourceEntityTypes :Set<Map<*, *>> = this.state.selectedSourceEntityTypes
      .filterNot((entityType :Map<*, *>) => entityType.get('id', '') === selectedEntityTypeId);

    this.setState({
      selectedSourceEntityTypes
    });
  }

  handleOnChangeBidi = (event :SyntheticInputEvent<*>) => {

    this.setState({
      bidiValue: event.target.id === BIDI_YES_RADIO_ID
    });
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

  handleOnChangePhoneticSearches = (event :SyntheticInputEvent<*>) => {

    this.setState({
      phoneticSearchesValue: event.target.checked || false
    });
  }

  handleOnChangePii = (event :SyntheticInputEvent<*>) => {

    this.setState({
      piiValue: event.target.id === PII_YES_RADIO_ID
    });
  }

  handleOnChangeTitle = (title :string) => {

    this.setState({
      titleValue: title || '',
      isInEditModeTitle: false
    });
  }

  handleOnEditToggleName = (editable :boolean) => {

    this.setState({
      isInEditModeName: editable
    });
  }

  handleOnEditToggleNamespace = (editable :boolean) => {

    this.setState({
      isInEditModeNamespace: editable
    });
  }

  handleOnEditToggleTitle = (editable :boolean) => {

    this.setState({
      isInEditModeTitle: editable
    });
  }

  renderAbstractTypeInputField = (type :string, name :string, onChange :Function, onEditToggle :Function) => {

    return (
      <div>
        <h2>{ name }</h2>
        <InlineEditableControl
            type={type}
            placeholder={`${name}...`}
            onChange={onChange}
            onEditToggle={onEditToggle} />
      </div>
    );
  }

  renderTitleSection = () => {

    // don't render if we're creating a new Schema
    if (this.props.workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    return (
      <section>
        {
          this.renderAbstractTypeInputField(
            'text',
            'Title',
            this.handleOnChangeTitle,
            this.handleOnEditToggleTitle
          )
        }
      </section>
    );
  }

  renderDescriptionSection = () => {

    // don't render if we're creating a new Schema
    if (this.props.workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    return (
      <section>
        {
          this.renderAbstractTypeInputField(
            'textarea',
            'Description',
            this.handleOnChangeDescription,
            () => {}
          )
        }
      </section>
    );
  }

  renderPropertyTypeDataTypeSelectSection = () => {

    if (this.props.workingAbstractTypeType !== AbstractTypes.PropertyType) {
      return null;
    }

    return (
      <section>
        <h2>Data Type</h2>
        <DataTypeSelect onChange={this.handleOnChangeDataType} defaultValue="String">
          { DATA_TYPE_OPTIONS }
        </DataTypeSelect>
        {
          this.state.datatypeValue !== 'String'
            ? null
            : (
              <PhoneticCheckboxWrapper htmlFor="propertyTypeAllowPhoneticSearches">
                <input
                    type="checkbox"
                    id="propertyTypeAllowPhoneticSearches"
                    onChange={this.handleOnChangePhoneticSearches}
                    checked={this.state.phoneticSearchesValue} />
                Allow phonetic searches
              </PhoneticCheckboxWrapper>
            )
        }
      </section>
    );
  }

  renderPropertyTypePiiSection = () => {

    if (this.props.workingAbstractTypeType !== AbstractTypes.PropertyType) {
      return null;
    }

    return (
      <section>
        <h2>PII</h2>
        <RadiosRowWrapper>
          <label htmlFor={PII_YES_RADIO_ID}>
            <input
                type="radio"
                id={PII_YES_RADIO_ID}
                name={PII_RADIO_NAME}
                onChange={this.handleOnChangePii}
                checked={this.state.piiValue === true} />
            Yes
          </label>
          <label htmlFor={PII_NO_RADIO_ID}>
            <input
                type="radio"
                id={PII_NO_RADIO_ID}
                name={PII_RADIO_NAME}
                onChange={this.handleOnChangePii}
                checked={this.state.piiValue === false} />
            No
          </label>
        </RadiosRowWrapper>
      </section>
    );
  }

  renderAssociationTypeBidirectionalSection = () => {

    if (this.props.workingAbstractTypeType !== AbstractTypes.AssociationType) {
      return null;
    }

    return (
      <section>
        <h2>Bidirectional</h2>
        <RadiosRowWrapper>
          <label htmlFor={BIDI_YES_RADIO_ID}>
            <input
                type="radio"
                id={BIDI_YES_RADIO_ID}
                name={BIDI_RADIO_NAME}
                onChange={this.handleOnChangeBidi}
                checked={this.state.bidiValue === true} />
            Yes
          </label>
          <label htmlFor={BIDI_NO_RADIO_ID}>
            <input
                type="radio"
                id={BIDI_NO_RADIO_ID}
                name={BIDI_RADIO_NAME}
                onChange={this.handleOnChangeBidi}
                checked={this.state.bidiValue === false} />
            No
          </label>
        </RadiosRowWrapper>
      </section>
    );
  }

  renderSelectFromAvailableAbstractTypes = (
    abstractTypes :List<Map<*, *>>,
    abstractTypeType :AbstractType,
    searchPlaceholder :string,
    onAbstractTypeSelect :Function
  ) => {

    return (
      <AbstractTypeSearchableSelectWrapper>
        <AbstractTypeSearchableSelect
            abstractTypes={abstractTypes}
            maxHeight={400}
            searchPlaceholder={searchPlaceholder}
            workingAbstractTypeType={abstractTypeType}
            onAbstractTypeSelect={onAbstractTypeSelect} />
      </AbstractTypeSearchableSelectWrapper>
    );
  }

  renderEntityTypePrimaryKeyPropertyTypesSelectSection = () => {

    // don't render if we're creating a new PropertyType or Schema
    if (this.props.workingAbstractTypeType === AbstractTypes.PropertyType
        || this.props.workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    const availablePropertyTypes :Set<Map<*, *>> = this.props.propertyTypes.toSet()
      .subtract(this.state.selectedPrimaryKeyPropertyTypes);

    return (
      <PrimaryKeyPropertyTypesSection>
        <h2>Primary Key PropertyTypes</h2>
        {
          this.state.selectedPrimaryKeyPropertyTypes.isEmpty()
            ? (
              <p>No Primary Key PropertyTypes selected</p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={this.state.selectedPrimaryKeyPropertyTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.PropertyType}
                  onAbstractTypeSelect={this.removeFromSelectedPrimaryKeyPropertyTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            availablePropertyTypes.toList(),
            AbstractTypes.PropertyType,
            'Available PropertyTypes...',
            this.addToSelectedPrimaryKeyPropertyTypes
          )
        }
      </PrimaryKeyPropertyTypesSection>
    );
  }

  renderEntityTypePropertyTypesSelectSection = () => {

    // don't render if we're creating a new PropertyType or Schema
    if (this.props.workingAbstractTypeType === AbstractTypes.PropertyType
        || this.props.workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    const availablePropertyTypes :Set<Map<*, *>> = this.props.propertyTypes.toSet()
      .subtract(this.state.selectedPropertyTypes)
      .subtract(this.state.selectedPrimaryKeyPropertyTypes);

    return (
      <PropertyTypesSection>
        <h2>PropertyTypes</h2>
        {
          this.state.selectedPropertyTypes.isEmpty()
            ? (
              <p>No PropertyTypes selected</p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={this.state.selectedPropertyTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.PropertyType}
                  onAbstractTypeSelect={this.removeFromSelectedPropertyTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            availablePropertyTypes.toList(),
            AbstractTypes.PropertyType,
            'Available PropertyTypes...',
            this.addToSelectedPropertyTypes
          )
        }
      </PropertyTypesSection>
    );
  }

  renderAssociationTypeSourceEntityTypesSelectSection = () => {

    // only render if we're creating a new AssociationType
    if (this.props.workingAbstractTypeType !== AbstractTypes.AssociationType) {
      return null;
    }

    return (
      <section>
        <h2>Source EntityTypes</h2>
        {
          this.state.selectedSourceEntityTypes.isEmpty()
            ? (
              <p>No Source EntityTypes selected</p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={this.state.selectedSourceEntityTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.EntityType}
                  onAbstractTypeSelect={this.removeFromSelectedSourceEntityTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            this.props.entityTypes,
            AbstractTypes.EntityType,
            'Available EntityTypes...',
            this.addToSelectedSourceEntityTypes
          )
        }
      </section>
    );
  }

  renderAssociationTypeDestinationEntityTypesSelectSection = () => {

    // only render if we're creating a new AssociationType
    if (this.props.workingAbstractTypeType !== AbstractTypes.AssociationType) {
      return null;
    }

    return (
      <section>
        <h2>Destination EntityTypes</h2>
        {
          this.state.selectedDestinationEntityTypes.isEmpty()
            ? (
              <p>No Destination EntityTypes selected</p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={this.state.selectedDestinationEntityTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.EntityType}
                  onAbstractTypeSelect={this.removeFromSelectedDestinationEntityTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            this.props.entityTypes,
            AbstractTypes.EntityType,
            'Available EntityTypes...',
            this.addToSelectedDestinationEntityTypes
          )
        }
      </section>
    );
  }

  render() {

    // TODO: check values against exisitng data to notify the user in realtime

    let title :string;
    switch (this.props.workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        title = 'Create new AssociationType';
        break;
      case AbstractTypes.EntityType:
        title = 'Create new EntityType';
        break;
      case AbstractTypes.PropertyType:
        title = 'Create new PropertyType';
        break;
      case AbstractTypes.Schema:
        title = 'Create new Schema';
        break;
      default:
        title = 'Create new...';
        break;
    }

    return (
      <AbstractTypeCreateCard>
        <h1>{ title }</h1>
        <section>
          {
            this.renderAbstractTypeInputField(
              'text',
              'Namespace',
              this.handleOnChangeNamespace,
              this.handleOnEditToggleNamespace
            )
          }
        </section>
        <section>
          {
            this.renderAbstractTypeInputField(
              'text',
              'Name',
              this.handleOnChangeName,
              this.handleOnEditToggleName
            )
          }
        </section>
        { this.renderTitleSection() }
        { this.renderDescriptionSection() }
        { this.renderPropertyTypeDataTypeSelectSection() }
        { this.renderPropertyTypePiiSection() }
        { this.renderAssociationTypeBidirectionalSection() }
        { this.renderEntityTypePrimaryKeyPropertyTypesSelectSection() }
        { this.renderEntityTypePropertyTypesSelectSection() }
        { this.renderAssociationTypeSourceEntityTypesSelectSection() }
        { this.renderAssociationTypeDestinationEntityTypesSelectSection() }
        <ActionButtons>
          {
            (this.isReadyToSubmit())
              ? <StyledButton onClick={this.submitCreateAbstractTypeRequest}>Create</StyledButton>
              : <StyledButton disabled>Create</StyledButton>
          }
          <StyledButton onClick={this.props.onCancel}>Cancel</StyledButton>
        </ActionButtons>
      </AbstractTypeCreateCard>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes']),
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById']),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'])
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    createAssociationType,
    createEntityType,
    createPropertyType,
    createSchema
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AbstractTypeCreateContainer);
