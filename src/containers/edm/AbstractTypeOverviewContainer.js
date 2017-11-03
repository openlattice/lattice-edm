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

import * as AuthUtils from '../../core/auth/AuthUtils';
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
  flex: 50%;
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
  flex: 50%;
  max-width: 1000px;
  min-width: 500px;
`;

/*
 * types
 */

type Props = {
  associationTypes :List<Map<*, *>>,
  associationTypesById :Map<string, number>,
  entityTypes :List<Map<*, *>>,
  entityTypesById :Map<string, number>,
  newlyCreatedAssociationTypeId :string,
  newlyCreatedEntityTypeId :string,
  newlyCreatedPropertyTypeId :string,
  propertyTypes :List<Map<*, *>>,
  propertyTypesById :Map<string, number>,
  workingAbstractTypeType :AbstractType
}

type State = {
  filterQuery :string,
  filteredTypes :List<Map<*, *>>,
  selectedAbstractType :Map<*, *>,
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
      associationTypes: props.associationTypes,
      entityTypes: props.entityTypes,
      propertyTypes: props.propertyTypes,
      workingAbstractTypeType: props.workingAbstractTypeType
    };

    const workingAbstractTypes :List<Map<*, *>> = getWorkingAbstractTypes(params);

    this.state = {
      filterQuery: '',
      filteredTypes: workingAbstractTypes,
      selectedAbstractType: workingAbstractTypes.get(0, Immutable.Map()),
      selectedAbstractTypeId: '',
      showCreateNewAbstractTypeCard: false
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    const {
      associationTypes,
      associationTypesById,
      entityTypes,
      entityTypesById,
      newlyCreatedAssociationTypeId,
      newlyCreatedEntityTypeId,
      newlyCreatedPropertyTypeId,
      propertyTypes,
      propertyTypesById,
      workingAbstractTypeType
    } = nextProps;

    const params :Object = {
      associationTypes,
      entityTypes,
      propertyTypes,
      workingAbstractTypeType
    };

    const workingAbstractTypes :List<Map<*, *>> = getWorkingAbstractTypes(params);

    // by default, use first element as the selected abstract type
    let selectedAbstractType :Map<*, *> = workingAbstractTypes.get(0, Immutable.Map());

    // check if a new abstract type was created, and if so, use its id for selection
    let selectedAbstractTypeId :string = this.state.selectedAbstractTypeId;
    if (newlyCreatedPropertyTypeId
        && newlyCreatedPropertyTypeId !== this.props.newlyCreatedPropertyTypeId) {
      selectedAbstractTypeId = newlyCreatedPropertyTypeId;
    }
    else if (newlyCreatedEntityTypeId
        && newlyCreatedEntityTypeId !== this.props.newlyCreatedEntityTypeId) {
      selectedAbstractTypeId = newlyCreatedEntityTypeId;
    }
    else if (newlyCreatedAssociationTypeId
        && newlyCreatedAssociationTypeId !== this.props.newlyCreatedAssociationTypeId) {
      selectedAbstractTypeId = newlyCreatedAssociationTypeId;
    }

    // try to select the abstract type corresponding to selectedAbstractTypeId
    let selectedAbstractTypeIndex :number;
    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = associationTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = associationTypes.get(selectedAbstractTypeIndex, Immutable.Map());
          }
        }
        break;
      case AbstractTypes.EntityType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = entityTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = entityTypes.get(selectedAbstractTypeIndex, Immutable.Map());
          }
        }
        break;
      case AbstractTypes.PropertyType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = propertyTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = propertyTypes.get(selectedAbstractTypeIndex, Immutable.Map());
          }
        }
        break;
      default:
        break;
    }

    const filterParams :Object = {
      workingAbstractTypeType,
      abstractTypes: workingAbstractTypes,
      filterQuery: this.state.filterQuery
    };

    this.setState({
      selectedAbstractType,
      selectedAbstractTypeId,
      filteredTypes: filterAbstractTypes(filterParams),
      showCreateNewAbstractTypeCard: false
    });
  }

  handleOnAbstractTypeSelect = (selectedAbstractTypeId :string) => {

    const {
      associationTypes,
      associationTypesById,
      entityTypes,
      entityTypesById,
      propertyTypes,
      propertyTypesById,
      workingAbstractTypeType
    } = this.props;

    // by default, use first element as the selected abstract type
    let selectedAbstractType :Map<*, *> = this.state.filteredTypes.get(0, Immutable.Map());

    let selectedAbstractTypeIndex :number;
    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = associationTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = associationTypes.get(selectedAbstractTypeIndex, Immutable.Map());
          }
        }
        break;
      case AbstractTypes.EntityType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = entityTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = entityTypes.get(selectedAbstractTypeIndex, Immutable.Map());
          }
        }
        break;
      case AbstractTypes.PropertyType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = propertyTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = propertyTypes.get(selectedAbstractTypeIndex, Immutable.Map());
          }
        }
        break;
      default:
        break;
    }

    this.setState({
      selectedAbstractType,
      selectedAbstractTypeId
    });
  }

  handleOnChangeFilter = (filter :string) => {

    const params :Object = {
      associationTypes: this.props.associationTypes,
      entityTypes: this.props.entityTypes,
      propertyTypes: this.props.propertyTypes,
      workingAbstractTypeType: this.props.workingAbstractTypeType
    };

    const filterParams :Object = {
      abstractTypes: getWorkingAbstractTypes(params),
      filterQuery: filter,
      workingAbstractTypeType: this.props.workingAbstractTypeType
    };

    this.setState({
      filterQuery: filter,
      filteredTypes: filterAbstractTypes(filterParams)
    });
  }

  hideCreateNewAbstractTypeCard = () => {

    this.setState({
      showCreateNewAbstractTypeCard: false
    });
  }

  showCreateNewAbstractTypeCard = () => {

    if (AuthUtils.isAuthenticated()) {
      this.setState({
        showCreateNewAbstractTypeCard: true
      });
    }
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
          {
            AuthUtils.isAuthenticated()
              ? (
                <StyledButton onClick={this.showCreateNewAbstractTypeCard}>Create New</StyledButton>
              )
              : null
          }
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

    let abstractTypeDetailsContainer;

    switch (this.props.workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        abstractTypeDetailsContainer = (
          <AssociationTypeDetailsContainer associationType={this.state.selectedAbstractType} />
        );
        break;
      case AbstractTypes.EntityType:
        abstractTypeDetailsContainer = (
          <EntityTypeDetailsContainer entityType={this.state.selectedAbstractType} />
        );
        break;
      case AbstractTypes.PropertyType:
        abstractTypeDetailsContainer = (
          <PropertyTypeDetailsContainer propertyType={this.state.selectedAbstractType} />
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

    if (!AuthUtils.isAuthenticated()) {
      return null;
    }

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
