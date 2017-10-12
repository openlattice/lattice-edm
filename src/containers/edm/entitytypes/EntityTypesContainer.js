/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Models } from 'lattice';
import { connect } from 'react-redux';

import AbstractDataTable from '../../../components/datatable/AbstractDataTable';

import { StyledCard } from '../../../components/cards/StyledCard';

const { FullyQualifiedName } = Models;

const ETContainerWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
`;

const EntityTypesCard = StyledCard.extend`
  flex: 1 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

const EntityTypeDetailsCard = StyledCard.extend`
  flex: 3 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

type Props = {
  entityTypes :List<Map<*, *>>,
  propertyTypesById :Map<string, Map<*, *>>,
  filterQuery :string
};

type State = {
  filteredEntityTypes :List<Map<*, *>>,
  selectedIndex :number
};

class EntityTypesContainer extends React.Component<Props, State> {

  static defaultProps = {
    actions: {},
    entityTypes: Immutable.List(),
    propertyTypesById: Immutable.Map(),
    filterQuery: ''
  };

  constructor(props :Props) {

    super(props);

    const filteredEntityTypes :List<Map<*, *>> = EntityTypesContainer.filterEntityTypes(
      props.entityTypes,
      props.filterQuery
    );

    this.state = {
      filteredEntityTypes,
      selectedIndex: 0
    };
  }

  static filterEntityTypes(entityTypes :List<Map<*, *>>, filterQuery :?string) :List<Map<*, *>> {

    return entityTypes.filter((entityType :Map<*, *>) => {

      const entityTypeId :string = entityType.get('id');
      const etType :Map<string, string> = entityType.get('type', Immutable.Map());
      const etFQN :string = (new FullyQualifiedName(etType.toJS())).getFullyQualifiedName();
      const etTitle :string = entityType.get('title', '');

      let includeEntityType :boolean = true;
      if (filterQuery && filterQuery.trim()) {
        const matchesId :boolean = (entityTypeId === filterQuery);
        const matchesFQN :boolean = etFQN.includes(filterQuery.trim());
        const matchesTitle :boolean = etTitle.includes(filterQuery.trim());
        if (!matchesId && !matchesFQN && !matchesTitle) {
          includeEntityType = false;
        }
      }

      return includeEntityType;
    });
  }

  componentWillReceiveProps(nextProps :Props) {

    // TODO: potential bug with using nextProps.entityTypes
    const filteredEntityTypes :List<Map<*, *>> = EntityTypesContainer.filterEntityTypes(
      nextProps.entityTypes,
      nextProps.filterQuery
    );

    // TODO: might have weird/unexpected behavior by resetting selectedIndex
    this.setState({
      filteredEntityTypes,
      selectedIndex: 0
    });
  }

  renderEntityTypesDataTable = () => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = this.state.filteredEntityTypes.map((entityType :Map<*, *>) => {

      const ptType :Map<string, string> = entityType.get('type', Immutable.Map());
      const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
      const ptTitle :string = entityType.get('title', '');

      return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        map.set('type', ptFQN);
        map.set('title', ptTitle);
      });
    });

    const onClick :Function = (selectedRowIndex :number) => {
      this.setState({
        selectedIndex: selectedRowIndex
      });
    };

    return (
      <EntityTypesCard>
        <h1>EDM EntityTypes</h1>
        {
          data.isEmpty()
            ? (<div>No EntityTypes</div>)
            : null
        }
        <AbstractDataTable
            data={data}
            headers={Immutable.fromJS(headers)}
            onRowClick={onClick}
            maxHeight={600} />
      </EntityTypesCard>
    );
  }

  renderEntityTypePropertiesDataTable = (entityType :Map<*, *>) => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'pk', value: 'PK' },
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = entityType.get('properties', Immutable.List())
      .map((propertyTypeId :UUID) => {
        return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {

          const propertyType :Map<*, *> = this.props.propertyTypesById.get(propertyTypeId, Immutable.Map());
          const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
          const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
          const ptTitle :string = propertyType.get('title', '');

          const isKey :boolean = entityType.get('key', Immutable.List()).includes(propertyTypeId);

          map.set('pk', isKey ? 'PK' : '');
          map.set('type', ptFQN);
          map.set('title', ptTitle);
        })
      })
      .sort((propertyType) => {
        const primaryKey :string = propertyType.get('pk');
        if (primaryKey === 'PK') {
          return -1;
        }
        else if (primaryKey === '') {
          return 1;
        }
        return 0;
      });

    return (
      <AbstractDataTable
          data={data}
          headers={Immutable.fromJS(headers)}
          maxHeight={500} />
    );
  }

  renderEntityTypeDetails = () => {

    if (this.state.selectedIndex < 0) {
      return null;
    }

    const entityType :Map<*, *> = this.state.filteredEntityTypes.get(this.state.selectedIndex, Immutable.Map());
    if (!entityType || entityType.isEmpty()) {
      return null;
    }

    const ptType :Map<string, string> = entityType.get('type', Immutable.Map());
    const fqnAsString :string = `${new FullyQualifiedName(ptType.toJS())}`;

    return (
      <EntityTypeDetailsCard>
        <h1>EntityType Details</h1>
        <section>
          <h2>ID</h2>
          <p>{ entityType.get('id') }</p>
        </section>
        <section>
          <h2>Type</h2>
          <p>{ fqnAsString }</p>
        </section>
        <section>
          <h2>Title</h2>
          <p>{ entityType.get('title') }</p>
        </section>
        <section>
          <h2>Description</h2>
          <p>{ entityType.get('description') }</p>
        </section>
        <section>
          <h2>BaseType</h2>
          <p>{ entityType.get('baseType') }</p>
        </section>
        <section>
          <h2>Category</h2>
          <p>{ entityType.get('category') }</p>
        </section>
        <section>
          <h2>Properties</h2>
          { this.renderEntityTypePropertiesDataTable(entityType) }
        </section>
        <section>
          <h2>Schemas</h2>
          <p>TODO</p>
        </section>
      </EntityTypeDetailsCard>
    );
  }

  render() {

    if (this.props.entityTypes.isEmpty() || this.props.propertyTypesById.isEmpty()) {
      return null;
    }

    return (
      <ETContainerWrapper>
        { this.renderEntityTypesDataTable() }
        { this.renderEntityTypeDetails() }
      </ETContainerWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], Immutable.List()),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Immutable.List())
  };
}

export default connect(mapStateToProps)(EntityTypesContainer);
