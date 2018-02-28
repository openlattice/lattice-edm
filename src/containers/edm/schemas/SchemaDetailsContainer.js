/*
 * @flow
 */

import React from 'react';

import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';

const { ActionTypes } = Types;
const { updateSchema } = EntityDataModelApiActionFactory;

/*
 * types
 */

type Props = {
  actions :{
    updateSchema :RequestSequence;
  };
  schema :Map<*, *>;
};

class SchemaDetailsContainer extends React.Component<Props> {

  handleRemovePropertyType = (propertyTypeId :string) => {
    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      this.props.actions.updateSchema({
        action: ActionTypes.REMOVE,
        propertyTypeIds: [propertyTypeId],
        schemaFqn: this.props.schema.get('fqn').toJS()
      });
    }
  }

  renderPropertyTypesSection = () => {

    const propertyTypes :List<Map<*, *>> = this.props.schema.get('propertyTypes', List());

    let propertyTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={propertyTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.PropertyType} />
    );

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      propertyTypesDataTable = (
        <AbstractTypeDataTable
            abstractTypes={propertyTypes}
            highlightOnHover
            maxHeight={500}
            showRemoveColumn
            onAbstractTypeRemove={this.handleRemovePropertyType}
            workingAbstractTypeType={AbstractTypes.PropertyType} />
      );
    }

    return (
      <section>
        <h2>PropertyTypes</h2>
        {
          propertyTypes.isEmpty()
            ? <p>No PropertyTypes defined.</p>
            : propertyTypesDataTable
        }
      </section>
    );
  }

  renderEntityTypesSection = () => {

    const entityTypes :List<Map<*, *>> = this.props.schema.get('entityTypes', List())
      .filterNot((entityType :Map<*, *>) => entityType.get('category', '') === AbstractTypes.AssociationType);

    const entityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={entityTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityType} />
    );

    return (
      <section>
        <h2>EntityTypes</h2>
        {
          entityTypes.isEmpty()
            ? <p>No EntityTypes defined.</p>
            : entityTypesDataTable
        }
      </section>
    );
  }

  renderAssociationTypesSection = () => {

    const associationEntityTypes :List<Map<*, *>> = this.props.schema.get('entityTypes', List())
      .filter((entityType :Map<*, *>) => entityType.get('category', '') === AbstractTypes.AssociationType);

    const associationEntityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={associationEntityTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityType} />
    );

    return (
      <section>
        <h2>AssociationTypes</h2>
        {
          associationEntityTypes.isEmpty()
            ? <p>No AssociationTypes defined.</p>
            : associationEntityTypesDataTable
        }
      </section>
    );
  }

  render() {

    if (!this.props.schema || this.props.schema.isEmpty()) {
      return null;
    }

    return (
      <div>
        <h1>Schema Details</h1>
        { this.renderPropertyTypesSection() }
        { this.renderEntityTypesSection() }
        { this.renderAssociationTypesSection() }
      </div>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    updateSchema
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(SchemaDetailsContainer);
