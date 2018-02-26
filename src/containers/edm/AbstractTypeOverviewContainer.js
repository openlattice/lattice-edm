/*
 * @flow
 */

import React from 'react';

import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../components/datatable/AbstractTypeDataTable';
import SearchInput from '../../components/controls/SearchInput';
import StyledButton from '../../components/buttons/StyledButton';
import StyledCard from '../../components/cards/StyledCard';
import Spinner from '../../components/spinner/Spinner';

import AbstractTypeCreateContainer from './AbstractTypeCreateContainer';
import AssociationTypeDetailsContainer from './associationtypes/AssociationTypeDetailsContainer';
import EntityTypeDetailsContainer from './entitytypes/EntityTypeDetailsContainer';
import PropertyTypeDetailsContainer from './propertytypes/PropertyTypeDetailsContainer';
import { getWorkingAbstractTypes, filterAbstractTypes } from '../../utils/AbstractTypeUtils';

import {
  maybeGetAbstractTypeIdForNewlyCreatedAbstractType,
  maybeGetAbstractTypeMatchingSelectedAbstractTypeId
} from './Helpers';

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

const Empty = styled.div`
  display: flex;
  padding-top: 40px;
  text-align:center;
`;

/*
 * types
 */

type Props = {
  associationTypes :List<Map<*, *>>;
  associationTypesById :Map<string, number>;
  entityTypes :List<Map<*, *>>;
  entityTypesById :Map<string, number>;
  isFetchingAllAssociationTypes :boolean;
  isFetchingAllEntityTypes :boolean;
  isFetchingAllPropertyTypes :boolean;
  newlyCreatedAssociationTypeId :string;
  newlyCreatedEntityTypeId :string;
  newlyCreatedPropertyTypeId :string;
  propertyTypes :List<Map<*, *>>;
  propertyTypesById :Map<string, number>;
  workingAbstractTypeType :AbstractType;
};

type State = {
  filterQuery :string;
  filteredTypes :List<Map<*, *>>;
  selectedAbstractType :Map<*, *>;
  selectedAbstractTypeId :string;
  showCreateNewAbstractTypeCard :boolean;
};

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

    const filteredTypes :List<Map<*, *>> = getWorkingAbstractTypes(params);
    const selectedAbstractType :Map<*, *> = filteredTypes.get(0, Map());
    const selectedAbstractTypeId :string = selectedAbstractType.get('id', '');

    this.state = {
      filteredTypes,
      selectedAbstractType,
      selectedAbstractTypeId,
      filterQuery: '',
      showCreateNewAbstractTypeCard: false
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    const {
      associationTypes,
      entityTypes,
      propertyTypes,
      workingAbstractTypeType
    } = nextProps;

    const params :Object = {
      associationTypes,
      entityTypes,
      propertyTypes,
      workingAbstractTypeType
    };

    const workingAbstractTypes :List<Map<*, *>> = getWorkingAbstractTypes(params);
    const filteredTypes :List<Map<*, *>> = filterAbstractTypes({
      workingAbstractTypeType,
      abstractTypes: workingAbstractTypes,
      filterQuery: this.state.filterQuery
    });

    // 0. by default, use first element of all possible options as the selected abstract type
    let selectedAbstractType :Map<*, *> = workingAbstractTypes.get(0, Map());
    let selectedAbstractTypeId :string = this.state.selectedAbstractTypeId;
    if (!selectedAbstractTypeId) {
      selectedAbstractTypeId = selectedAbstractType.get('id', '');
    }

    // 1. try to match an abstract type if there's a filter query
    if (!isEmpty(this.state.filterQuery)) {
      selectedAbstractType = filteredTypes.get(0, Map());
      selectedAbstractTypeId = selectedAbstractType.get('id', '');
    }

    // 2. check if a new abstract type was created, and if so, use its id for selection. newly created trumps all.
    selectedAbstractTypeId = maybeGetAbstractTypeIdForNewlyCreatedAbstractType(
      selectedAbstractTypeId,
      this.props,
      nextProps
    );

    // 3. try to select the abstract type corresponding to selectedAbstractTypeId
    selectedAbstractType = maybeGetAbstractTypeMatchingSelectedAbstractTypeId(
      selectedAbstractType,
      selectedAbstractTypeId,
      nextProps
    );

    this.setState({
      filteredTypes,
      selectedAbstractType,
      selectedAbstractTypeId,
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
    let selectedAbstractType :Map<*, *> = this.state.filteredTypes.get(0, Map());

    let selectedAbstractTypeIndex :number;
    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = associationTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = associationTypes.get(selectedAbstractTypeIndex, Map());
          }
        }
        break;
      case AbstractTypes.EntityType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = entityTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = entityTypes.get(selectedAbstractTypeIndex, Map());
          }
        }
        break;
      case AbstractTypes.PropertyType:
        if (selectedAbstractTypeId) {
          selectedAbstractTypeIndex = propertyTypesById.get(selectedAbstractTypeId, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = propertyTypes.get(selectedAbstractTypeIndex, Map());
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

  handleOnChangeFilter = (filterQuery :string) => {

    const params :Object = {
      associationTypes: this.props.associationTypes,
      entityTypes: this.props.entityTypes,
      propertyTypes: this.props.propertyTypes,
      workingAbstractTypeType: this.props.workingAbstractTypeType
    };

    const filterParams :Object = {
      filterQuery,
      abstractTypes: getWorkingAbstractTypes(params),
      workingAbstractTypeType: this.props.workingAbstractTypeType
    };

    const filteredTypes :List<Map<*, *>> = filterAbstractTypes(filterParams);
    const selectedAbstractType :Map<*, *> = filteredTypes.get(0, Map());
    const selectedAbstractTypeId :string = selectedAbstractType.get('id', '');

    this.setState({
      filterQuery,
      filteredTypes,
      selectedAbstractType,
      selectedAbstractTypeId
    });
  }

  hideCreateNewAbstractTypeCard = () => {

    this.setState({
      showCreateNewAbstractTypeCard: false
    });
  }

  showCreateNewAbstractTypeCard = () => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
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
            AuthUtils.isAuthenticated() && AuthUtils.isAdmin()
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
              <div>No matching results.</div>
            )
            : null
        }
        <AbstractTypeDataTable
            abstractTypes={this.state.filteredTypes}
            highlightOnHover
            highlightOnSelect
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

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    return (
      <AbstractTypeCreateContainer
          workingAbstractTypeType={this.props.workingAbstractTypeType}
          onCancel={this.hideCreateNewAbstractTypeCard} />
    );
  }

  render() {

    const {
      associationTypes,
      entityTypes,
      propertyTypes,
      workingAbstractTypeType
    } = this.props;

    if (
      (workingAbstractTypeType === AbstractTypes.AssociationType && this.props.isFetchingAllAssociationTypes)
      || (workingAbstractTypeType === AbstractTypes.EntityType && this.props.isFetchingAllEntityTypes)
      || (workingAbstractTypeType === AbstractTypes.PropertyType && this.props.isFetchingAllPropertyTypes)
    ) {
      return (
        <Spinner />
      );
    }

    if (
      (workingAbstractTypeType === AbstractTypes.AssociationType && associationTypes.isEmpty())
      || (workingAbstractTypeType === AbstractTypes.EntityType && entityTypes.isEmpty())
      || (workingAbstractTypeType === AbstractTypes.PropertyType && propertyTypes.isEmpty())
    ) {
      return (
        <Empty>Sorry, something went wrong. Please try refreshing the page, or contact support.</Empty>
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
    isFetchingAllAssociationTypes: state.getIn(['edm', 'associationTypes', 'isFetchingAllAssociationTypes']),
    isFetchingAllEntityTypes: state.getIn(['edm', 'entityTypes', 'isFetchingAllEntityTypes']),
    isFetchingAllPropertyTypes: state.getIn(['edm', 'propertyTypes', 'isFetchingAllPropertyTypes']),
    newlyCreatedAssociationTypeId: state.getIn(['edm', 'associationTypes', 'newlyCreatedAssociationTypeId']),
    newlyCreatedEntityTypeId: state.getIn(['edm', 'entityTypes', 'newlyCreatedEntityTypeId']),
    newlyCreatedPropertyTypeId: state.getIn(['edm', 'propertyTypes', 'newlyCreatedPropertyTypeId']),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'])
  };
}

export default connect(mapStateToProps)(AbstractTypeOverviewContainer);

export type { Props };
