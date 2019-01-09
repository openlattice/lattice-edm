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
import SchemaDetailsContainer from './schemas/SchemaDetailsContainer';
import { getWorkingAbstractTypes, filterAbstractTypes } from '../../utils/AbstractTypeUtils';

import {
  maybeGetAbstractTypeFQNForNewlyCreatedAbstractType,
  maybeGetAbstractTypeMatchingSelectedAbstractTypeFQN,
} from './Helpers';

import type {
  AbstractTypeOverviewContainerProps as Props,
  AbstractTypeOverviewContainerState as State,
} from './Types';

import type { GetWorkingAbstractTypesParams } from '../../utils/AbstractTypeUtils';

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

    const params :GetWorkingAbstractTypesParams = {
      associationTypes: props.associationTypes,
      entityTypes: props.entityTypes,
      propertyTypes: props.propertyTypes,
      schemas: props.schemas,
      workingAbstractTypeType: props.workingAbstractTypeType
    };

    const filteredTypes :List<Map<*, *>> = getWorkingAbstractTypes(params);
    const selectedAbstractType :Map<*, *> = filteredTypes.get(0, Map());
    const selectedAbstractTypeFQN :FQN = selectedAbstractType.get('type');

    this.state = {
      filteredTypes,
      selectedAbstractType,
      selectedAbstractTypeFQN,
      filterQuery: '',
      showCreateNewAbstractTypeCard: false
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    const { filterQuery } = this.state;
    let { selectedAbstractTypeFQN } = this.state;

    const {
      associationTypes,
      entityTypes,
      propertyTypes,
      schemas,
      workingAbstractTypeType,
    } = nextProps;

    const params :GetWorkingAbstractTypesParams = {
      associationTypes,
      entityTypes,
      propertyTypes,
      schemas,
      workingAbstractTypeType,
    };

    const workingAbstractTypes :List<Map<*, *>> = getWorkingAbstractTypes(params);
    const filteredTypes :List<Map<*, *>> = filterAbstractTypes({
      filterQuery,
      workingAbstractTypeType,
      abstractTypes: workingAbstractTypes
    });

    // 0. by default, use first element of all possible options as the selected abstract type
    let selectedAbstractType :Map<*, *> = workingAbstractTypes.get(0, Map());
    if (!selectedAbstractTypeFQN) {
      selectedAbstractTypeFQN = selectedAbstractType.get('type');
    }

    // 1. try to match an abstract type if there's a filter query
    if (!selectedAbstractTypeFQN && !isEmpty(filterQuery)) {
      selectedAbstractType = filteredTypes.get(0, Map());
      selectedAbstractTypeFQN = selectedAbstractType.get('type');
    }

    // 2. check if a new abstract type was created, and if so, use its id for selection. newly created trumps all.
    selectedAbstractTypeFQN = maybeGetAbstractTypeFQNForNewlyCreatedAbstractType(
      selectedAbstractTypeFQN,
      this.props,
      nextProps,
    );

    // 3. try to select the abstract type corresponding to selectedAbstractTypeFQN
    selectedAbstractType = maybeGetAbstractTypeMatchingSelectedAbstractTypeFQN(
      selectedAbstractType,
      selectedAbstractTypeFQN,
      nextProps
    );

    this.setState({
      filteredTypes,
      selectedAbstractType,
      selectedAbstractTypeFQN,
      showCreateNewAbstractTypeCard: false
    });
  }

  handleOnAbstractTypeSelect = (selectedAbstractTypeFQN :FQN) => {

    const {
      associationTypes,
      associationTypesById,
      entityTypes,
      entityTypesById,
      propertyTypes,
      propertyTypesIndexMap,
      schemas,
      schemasByFqn,
      workingAbstractTypeType
    } = this.props;
    const { filteredTypes } = this.state;

    // by default, use first element as the selected abstract type
    let selectedAbstractType :Map<*, *> = filteredTypes.get(0, Map());

    let selectedAbstractTypeIndex :number;
    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType: {
        if (selectedAbstractTypeFQN) {
          selectedAbstractTypeIndex = associationTypesById.get(selectedAbstractTypeFQN, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = associationTypes.get(selectedAbstractTypeIndex, Map());
          }
        }
        break;
      }
      case AbstractTypes.EntityType: {
        if (selectedAbstractTypeFQN) {
          selectedAbstractTypeIndex = entityTypesById.get(selectedAbstractTypeFQN, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = entityTypes.get(selectedAbstractTypeIndex, Map());
          }
        }
        break;
      }
      case AbstractTypes.PropertyType: {
        if (selectedAbstractTypeFQN) {
          selectedAbstractTypeIndex = propertyTypesIndexMap.get(selectedAbstractTypeFQN, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = propertyTypes.get(selectedAbstractTypeIndex, Map());
          }
        }
        break;
      }
      case AbstractTypes.Schema: {
        if (selectedAbstractTypeFQN) {
          selectedAbstractTypeIndex = schemasByFqn.get(selectedAbstractTypeFQN, -1);
          if (selectedAbstractTypeIndex !== -1) {
            selectedAbstractType = schemas.get(selectedAbstractTypeIndex, Map());
          }
        }
        break;
      }
      default:
        break;
    }

    this.setState({
      selectedAbstractType,
      selectedAbstractTypeFQN,
    });
  }

  handleOnChangeFilter = (filterQuery :string) => {

    const {
      associationTypes,
      entityTypes,
      propertyTypes,
      schemas,
      workingAbstractTypeType
    } = this.props;

    const params :Object = {
      associationTypes,
      entityTypes,
      propertyTypes,
      schemas,
      workingAbstractTypeType
    };

    const filterParams :Object = {
      filterQuery,
      workingAbstractTypeType,
      abstractTypes: getWorkingAbstractTypes(params)
    };

    const filteredTypes :List<Map<*, *>> = filterAbstractTypes(filterParams);
    const selectedAbstractType :Map<*, *> = filteredTypes.get(0, Map());
    const selectedAbstractTypeFQN :FQN = selectedAbstractType.get('type');

    this.setState({
      filterQuery,
      filteredTypes,
      selectedAbstractType,
      selectedAbstractTypeFQN,
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

    const { workingAbstractTypeType } = this.props;
    const { filteredTypes } = this.state;

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
          filteredTypes.isEmpty()
            ? (
              <div>
                No matching results.
              </div>
            )
            : null
        }
        <AbstractTypeDataTable
            abstractTypes={filteredTypes}
            highlightOnHover
            highlightOnSelect
            maxHeight={600}
            workingAbstractTypeType={workingAbstractTypeType}
            onAbstractTypeSelect={this.handleOnAbstractTypeSelect} />
      </AbstractTypeDirectoryCard>
    );
  }

  renderAbstractTypeDetailsCard = () => {

    const { workingAbstractTypeType } = this.props;
    const { selectedAbstractType } = this.state;

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
          workingAbstractTypeType={workingAbstractTypeType}
          onCancel={this.hideCreateNewAbstractTypeCard} />
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
  associationTypesById: state.getIn(['edm', 'associationTypes', 'associationTypesById']),
  entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
  entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById']),
  isFetchingEntityDataModel: state.getIn(['edm', 'isFetchingEntityDataModel']),
  newlyCreatedAssociationTypeId: state.getIn(['edm', 'associationTypes', 'newlyCreatedAssociationTypeId']),
  newlyCreatedEntityTypeId: state.getIn(['edm', 'entityTypes', 'newlyCreatedEntityTypeId']),
  newlyCreatedPropertyTypeFQN: state.getIn(['edm', 'propertyTypes', 'newlyCreatedPropertyTypeFQN']),
  propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
  propertyTypesIndexMap: state.getIn(['edm', 'propertyTypes', 'propertyTypesIndexMap']),
  schemas: state.getIn(['edm', 'schemas', 'schemas']),
  schemasByFqn: state.getIn(['edm', 'schemas', 'schemasByFqn']),
});

// $FlowFixMe
export default connect(mapStateToProps)(AbstractTypeOverviewContainer);

export type { Props };
