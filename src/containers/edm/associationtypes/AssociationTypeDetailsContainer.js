/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { Models } from 'lattice';
import { connect } from 'react-redux';

import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypes from '../../../utils/AbstractTypes';

import EntityTypeDetailsContainer from '../entitytypes/EntityTypeDetailsContainer';

const { FullyQualifiedName } = Models;

/*
 * types
 */

type Props = {
  associationType :Map<*, *>,
  entityTypesById :Map<string, Map<*, *>>,
  propertyTypesById :Map<string, Map<*, *>>,
  filterQuery :string
};

class AssoctTypeDetailsContainer extends React.Component<Props> {

  render() {

    if (!this.props.associationType || this.props.associationType.isEmpty()) {
      return null;
    }

    const associationEntityType :Map<*, *> = this.props.associationType.get('entityType', Immutable.Map());

    if (!associationEntityType || associationEntityType.isEmpty()) {
      return null;
    }

    const bidirectional :?boolean = this.props.associationType.get('bidirectional', false);
    const bidiAsString :string = `${String(bidirectional)}`;

    const sourceEntityTypes :List<Map<*, *>> = this.props.associationType.get('src', Immutable.List())
      .map((entityTypeId :string) => {
        return this.props.entityTypesById.get(entityTypeId, Immutable.Map());
      });

    const destinationEntityTypes :List<Map<*, *>> = this.props.associationType.get('dst', Immutable.List())
      .map((entityTypeId :string) => {
        return this.props.entityTypesById.get(entityTypeId, Immutable.Map());
      });

    return (
      <div>
        <h1>AssociationType Details</h1>
        <EntityTypeDetailsContainer entityType={associationEntityType} />
        <section>
          <h2>Bi-directional</h2>
          <p>{ bidiAsString }</p>
        </section>
        <section>
          <h2>Source EntityTypes</h2>
          <AbstractTypeDataTable
              abstractTypes={sourceEntityTypes}
              maxHeight={500}
              workingAbstractTypeType={AbstractTypes.EntityType} />
        </section>
        <section>
          <h2>Destination EntityTypes</h2>
          <AbstractTypeDataTable
              abstractTypes={destinationEntityTypes}
              maxHeight={500}
              workingAbstractTypeType={AbstractTypes.EntityType} />
        </section>
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById'], Immutable.List()),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Immutable.List())
  };
}

export default connect(mapStateToProps)(AssoctTypeDetailsContainer);
