/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Models, Types } from 'lattice';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../components/datatable/AbstractTypeDataTable';
import AbstractTypeSearchableSelect from '../../components/controls/AbstractTypeSearchableSelect';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import StyledButton from '../../components/buttons/StyledButton';
import StyledCard from '../../components/cards/StyledCard';

import { EDM_PRIMITIVE_TYPES } from '../../utils/EdmPrimitiveTypes';
import { createAssociationTypeRequest } from './associationtypes/AssociationTypesActionFactory';
import { createEntityTypeRequest } from './entitytypes/EntityTypesActionFactory';
import { createPropertyTypeRequest } from './propertytypes/PropertyTypesActionFactory';

import type { AbstractType } from '../../utils/AbstractTypes';

const {
  FullyQualifiedName,
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder,
  PropertyType,
  PropertyTypeBuilder
} = Models;

const {
  AnalyzerTypes,
  SecurableTypes
} = Types;

/*
 * constants
 */

const DATA_TYPE_OPTIONS = EDM_PRIMITIVE_TYPES.map((primitive :string) => {
  return (
    <option key={primitive} value={primitive}>{primitive}</option>
  );
});

/*
 * styled components
 */

const AbstractTypeCreateCard = StyledCard.extend`
  flex: 3 0 auto;
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
    createAssociationTypeRequest :Function,
    createEntityTypeRequest :Function,
    createPropertyTypeRequest :Function
  },
  propertyTypes :List<Map<*, *>>,
  workingAbstractTypeType :AbstractType,
  onCancel :Function
}

type State = {
  datatypeValue :string,
  descriptionValue :string,
  filteredPrimaryKeyPropertyTypes :List<Map<*, *>>,
  filteredPropertyTypes :List<Map<*, *>>,
  isInEditModeName :boolean,
  isInEditModeNamespace :boolean,
  isInEditModeTitle :boolean,
  nameValue :string,
  namespaceValue :string,
  phoneticSearchesValue :boolean,
  piiValue :boolean,
  titleValue :string,
  selectedPrimaryKeyPropertyTypes :Set<Map<*, *>>,
  selectedPropertyTypes :Set<Map<*, *>>
}

class AbstractTypeCreateContainer extends React.Component<Props, State> {

  static defaultProps = {
    workingAbstractTypeType: AbstractTypes.PropertyType,
    onCancel: () => {}
  }

  constructor(props :Props) {

    super(props);

    this.state = {
      datatypeValue: 'String',
      descriptionValue: '',
      filteredPrimaryKeyPropertyTypes: props.propertyTypes,
      filteredPropertyTypes: props.propertyTypes,
      isInEditModeName: true,
      isInEditModeNamespace: true,
      isInEditModeTitle: true,
      nameValue: '',
      namespaceValue: '',
      phoneticSearchesValue: false,
      piiValue: false,
      selectedPrimaryKeyPropertyTypes: Immutable.Set(),
      selectedPropertyTypes: Immutable.Set(),
      titleValue: ''
    };
  }

  isReadyToSubmit = () :boolean => {

    let isReadyToSubmit :boolean =
        !this.state.isInEditModeNamespace
        && !this.state.isInEditModeName
        && !this.state.isInEditModeTitle
        && !!this.state.nameValue
        && !!this.state.namespaceValue
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

    if (this.props.workingAbstractTypeType === AbstractTypes.PropertyType) {

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

      this.props.actions.createPropertyTypeRequest(newPropertyType);
    }
    else {

      const primaryKeyPropertyTypeIds :Set<string> = this.state.selectedPrimaryKeyPropertyTypes
        .map((propertyType :Map<*, *>) => {
          return propertyType.get('id', '');
        });

      const propertyTypeIds :Set<string> = this.state.selectedPropertyTypes
        .map((propertyType :Map<*, *>) => {
          return propertyType.get('id', '');
        })
        .concat(primaryKeyPropertyTypeIds);

      const newEntityType :EntityType = new EntityTypeBuilder()
        .setType(new FullyQualifiedName(this.state.namespaceValue, this.state.nameValue))
        .setTitle(this.state.titleValue)
        .setDescription(this.state.descriptionValue)
        .setKey(primaryKeyPropertyTypeIds.toJS())
        .setPropertyTypes(propertyTypeIds.toJS())
        .setCategory(SecurableTypes.EntityType)
        .build();

      if (this.props.workingAbstractTypeType === AbstractTypes.EntityType) {
        this.props.actions.createEntityTypeRequest(newEntityType);
      }
    }
  }

  addToSelectedPrimaryKeyPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPropertyType :Map<*, *> = this.props.propertyTypes.find((propertyType :Map<*, *>) => {
      return propertyType.get('id', '') === selectedPropertyTypeId;
    });

    const selectedPrimaryKeyPropertyTypes = this.state.selectedPrimaryKeyPropertyTypes.add(selectedPropertyType);
    const selectedPropertyTypes = this.state.selectedPropertyTypes.subtract(selectedPrimaryKeyPropertyTypes);

    this.setState({
      selectedPrimaryKeyPropertyTypes,
      selectedPropertyTypes
    });
  }

  addToSelectedPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPropertyType :Map<*, *> = this.props.propertyTypes.find((propertyType :Map<*, *>) => {
      return propertyType.get('id', '') === selectedPropertyTypeId;
    });

    if (this.state.selectedPrimaryKeyPropertyTypes.contains(selectedPropertyType)) {
      return;
    }

    this.setState({
      selectedPropertyTypes: this.state.selectedPropertyTypes.add(selectedPropertyType)
    });
  }

  removeFromSelectedPrimaryKeyPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPropertyType :Map<*, *> = this.state.selectedPrimaryKeyPropertyTypes
      .find((propertyType :Map<*, *>) => {
        return propertyType.get('id', '') === selectedPropertyTypeId;
      });

    this.setState({
      selectedPrimaryKeyPropertyTypes: this.state.selectedPrimaryKeyPropertyTypes.remove(selectedPropertyType)
    });
  }

  removeFromSelectedPropertyTypes = (selectedPropertyTypeId :string) => {

    const selectedPropertyType :Map<*, *> = this.state.selectedPropertyTypes.find((propertyType :Map<*, *>) => {
      return propertyType.get('id', '') === selectedPropertyTypeId;
    });

    this.setState({
      selectedPropertyTypes: this.state.selectedPropertyTypes.remove(selectedPropertyType)
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

  renderPropertyTypeDataTypeSelect = () => {

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

  renderSelectFromAvailableAbstractTypes = (
    abstractTypes :List<Map<*, *>>,
    abstractTypeType :AbstractType,
    onAbstractTypeSelect :Function
  ) => {

    return (
      <AbstractTypeSearchableSelectWrapper>
        <AbstractTypeSearchableSelect
            abstractTypes={abstractTypes}
            maxHeight={400}
            workingAbstractTypeType={abstractTypeType}
            onAbstractTypeSelect={onAbstractTypeSelect} />
      </AbstractTypeSearchableSelectWrapper>
    );
  }

  renderPrimaryKeyPropertyTypesSelect = () => {

    // don't render if we're creating a new PropertyType
    if (this.props.workingAbstractTypeType === AbstractTypes.PropertyType) {
      return null;
    }

    const {
      propertyTypes
    } = this.props;

    const {
      selectedPrimaryKeyPropertyTypes
    } = this.state;

    const availablePropertyTypes :Set<Map<*, *>> = propertyTypes.toSet().subtract(selectedPrimaryKeyPropertyTypes);

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
                  abstractTypes={selectedPrimaryKeyPropertyTypes.toList()}
                  maxHeight={400}
                  type={AbstractTypes.PropertyType}
                  zIndex={100}
                  onAbstractTypeSelect={this.removeFromSelectedPrimaryKeyPropertyTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            availablePropertyTypes.toList(),
            AbstractTypes.PropertyType,
            this.addToSelectedPrimaryKeyPropertyTypes
          )
        }
      </PrimaryKeyPropertyTypesSection>
    );
  }

  renderPropertyTypesSelect = () => {

    // don't render if we're creating a new PropertyType
    if (this.props.workingAbstractTypeType === AbstractTypes.PropertyType) {
      return null;
    }

    const {
      propertyTypes
    } = this.props;

    const {
      selectedPrimaryKeyPropertyTypes,
      selectedPropertyTypes
    } = this.state;

    const availablePropertyTypes :Set<Map<*, *>> = propertyTypes.toSet()
      .subtract(selectedPropertyTypes)
      .subtract(selectedPrimaryKeyPropertyTypes);

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
                  abstractTypes={selectedPropertyTypes.toList()}
                  maxHeight={400}
                  type={AbstractTypes.PropertyType}
                  zIndex={90}
                  onAbstractTypeSelect={this.removeFromSelectedPropertyTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            availablePropertyTypes.toList(),
            AbstractTypes.PropertyType,
            this.addToSelectedPropertyTypes
          )
        }
      </PropertyTypesSection>
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
        {
          this.renderPropertyTypeDataTypeSelect()
        }
        {
          this.renderPrimaryKeyPropertyTypesSelect()
        }
        {
          this.renderPropertyTypesSelect()
        }
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
    createAssociationTypeRequest,
    createEntityTypeRequest,
    createPropertyTypeRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AbstractTypeCreateContainer);
