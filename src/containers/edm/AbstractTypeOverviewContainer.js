/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../components/datatable/AbstractTypeDataTable';
import SearchInput from '../../components/controls/SearchInput';
import StyledButton from '../../components/buttons/StyledButton';
import StyledCard from '../../components/cards/StyledCard';

import AbstractTypeCreateContainer from './AbstractTypeCreateContainer';
import AssociationTypeDetailsContainer from './associationtypes/AssociationTypeDetailsContainer';
import EntityTypeDetailsContainer from './entitytypes/EntityTypeDetailsContainer';
import PropertyTypeDetailsContainer from './propertytypes/PropertyTypeDetailsContainer';

import { getWorkingAbstractTypes, filterAbstractTypes } from '../../utils/AbstractTypeUtils';

import type { AbstractType } from '../../utils/AbstractTypes';

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
  padding: 40px 20px 20px 20px;
`;

const AbstractTypeDirectoryCard = StyledCard.extend`
  flex: 1 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

const AbstractTypeDirectoryCardTitle = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const AbstractTypeDirectoryCardSearch = styled(SearchInput)`
  margin: 20px 0;
  width: 100%;
`;

const AbstractTypeDetailsCard = StyledCard.extend`
  flex: 3 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

/*
 * types
 */

type Props = {
  associationTypes :List<Map<*, *>>,
  associationTypesById :Map<string, Map<*, *>>,
  entityTypes :List<Map<*, *>>,
  entityTypesById :Map<string, Map<*, *>>,
  newlyCreatedAssociationTypeId :string,
  newlyCreatedEntityTypeId :string,
  newlyCreatedPropertyTypeId :string,
  propertyTypes :List<Map<*, *>>,
  propertyTypesById :Map<string, Map<*, *>>,
  workingAbstractTypeType :AbstractType
}

type State = {
  filteredTypes :List<Map<*, *>>,
  selectedAbstractTypeId :string,
  showCreateNewAbstractTypeCard :boolean
}

class AbstractTypeOverviewContainer extends React.Component<Props, State> {

  static defaultProps = {
    workingAbstractTypeType: AbstractTypes.PropertyType
  }

  constructor(props :Props) {

    super(props);

    const params :Object = {
      workingAbstractTypeType: props.workingAbstractTypeType,
      associationTypes: props.associationTypes,
      entityTypes: props.entityTypes,
      propertyTypes: props.propertyTypes
    };

    this.state = {
      filteredTypes: getWorkingAbstractTypes(params),
      selectedAbstractTypeId: '',
      showCreateNewAbstractTypeCard: false
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    let selectedAbstractTypeId :string = '';
    if (nextProps.newlyCreatedPropertyTypeId
        && nextProps.newlyCreatedPropertyTypeId !== this.props.newlyCreatedPropertyTypeId) {
      selectedAbstractTypeId = nextProps.newlyCreatedPropertyTypeId;
    }
    else if (nextProps.newlyCreatedEntityTypeId
        && nextProps.newlyCreatedEntityTypeId !== this.props.newlyCreatedEntityTypeId) {
      selectedAbstractTypeId = nextProps.newlyCreatedEntityTypeId;
    }
    else if (nextProps.newlyCreatedAssociationTypeId
        && nextProps.newlyCreatedAssociationTypeId !== this.props.newlyCreatedAssociationTypeId) {
      selectedAbstractTypeId = nextProps.newlyCreatedAssociationTypeId;
    }

    const params :Object = {
      workingAbstractTypeType: nextProps.workingAbstractTypeType,
      associationTypes: nextProps.associationTypes,
      entityTypes: nextProps.entityTypes,
      propertyTypes: nextProps.propertyTypes
    };

    this.setState({
      selectedAbstractTypeId,
      filteredTypes: getWorkingAbstractTypes(params),
      showCreateNewAbstractTypeCard: false
    });
  }

  handleOnAbstractTypeSelect = (selectedAbstractTypeId :string) => {

    this.setState({
      selectedAbstractTypeId
    });
  }

  handleOnChangeFilter = (filter :string) => {

    const params :Object = {
      workingAbstractTypeType: this.props.workingAbstractTypeType,
      associationTypes: this.props.associationTypes,
      entityTypes: this.props.entityTypes,
      propertyTypes: this.props.propertyTypes
    };

    const filterParams :Object = {
      abstractTypes: getWorkingAbstractTypes(params),
      filterQuery: filter,
      workingAbstractTypeType: this.props.workingAbstractTypeType
    };

    this.setState({
      filteredTypes: filterAbstractTypes(filterParams),
      selectedAbstractTypeId: ''
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
            workingAbstractTypeType={this.props.workingAbstractTypeType}
            onAbstractTypeSelect={this.handleOnAbstractTypeSelect} />
      </AbstractTypeDirectoryCard>
    );
  }

  renderAbstractTypeDetailsCard = () => {

    const {
      associationTypesById,
      entityTypesById,
      propertyTypesById,
      workingAbstractTypeType
    } = this.props;

    const {
      filteredTypes,
      selectedAbstractTypeId
    } = this.state;

    let abstractTypeDetailsContainer;
    // by default, grab the first element
    let selectedAbstractType :Map<*, *> = filteredTypes.get(0, Immutable.Map());

    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        if (selectedAbstractTypeId) {
          selectedAbstractType = associationTypesById.get(selectedAbstractTypeId, Immutable.Map());
        }
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

  renderAbstractTypeCreateCard = () => {

    return (
      <AbstractTypeCreateContainer
          workingAbstractTypeType={this.props.workingAbstractTypeType}
          onCancel={this.hideCreateNewAbstractTypeCard} />
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
              ? this.renderAbstractTypeCreateCard()
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
    associationTypesById: state.getIn(['edm', 'associationTypes', 'associationTypesById']),
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById']),
    newlyCreatedAssociationTypeId: state.getIn(['edm', 'associationTypes', 'newlyCreatedAssociationTypeId']),
    newlyCreatedEntityTypeId: state.getIn(['edm', 'entityTypes', 'newlyCreatedEntityTypeId']),
    newlyCreatedPropertyTypeId: state.getIn(['edm', 'propertyTypes', 'newlyCreatedPropertyTypeId']),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'])
  };
}

export default connect(mapStateToProps)(AbstractTypeOverviewContainer);
