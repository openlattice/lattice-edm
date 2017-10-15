/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Models } from 'lattice';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../components/datatable/AbstractTypeDataTable';
import SearchInput from '../../components/controls/SearchInput';
import StyledButton from '../../components/buttons/StyledButton';
import StyledCard from '../../components/cards/StyledCard';

import AssociationTypeDetailsContainer from './associationtypes/AssociationTypeDetailsContainer';
import CreateNewEntityTypeContainer from './entitytypes/CreateNewEntityTypeContainer';
import CreateNewPropertyTypeContainer from './propertytypes/CreateNewPropertyTypeContainer';
import EntityTypeDetailsContainer from './entitytypes/EntityTypeDetailsContainer';
import PropertyTypeDetailsContainer from './propertytypes/PropertyTypeDetailsContainer';

import type { AbstractType } from '../../utils/AbstractTypes';

const { FullyQualifiedName } = Models;

/*
 * styled components
 */

const OverviewContainerOuterWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
  margin: 0;
  max-width: 2000px;
  overflow-x: scroll;
  padding: 0;
  width: 100%;
`;

const OverviewContainerInnerWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
  margin: 0;
  padding: 20px;
`;

const AbstractTypeDirectoryCard = StyledCard.extend`
  flex: 1 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

const AbstractTypeDirectoryCardTitle = styled.div`
  align-items: flex-start;
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
`;

const AbstractTypeDirectoryCardSearch = styled(SearchInput)`
  margin: 20px 0;
  width: 100%;
`;

const AbstractTypeDetailsCard = StyledCard.extend`
  flex: 1 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

/*
 * types
 */

type Props = {
  associationTypes :List<Map<*, *>>,
  entityTypes :List<Map<*, *>>,
  entityTypesById :Map<string, Map<*, *>>,
  newlyCreatedEntityTypeId :string,
  newlyCreatedPropertyTypeId :string,
  propertyTypes :List<Map<*, *>>,
  propertyTypesById :Map<string, Map<*, *>>,
  workingAbstractTypeType :AbstractType
}

type State = {
  filteredTypes :List<Map<*, *>>,
  selectedAbstractTypeId :string,
  selectedAbstractTypeIndex :number,
  showCreateNewAbstractTypeCard :boolean
}

class AbstractTypeOverviewContainer extends React.Component<Props, State> {

  static defaultProps = {
    workingAbstractTypeType: AbstractTypes.PropertyType
  }

  static getWorkingTypes(props :Props) :List<Map<*, *>> {

    switch (props.workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        return props.associationTypes;
      case AbstractTypes.EntityType:
        return props.entityTypes;
      case AbstractTypes.PropertyType:
        return props.propertyTypes;
      default:
        return Immutable.List();
    }
  }

  static filterAbstractTypes(props :Props, filterQuery :?string) :List<Map<*, *>> {

    const workingTypes :List<Map<*, *>> = AbstractTypeOverviewContainer.getWorkingTypes(props);

    return workingTypes.filter((type :Map<*, *>) => {

      const abstractType :Map<*, *> = (props.workingAbstractTypeType === AbstractTypes.AssociationType)
        ? type.get('entityType', Immutable.Map())
        : type;

      const abstractTypeId :string = abstractType.get('id', '');
      const abstractTypeType :Map<string, string> = abstractType.get('type', Immutable.Map());
      const abstractTypeFqn :string = FullyQualifiedName.toString(abstractTypeType);
      const abstractTypeTitle :string = abstractType.get('title', '');

      let includePropertyType :boolean = true;
      if (filterQuery && filterQuery.trim()) {
        const matchesId :boolean = (abstractTypeId === filterQuery);
        const matchesFQN :boolean = abstractTypeFqn.includes(filterQuery.trim());
        const matchesTitle :boolean = abstractTypeTitle.includes(filterQuery.trim());
        if (!matchesId && !matchesFQN && !matchesTitle) {
          includePropertyType = false;
        }
      }

      return includePropertyType;
    });
  }

  constructor(props :Props) {

    super(props);

    this.state = {
      filteredTypes: AbstractTypeOverviewContainer.getWorkingTypes(props),
      selectedAbstractTypeId: '',
      selectedAbstractTypeIndex: 0,
      showCreateNewAbstractTypeCard: false
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    let selectedAbstractTypeId :string = this.state.selectedAbstractTypeId;
    if (nextProps.newlyCreatedPropertyTypeId
        && nextProps.newlyCreatedPropertyTypeId !== this.props.newlyCreatedPropertyTypeId) {
      selectedAbstractTypeId = nextProps.newlyCreatedPropertyTypeId;
    }
    else if (nextProps.newlyCreatedEntityTypeId
        && nextProps.newlyCreatedEntityTypeId !== this.props.newlyCreatedEntityTypeId) {
      selectedAbstractTypeId = nextProps.newlyCreatedEntityTypeId;
    }

    this.setState({
      selectedAbstractTypeId,
      filteredTypes: AbstractTypeOverviewContainer.getWorkingTypes(nextProps),
      selectedAbstractTypeIndex: 0,
      showCreateNewAbstractTypeCard: false
    });
  }

  handleOnChangeFilter = (filter :string) => {

    const filteredTypes :List<Map<*, *>> = AbstractTypeOverviewContainer.filterAbstractTypes(
      this.props,
      filter
    );

    this.setState({
      filteredTypes,
      selectedAbstractTypeId: '',
      selectedAbstractTypeIndex: 0
    });
  }

  hideCreateNewAbstractTypeCard = () => {

    this.setState({
      showCreateNewAbstractTypeCard: false
    });
  }

  showCreateNewAbstractTypeCard = () => {

    this.setState({
      showCreateNewAbstractTypeCard: true
    });
  }

  renderAbstractTypeDirectoryCard = () => {

    let cardTitle :string = 'Entity Data Model';
    switch (this.props.workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        cardTitle = `${cardTitle} - AssociationTypes`;
        break;
      case AbstractTypes.EntityType:
        cardTitle = `${cardTitle} - EntityTypes`;
        break;
      case AbstractTypes.PropertyType:
        cardTitle = `${cardTitle} - PropertyTypes`;
        break;
      default:
        break;
    }

    const onAbstractTypeSelect :Function = (selectedRowIndex :number) => {
      this.setState({
        selectedAbstractTypeIndex: selectedRowIndex
      });
    };

    return (
      <AbstractTypeDirectoryCard>
        <AbstractTypeDirectoryCardTitle>
          <h1>{ cardTitle }</h1>
          <StyledButton onClick={this.showCreateNewAbstractTypeCard}>Create New</StyledButton>
        </AbstractTypeDirectoryCardTitle>
        <AbstractTypeDirectoryCardSearch placeholder="Filter..." onChange={this.handleOnChangeFilter} />
        {
          this.state.filteredTypes.isEmpty()
            ? (
              <div>TODO: need a better UI to display no matching results</div>
            )
            : null
        }
        <AbstractTypeDataTable
            abstractTypes={this.state.filteredTypes}
            maxHeight={600}
            type={this.props.workingAbstractTypeType}
            onAbstractTypeSelect={onAbstractTypeSelect} />
      </AbstractTypeDirectoryCard>
    );
  }

  renderAbstractTypeDetailsCard = () => {

    const {
      entityTypesById,
      propertyTypesById,
      workingAbstractTypeType
    } = this.props;

    const {
      filteredTypes,
      selectedAbstractTypeId,
      selectedAbstractTypeIndex
    } = this.state;

    let abstractTypeDetailsContainer;
    let selectedAbstractType :Map<*, *> = filteredTypes.get(selectedAbstractTypeIndex, Immutable.Map());

    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        abstractTypeDetailsContainer = (
          <AssociationTypeDetailsContainer associationType={selectedAbstractType} />
        );
        break;
      case AbstractTypes.EntityType:
        if (selectedAbstractTypeId) {
          selectedAbstractType = entityTypesById.get(selectedAbstractTypeId, Immutable.Map());
        }
        abstractTypeDetailsContainer = (
          <EntityTypeDetailsContainer entityType={selectedAbstractType} />
        );
        break;
      case AbstractTypes.PropertyType:
        if (selectedAbstractTypeId) {
          selectedAbstractType = propertyTypesById.get(selectedAbstractTypeId, Immutable.Map());
        }
        abstractTypeDetailsContainer = (
          <PropertyTypeDetailsContainer propertyType={selectedAbstractType} />
        );
        break;
      default:
        abstractTypeDetailsContainer = null;
        break;
    }

    return (
      <AbstractTypeDetailsCard>
        { abstractTypeDetailsContainer }
      </AbstractTypeDetailsCard>
    );
  }

  renderCreateNewAbstractTypeCard = () => {

    let abstractTypeDetailsContainer;
    switch (this.props.workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        abstractTypeDetailsContainer = null;
        break;
      case AbstractTypes.EntityType:
        abstractTypeDetailsContainer = (
          <CreateNewEntityTypeContainer onCancel={this.hideCreateNewAbstractTypeCard} />
        );
        break;
      case AbstractTypes.PropertyType:
        abstractTypeDetailsContainer = (
          <CreateNewPropertyTypeContainer onCancel={this.hideCreateNewAbstractTypeCard} />
        );
        break;
      default:
        abstractTypeDetailsContainer = null;
        break;
    }

    return (
      abstractTypeDetailsContainer
    );
  }

  render() {

    if (this.props.associationTypes.isEmpty()
        || this.props.entityTypes.isEmpty()
        || this.props.propertyTypes.isEmpty()) {
      return (
        <div>TODO: need a better UI to display loading or error state</div>
      );
    }

    return (
      <OverviewContainerOuterWrapper>
        <OverviewContainerInnerWrapper>
          { this.renderAbstractTypeDirectoryCard() }
          {
            this.state.showCreateNewAbstractTypeCard
              ? this.renderCreateNewAbstractTypeCard()
              : this.renderAbstractTypeDetailsCard()
          }
        </OverviewContainerInnerWrapper>
      </OverviewContainerOuterWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes']),
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById']),
    newlyCreatedEntityTypeId: state.getIn(['edm', 'entityTypes', 'newlyCreatedEntityTypeId']),
    newlyCreatedPropertyTypeId: state.getIn(['edm', 'propertyTypes', 'newlyCreatedPropertyTypeId']),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'])
  };
}

export default connect(mapStateToProps)(AbstractTypeOverviewContainer);
