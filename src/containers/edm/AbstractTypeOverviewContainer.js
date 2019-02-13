/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';
import type { FQN } from 'lattice';

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
import SchemaDetailsContainer from './schemas/SchemaDetailsContainer';
import {
  getWorkingAbstractTypes,
  filterAbstractTypes,
  maybeGetAbstractTypeMatchingFQN,
  maybeGetNewlyCreatedAbstractTypeFQN,
} from '../../utils/AbstractTypeUtils';

import type {
  AbstractTypeOverviewContainerProps as Props,
  AbstractTypeOverviewContainerState as State,
} from './Types';

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
  padding: 40px 20px 20px 20px;
`;

const AbstractTypeDirectoryCard = styled(StyledCard)`
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

const AbstractTypeDetailsCard = styled(StyledCard)`
  flex: 50%;
  max-width: 1000px;
  min-width: 500px;
`;

const Empty = styled.div`
  display: flex;
  padding-top: 40px;
  text-align:center;
`;

class AbstractTypeOverviewContainer extends React.Component<Props, State> {

  static defaultProps = {
    workingAbstractTypeType: AbstractTypes.PropertyType
  }

  constructor(props :Props) {

    super(props);

    this.state = {
      filterQuery: '',
      selectedAbstractTypeFQN: undefined,
      showCreateNewAbstractTypeCard: false
    };
  }

  componentDidUpdate(prevProps :Props) {

    const { workingAbstractTypeType } = this.props;

    // switching between abstract types basically trumps everything, so the selected abstract type needs to be cleared
    if (workingAbstractTypeType !== prevProps.workingAbstractTypeType) {
      this.setState({
        selectedAbstractTypeFQN: undefined,
      });
    }
    else {
      // if a new abstract type was created, use its fqn for selection
      const fqn :?FQN = maybeGetNewlyCreatedAbstractTypeFQN(prevProps, this.props);
      if (FullyQualifiedName.isValid(fqn)) {
        this.setState({
          selectedAbstractTypeFQN: fqn,
        });
      }
    }
  }

  getFilteredAbstractTypes = () :List<Map<*, *>> => {

    const { workingAbstractTypeType } = this.props;
    const { filterQuery } = this.state;

    return filterAbstractTypes({
      filterQuery,
      workingAbstractTypeType,
      abstractTypes: getWorkingAbstractTypes(this.props),
    });
  }

  getSelectedAbstractType = () :Map<*, *> => {

    const { selectedAbstractTypeFQN } = this.state;

    let selectedAbstractType :?Map<*, *> = maybeGetAbstractTypeMatchingFQN(selectedAbstractTypeFQN, this.props);
    if (!selectedAbstractType || selectedAbstractType.isEmpty()) {
      const filteredAbstractTypes :List<Map<*, *>> = this.getFilteredAbstractTypes();
      selectedAbstractType = filteredAbstractTypes.get(0, Map());
    }

    return selectedAbstractType;
  }

  handleOnAbstractTypeSelect = (selectedFQN :?FQN) => {

    this.setState({
      selectedAbstractTypeFQN: selectedFQN,
    });
  }

  handleOnChangeFilter = (filterQuery :string) => {

    this.setState({
      filterQuery,
      selectedAbstractTypeFQN: undefined,
    });
  }

  hideCreateNewAbstractTypeCard = () => {

    this.setState({
      showCreateNewAbstractTypeCard: false,
    });
  }

  showCreateNewAbstractTypeCard = () => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      this.setState({
        showCreateNewAbstractTypeCard: true,
      });
    }
  }

  renderAbstractTypeDirectoryCard = () => {

    const { workingAbstractTypeType } = this.props;
    const filteredAbstractTypes :List<Map<*, *>> = this.getFilteredAbstractTypes();

    let cardTitle :string = 'Entity Data Model';
    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        cardTitle = `${cardTitle} - AssociationTypes`;
        break;
      case AbstractTypes.EntityType:
        cardTitle = `${cardTitle} - EntityTypes`;
        break;
      case AbstractTypes.PropertyType:
        cardTitle = `${cardTitle} - PropertyTypes`;
        break;
      case AbstractTypes.Schema:
        cardTitle = `${cardTitle} - Schemas`;
        break;
      default:
        break;
    }

    return (
      <AbstractTypeDirectoryCard>
        <AbstractTypeDirectoryCardTitle>
          <h1>
            { cardTitle }
          </h1>
          {
            AuthUtils.isAuthenticated() && AuthUtils.isAdmin()
              ? (
                <StyledButton onClick={this.showCreateNewAbstractTypeCard}>
                  Create New
                </StyledButton>
              )
              : null
          }
        </AbstractTypeDirectoryCardTitle>
        <AbstractTypeDirectoryCardSearch placeholder="Filter..." onChange={this.handleOnChangeFilter} />
        {
          filteredAbstractTypes.isEmpty()
            ? (
              <div>
                No matching results.
              </div>
            )
            : null
        }
        <AbstractTypeDataTable
            abstractTypes={filteredAbstractTypes}
            highlightOnHover
            highlightOnSelect
            maxHeight={600}
            onAbstractTypeSelect={this.handleOnAbstractTypeSelect}
            workingAbstractTypeType={workingAbstractTypeType} />
      </AbstractTypeDirectoryCard>
    );
  }

  renderAbstractTypeDetailsCard = () => {

    const { workingAbstractTypeType } = this.props;
    const selectedAbstractType :Map<*, *> = this.getSelectedAbstractType();

    let abstractTypeDetailsContainer;

    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        abstractTypeDetailsContainer = (
          <AssociationTypeDetailsContainer associationType={selectedAbstractType} />
        );
        break;
      case AbstractTypes.EntityType:
        abstractTypeDetailsContainer = (
          <EntityTypeDetailsContainer entityType={selectedAbstractType} />
        );
        break;
      case AbstractTypes.PropertyType:
        abstractTypeDetailsContainer = (
          <PropertyTypeDetailsContainer propertyType={selectedAbstractType} />
        );
        break;
      case AbstractTypes.Schema:
        abstractTypeDetailsContainer = (
          <SchemaDetailsContainer schema={selectedAbstractType} />
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

    const { workingAbstractTypeType } = this.props;

    return (
      <AbstractTypeCreateContainer
          onCancel={this.hideCreateNewAbstractTypeCard}
          onSubmit={this.hideCreateNewAbstractTypeCard}
          workingAbstractTypeType={workingAbstractTypeType} />
    );
  }

  render() {

    const {
      associationTypes,
      entityTypes,
      isFetchingEntityDataModel,
      propertyTypes,
      schemas,
      workingAbstractTypeType
    } = this.props;
    const { showCreateNewAbstractTypeCard } = this.state;

    if (isFetchingEntityDataModel) {
      return (
        <Spinner />
      );
    }

    if (
      (workingAbstractTypeType === AbstractTypes.AssociationType && associationTypes.isEmpty())
      || (workingAbstractTypeType === AbstractTypes.EntityType && entityTypes.isEmpty())
      || (workingAbstractTypeType === AbstractTypes.PropertyType && propertyTypes.isEmpty())
      || (workingAbstractTypeType === AbstractTypes.Schema && schemas.isEmpty())
    ) {
      return (
        <Empty>
          Sorry, something went wrong. Please try refreshing the page, or contact support.
        </Empty>
      );
    }

    return (
      <OverviewContainerOuterWrapper>
        <OverviewContainerInnerWrapper>
          { this.renderAbstractTypeDirectoryCard() }
          {
            showCreateNewAbstractTypeCard
              ? this.renderAbstractTypeCreateCard()
              : this.renderAbstractTypeDetailsCard()
          }
        </OverviewContainerInnerWrapper>
      </OverviewContainerOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) :{} => ({
  associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes']),
  associationTypesIndexMap: state.getIn(['edm', 'associationTypes', 'associationTypesIndexMap']),
  entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
  entityTypesIndexMap: state.getIn(['edm', 'entityTypes', 'entityTypesIndexMap']),
  isFetchingEntityDataModel: state.getIn(['edm', 'isFetchingEntityDataModel']),
  newlyCreatedAssociationTypeFQN: state.getIn(['edm', 'associationTypes', 'newlyCreatedAssociationTypeFQN']),
  newlyCreatedEntityTypeFQN: state.getIn(['edm', 'entityTypes', 'newlyCreatedEntityTypeFQN']),
  newlyCreatedPropertyTypeFQN: state.getIn(['edm', 'propertyTypes', 'newlyCreatedPropertyTypeFQN']),
  newlyCreatedSchemaFQN: state.getIn(['edm', 'schemas', 'newlyCreatedSchemaFQN']),
  propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
  propertyTypesIndexMap: state.getIn(['edm', 'propertyTypes', 'propertyTypesIndexMap']),
  schemas: state.getIn(['edm', 'schemas', 'schemas']),
  schemasIndexMap: state.getIn(['edm', 'schemas', 'schemasIndexMap']),
});

export default connect(mapStateToProps)(AbstractTypeOverviewContainer);
