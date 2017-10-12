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

/*
 * styled components
 */

const ATContainerWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
`;

const AssociationTypesCard = StyledCard.extend`
  flex: 1 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

const AssociationTypeDetailsCard = StyledCard.extend`
  flex: 3 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

/*
 * components props & state
 */

type Props = {
  associationTypes :List<Map<*, *>>,
  entityTypesById :Map<string, Map<*, *>>,
  propertyTypesById :Map<string, Map<*, *>>,
  filterQuery :string
};

type State = {
  filteredAssociationTypes :List<Map<*, *>>,
  selectedIndex :number
};

class AssociationTypesContainer extends React.Component<Props, State> {

  constructor(props :Props) {

    super(props);

    const filteredAssociationTypes :List<Map<*, *>> = AssociationTypesContainer.filterAssociationTypes(
      props.associationTypes,
      props.filterQuery
    );

    this.state = {
      filteredAssociationTypes,
      selectedIndex: 0
    };
  }

  static filterAssociationTypes(associationTypes :List<Map<*, *>>, filterQuery :?string) :List<Map<*, *>> {

    return associationTypes.filter((associationType :Map<*, *>) => {

      const entityType :Map<*, *> = associationType.get('entityType', Immutable.Map());
      const etType :Map<string, string> = entityType.get('type', Immutable.Map());
      const etFQN :string = (new FullyQualifiedName(etType.toJS())).getFullyQualifiedName();
      const etTitle :string = entityType.get('title', '');

      let includeEntityType :boolean = true;
      if (filterQuery && filterQuery.trim()) {
        const matchesFQN :boolean = etFQN.includes(filterQuery.trim());
        const matchesTitle :boolean = etTitle.includes(filterQuery.trim());
        if (!matchesFQN && !matchesTitle) {
          includeEntityType = false;
        }
      }

      return includeEntityType;
    });
  }

  componentWillReceiveProps(nextProps :Props) {

    // TODO: potential bug with using nextProps.associationTypes?
    const filteredAssociationTypes :List<Map<*, *>> = AssociationTypesContainer.filterAssociationTypes(
      nextProps.associationTypes,
      nextProps.filterQuery
    );

    // TODO: might have weird/unexpected behavior by resetting selectedIndex
    this.setState({
      filteredAssociationTypes,
      selectedIndex: 0
    });
  }

  renderAssociationTypesDataTable = () => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = this.state.filteredAssociationTypes.map((associationType :Map<*, *>) => {

      const entityType :Map<*, *> = associationType.get('entityType', Immutable.Map());
      const etType :Map<string, string> = entityType.get('type', Immutable.Map());
      const etFQN :string = (new FullyQualifiedName(etType.toJS())).getFullyQualifiedName();
      const etTitle :string = entityType.get('title', '');

      return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        map.set('type', etFQN);
        map.set('title', etTitle);
      });
    });

    const onClick :Function = (selectedRowIndex :number) => {
      this.setState({
        selectedIndex: selectedRowIndex
      });
    };

    return (
      <AssociationTypesCard>
        <h1>EDM AssociationTypes</h1>
        {
          data.isEmpty()
            ? (<div>No AssociationTypes</div>)
            : null
        }
        <AbstractDataTable
            data={data}
            headers={Immutable.fromJS(headers)}
            onRowClick={onClick}
            maxHeight={600} />
      </AssociationTypesCard>
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
          maxHeight={400} />
    );
  }

  renderSourceEntityTypesDataTable = (associationType :Map<*, *>) => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = associationType.get('src', Immutable.List())
      .map((entityTypeId :UUID) => {

        return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {

          const entityType :Map<*, *> = this.props.entityTypesById.get(entityTypeId, Immutable.Map());
          const etType :Map<string, string> = entityType.get('type', Immutable.Map());
          const etFQN :string = (new FullyQualifiedName(etType.toJS())).getFullyQualifiedName();
          const etTitle :string = entityType.get('title', '');

          map.set('type', etFQN);
          map.set('title', etTitle);
        });
      });

    return (
      <AbstractDataTable
          data={data}
          headers={Immutable.fromJS(headers)}
          maxHeight={400} />
    );
  }

  renderDestinationEntityTypesDataTable = (associationType :Map<*, *>) => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = associationType.get('dst', Immutable.List())
      .map((entityTypeId :UUID) => {

        return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {

          const entityType :Map<*, *> = this.props.entityTypesById.get(entityTypeId, Immutable.Map());
          const etType :Map<string, string> = entityType.get('type', Immutable.Map());
          const etFQN :string = (new FullyQualifiedName(etType.toJS())).getFullyQualifiedName();
          const etTitle :string = entityType.get('title', '');

          map.set('type', etFQN);
          map.set('title', etTitle);
        });
      });

    return (
      <AbstractDataTable
          data={data}
          headers={Immutable.fromJS(headers)}
          maxHeight={400} />
    );
  }

  renderAssociationTypeDetails = () => {

    if (this.state.selectedIndex < 0) {
      return null;
    }

    const associationType :Map<*, *> = this.state.filteredAssociationTypes.get(
      this.state.selectedIndex,
      Immutable.Map()
    );

    const entityType :Map<*, *> = associationType.get('entityType', Immutable.Map());

    if (!entityType || entityType.isEmpty()) {
      return null;
    }

    const etType :Map<string, string> = entityType.get('type', Immutable.Map());
    const fqnAsString :string = `${new FullyQualifiedName(etType.toJS())}`;

    const baseType :?string = entityType.get('baseType', null);
    const baseTypeAsString :string = baseType || 'null';

    const bidirectional :?boolean = associationType.get('bidirectional', false);
    const bidiAsString :string = `${String(bidirectional)}`;

    return (
      <AssociationTypeDetailsCard>
        <h1>AssociationType Details</h1>
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
          <p>{ baseTypeAsString }</p>
        </section>
        <section>
          <h2>Category</h2>
          <p>{ entityType.get('category') }</p>
        </section>
        <section>
          <h2>Bi-directional</h2>
          <p>{ bidiAsString }</p>
        </section>
        <section>
          <h2>Properties</h2>
          { this.renderEntityTypePropertiesDataTable(entityType) }
        </section>
        <section>
          <h2>Schemas</h2>
          <p>TODO</p>
        </section>
        <section>
          <h2>Source EntityTypes</h2>
          { this.renderSourceEntityTypesDataTable(associationType) }
        </section>
        <section>
          <h2>Destination EntityTypes</h2>
          { this.renderDestinationEntityTypesDataTable(associationType) }
        </section>
      </AssociationTypeDetailsCard>
    );
  }

  render() {

    if (this.props.associationTypes.isEmpty() || this.props.entityTypesById.isEmpty()) {
      return null;
    }

    return (
      <ATContainerWrapper>
        { this.renderAssociationTypesDataTable() }
        { this.renderAssociationTypeDetails() }
      </ATContainerWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes'], Immutable.List()),
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById'], Immutable.List()),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Immutable.List())
  };
}

export default connect(mapStateToProps)(AssociationTypesContainer);
