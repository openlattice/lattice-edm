/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Models, Types } from 'lattice';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypes from '../../../utils/AbstractTypes';
import InlineEditableControl from '../../../components/controls/InlineEditableControl';
import SearchInput from '../../../components/controls/SearchInput';
import StyledButton from '../../../components/buttons/StyledButton';
import StyledCard from '../../../components/cards/StyledCard';

import { createEntityTypeRequest } from './EntityTypesActionFactory';

const {
  FullyQualifiedName,
  EntityType,
  EntityTypeBuilder
} = Models;

const {
  SecurableTypes
} = Types;

/*
 * styled components
 */

const CreateNewEntityTypeCard = StyledCard.extend`
  flex: 1 0 auto;
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

const PropertyTypeSearch = styled(SearchInput)`
  margin: 20px 0;
  width: 100%;
`;

const AvailablePropertyTypesDataTableWrapper = styled.div`
  margin: 20px 50px;
`;

/*
 * types
 */

type Props = {
  actions :{
    createEntityTypeRequest :Function
  },
  propertyTypes :List<Map<*, *>>,
  onCancel :Function
}

type State = {
  descriptionValue :string,
  filteredPrimaryKeyPropertyTypes :List<Map<*, *>>,
  filteredPropertyTypes :List<Map<*, *>>,
  isInEditModeName :boolean,
  isInEditModeNamespace :boolean,
  isInEditModeTitle :boolean,
  nameValue :string,
  namespaceValue :string,
  titleValue :string,
  selectedPrimaryKeyPropertyTypes :Set<Map<*, *>>,
  selectedPropertyTypes :Set<Map<*, *>>
}

class CreateNewEntityTypeContainer extends React.Component<Props, State> {

  static defaultProps = {
    onCancel: () => {}
  }

  static filterPropertyTypes(props :Props, filterQuery :?string) :List<Map<*, *>> {

    return props.propertyTypes.filter((propertyType :Map<*, *>) => {

      const propertyTypeId :string = propertyType.get('id', '');
      const propertyTypeType :Map<string, string> = propertyType.get('type', Immutable.Map());
      const propertyTypeFqn :string = FullyQualifiedName.toString(propertyTypeType);
      const propertyTypeTitle :string = propertyType.get('title', '');

      let includePropertyType :boolean = true;
      if (filterQuery && filterQuery.trim()) {
        const matchesId :boolean = (propertyTypeId === filterQuery);
        const matchesFQN :boolean = propertyTypeFqn.includes(filterQuery.trim());
        const matchesTitle :boolean = propertyTypeTitle.includes(filterQuery.trim());
        if (!matchesId && !matchesFQN && !matchesTitle) {
          includePropertyType = false;
        }
      }

      return includePropertyType;
    });
  }

  constructor(props :Props) {

    super(props);

    /*
     * TODO: check values against exisitng EntityTypes to notify the user in realtime
     */

    this.state = {
      descriptionValue: '',
      filteredPrimaryKeyPropertyTypes: props.propertyTypes,
      filteredPropertyTypes: props.propertyTypes,
      namespaceValue: '',
      nameValue: '',
      isInEditModeName: true,
      isInEditModeNamespace: true,
      isInEditModeTitle: true,
      titleValue: '',
      selectedPrimaryKeyPropertyTypes: Immutable.Set(),
      selectedPropertyTypes: Immutable.Set()
    };
  }

  isReadyToSubmit = () :boolean => {

    return (!this.state.selectedPropertyTypes.isEmpty() || !this.state.selectedPrimaryKeyPropertyTypes.isEmpty())
        && !this.state.isInEditModeNamespace
        && !this.state.isInEditModeName
        && !this.state.isInEditModeTitle
        && !!this.state.nameValue
        && !!this.state.namespaceValue
        && !!this.state.titleValue;
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

  handleOnChangeTitle = (title :string) => {

    this.setState({
      titleValue: title || '',
      isInEditModeTitle: false
    });
  }

  handleOnChangePrimaryKeyPropertyTypesFilter = (filter :string) => {

    const filteredPrimaryKeyPropertyTypes :List<Map<*, *>> = CreateNewEntityTypeContainer.filterPropertyTypes(
      this.props,
      filter
    );

    this.setState({
      filteredPrimaryKeyPropertyTypes
    });
  }

  handleOnChangePropertyTypesFilter = (filter :string) => {

    const filteredPropertyTypes :List<Map<*, *>> = CreateNewEntityTypeContainer.filterPropertyTypes(
      this.props,
      filter
    );

    this.setState({
      filteredPropertyTypes
    });
  }

  handleOnAbstractTypeSelectAddPrimaryKeyPropertyType = (selectedRowIndex :number) => {

    const selectedPropertyType = this.state.filteredPrimaryKeyPropertyTypes.get(selectedRowIndex, Immutable.Map());
    const selectedPrimaryKeyPropertyTypes = this.state.selectedPrimaryKeyPropertyTypes.add(selectedPropertyType);
    const selectedPropertyTypes = this.state.selectedPropertyTypes.subtract(selectedPrimaryKeyPropertyTypes);

    this.setState({
      selectedPrimaryKeyPropertyTypes,
      selectedPropertyTypes
    });
  }

  handleOnAbstractTypeSelectAddPropertyType = (selectedRowIndex :number) => {

    const selectedPropertyType = this.state.filteredPropertyTypes.get(selectedRowIndex, Immutable.Map());
    if (this.state.selectedPrimaryKeyPropertyTypes.contains(selectedPropertyType)) {
      return;
    }

    this.setState({
      selectedPropertyTypes: this.state.selectedPropertyTypes.add(selectedPropertyType)
    });
  }

  handleOnAbstractTypeSelectRemovePrimaryKeyPropertyType = (selectedRowIndex :number) => {

    const {
      selectedPrimaryKeyPropertyTypes
    } = this.state;

    const selectedPropertyType = selectedPrimaryKeyPropertyTypes.toList().get(selectedRowIndex, Immutable.Map());

    this.setState({
      selectedPrimaryKeyPropertyTypes: selectedPrimaryKeyPropertyTypes.remove(selectedPropertyType)
    });
  }

  handleOnAbstractTypeSelectRemovePropertyType = (selectedRowIndex :number) => {

    const {
      selectedPropertyTypes
    } = this.state;

    const selectedPropertyType = selectedPropertyTypes.toList().get(selectedRowIndex, Immutable.Map());

    this.setState({
      selectedPropertyTypes: selectedPropertyTypes.remove(selectedPropertyType)
    });
  }

  renderAvailablePropertyTypesDataTable = (filteredPropertyTypes, onPropertyTypeSelect, onChangeFilter) => {

    return (
      <AvailablePropertyTypesDataTableWrapper>
        <h3>Select from available PropertyTypes</h3>
        <PropertyTypeSearch placeholder="Filter PropertyTypes..." onChange={onChangeFilter} />
        <AbstractTypeDataTable
            abstractTypes={filteredPropertyTypes}
            height={200}
            type={AbstractTypes.PropertyType}
            onAbstractTypeSelect={onPropertyTypeSelect} />
      </AvailablePropertyTypesDataTableWrapper>
    );
  }

  handleOnClickCreate = () => {

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

    this.props.actions.createEntityTypeRequest(newEntityType);
  }

  render() {

    return (
      <CreateNewEntityTypeCard>
        <h1>Create New EntityType</h1>
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
          <h2>Primary Key PropertyTypes</h2>
          {
            this.state.selectedPrimaryKeyPropertyTypes.isEmpty()
              ? (<p>No Primary Key PropertyTypes selected</p>)
              : (
                <AbstractTypeDataTable
                    abstractTypes={this.state.selectedPrimaryKeyPropertyTypes.toList()}
                    maxHeight={400}
                    type={AbstractTypes.PropertyType}
                    onAbstractTypeSelect={this.handleOnAbstractTypeSelectRemovePrimaryKeyPropertyType} />
              )
          }
          {
            this.renderAvailablePropertyTypesDataTable(
              this.state.filteredPrimaryKeyPropertyTypes,
              this.handleOnAbstractTypeSelectAddPrimaryKeyPropertyType,
              this.handleOnChangePrimaryKeyPropertyTypesFilter
            )
          }
        </section>
        <section>
          <h2>PropertyTypes</h2>
          {
            this.state.selectedPropertyTypes.isEmpty()
              ? (<p>No PropertyTypes selected</p>)
              : (
                <AbstractTypeDataTable
                    abstractTypes={this.state.selectedPropertyTypes.toList()}
                    maxHeight={400}
                    type={AbstractTypes.PropertyType}
                    onAbstractTypeSelect={this.handleOnAbstractTypeSelectRemovePropertyType} />
              )
          }
          {
            this.renderAvailablePropertyTypesDataTable(
              this.state.filteredPropertyTypes,
              this.handleOnAbstractTypeSelectAddPropertyType,
              this.handleOnChangePropertyTypesFilter
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
      </CreateNewEntityTypeCard>
    );
  }
}


function mapStateToProps(state :Map<*, *>) :Object {

  return {
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], Immutable.List()),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], Immutable.List())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    createEntityTypeRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewEntityTypeContainer);
