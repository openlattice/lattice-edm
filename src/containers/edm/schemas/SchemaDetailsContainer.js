/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';

const { ActionTypes } = Types;
const { updateSchema } = EntityDataModelApiActionFactory;

/*
 * styled components
 */

const AbstractTypeSearchableSelectWrapper = styled.div`
  margin: 20px 0;
`;

/*
 * types
 */

type Props = {
  actions :{
    updateSchema :RequestSequence;
  };
  propertyTypes :List<Map<*, *>>;
  propertyTypesById :Map<string, number>;
  schema :Map<*, *>;
};

class SchemaDetailsContainer extends React.Component<Props> {

  handleAddPropertyType = (propertyTypeId :string) => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      // NOTE: this is slightly hacky. updateSchema() will ignore the "propertyType" field, but our reducer will still
      // have access to it
      let propertyTypes :Map<*, *> = Map();
      if (this.props.propertyTypesById.has(propertyTypeId)) {
        const targetPropertyTypeIndex :number = this.props.propertyTypesById.get(propertyTypeId);
        const targetPropertyType :Map<*, *> = this.props.propertyTypes.get(targetPropertyTypeIndex, Map());
        // confirm retrieved PropertyType id matches "propertyTypeId"
        if (propertyTypeId === targetPropertyType.get('id')) {
          propertyTypes = propertyTypes.set(propertyTypeId, targetPropertyType);
        }
      }
      this.props.actions.updateSchema({
        propertyTypes,
        action: ActionTypes.ADD,
        propertyTypeIds: [propertyTypeId],
        schemaFqn: this.props.schema.get('fqn').toJS()
      });
    }
  }

  handleRemoveEntityType = (entityTypeId :string) => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      this.props.actions.updateSchema({
        action: ActionTypes.REMOVE,
        entityTypeIds: [entityTypeId],
        schemaFqn: this.props.schema.get('fqn').toJS()
      });
    }
  }

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

  renderAddPropertyTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const schemaPropertyTypeIds :List<string> = this.props.schema.get('propertyTypes', List())
      .map((propertyType :Map<*, *>) => propertyType.get('id'));

    const availablePropertyTypes :List<Map<*, *>> = this.props.propertyTypes
      .filterNot((propertyType :Map<*, *>) => schemaPropertyTypeIds.includes(propertyType.get('id', '')));

    return (
      <section>
        <h2>Add PropertyTypes</h2>
        <AbstractTypeSearchableSelectWrapper>
          <AbstractTypeSearchableSelect
              abstractTypes={availablePropertyTypes}
              maxHeight={400}
              searchPlaceholder="Available PropertyTypes..."
              workingAbstractTypeType={AbstractTypes.PropertyType}
              onAbstractTypeSelect={this.handleAddPropertyType} />
        </AbstractTypeSearchableSelectWrapper>
      </section>
    );
  }

  renderEntityTypesSection = () => {

    const entityTypes :List<Map<*, *>> = this.props.schema.get('entityTypes', List())
      .filterNot((entityType :Map<*, *>) => entityType.get('category', '') === AbstractTypes.AssociationType);

    let entityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={entityTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityType} />
    );

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      entityTypesDataTable = (
        <AbstractTypeDataTable
            abstractTypes={entityTypes}
            highlightOnHover
            maxHeight={500}
            showRemoveColumn
            onAbstractTypeRemove={this.handleRemoveEntityType}
            workingAbstractTypeType={AbstractTypes.EntityType} />
      );
    }

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

    let associationEntityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={associationEntityTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityType} />
    );

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      associationEntityTypesDataTable = (
        <AbstractTypeDataTable
            abstractTypes={associationEntityTypes}
            highlightOnHover
            maxHeight={500}
            showRemoveColumn
            onAbstractTypeRemove={this.handleRemoveEntityType}
            workingAbstractTypeType={AbstractTypes.EntityType} />
      );
    }

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
        { this.renderAddPropertyTypesSection() }
        { this.renderEntityTypesSection() }
        { this.renderAssociationTypesSection() }
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById']),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    updateSchema
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SchemaDetailsContainer);
