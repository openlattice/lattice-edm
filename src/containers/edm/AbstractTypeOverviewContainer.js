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
  overflow-x: scroll;
  padding: 0;
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
  flex: 3 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

/*
 * types
 */

type Props = {
  associationTypes :List<Map<*, *>>,
  entityTypes :List<Map<*, *>>,
  propertyTypes :List<Map<*, *>>,
  type :AbstractType
}

type State = {
  filteredTypes :List<Map<*, *>>,
  selectedIndex :number
}

class AbstractTypeOverviewContainer extends React.Component<Props, State> {

  static defaultProps = {
    type: AbstractTypes.PropertyType
  }

  static getWorkingTypes(props :Props) :List<Map<*, *>> {

    switch (props.type) {
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

      const abstractType :Map<*, *> = (props.type === AbstractTypes.AssociationType)
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
      selectedIndex: 0
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    this.setState({
      filteredTypes: AbstractTypeOverviewContainer.getWorkingTypes(nextProps),
      selectedIndex: 0
    });
  }

  handleOnChangeFilter = (filter :string) => {

    const filteredTypes :List<Map<*, *>> = AbstractTypeOverviewContainer.filterAbstractTypes(
      this.props,
      filter
    );

    this.setState({
      filteredTypes,
      selectedIndex: 0
    });
  }

  handleOnClickCreateNewAbstractType = () => {

  }

  renderAbstractTypeDirectoryCard = () => {

    let cardTitle :string = 'Entity Data Model';
    switch (this.props.type) {
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
        selectedIndex: selectedRowIndex
      });
    };

    return (
      <AbstractTypeDirectoryCard>
        <AbstractTypeDirectoryCardTitle>
          <h1>{ cardTitle }</h1>
          <StyledButton onClick={this.handleOnClickCreateNewAbstractType}>Create New</StyledButton>
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
            type={this.props.type}
            onAbstractTypeSelect={onAbstractTypeSelect} />
      </AbstractTypeDirectoryCard>
    );
  }

  renderAbstractTypeDetailsCard = () => {

    let abstractTypeDetailsContainer;
    const selectedAbstractType :Map<*, *> = this.state.filteredTypes.get(this.state.selectedIndex, Immutable.Map());

    switch (this.props.type) {
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
          { this.renderAbstractTypeDetailsCard() }
        </OverviewContainerInnerWrapper>
      </OverviewContainerOuterWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes'], Immutable.List()),
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], Immutable.List()),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], Immutable.List())
  };
}

export default connect(mapStateToProps)(AbstractTypeOverviewContainer);
