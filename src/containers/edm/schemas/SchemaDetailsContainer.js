/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';

const { FullyQualifiedName } = Models;
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
  associationTypes :List<Map<*, *>>;
  associationTypesById :Map<string, number>;
  entityTypes :List<Map<*, *>>;
  entityTypesById :Map<string, number>;
  propertyTypes :List<Map<*, *>>;
  propertyTypesById :Map<string, number>;
  schema :Map<*, *>;
};

class SchemaDetailsContainer extends React.Component<Props> {

  handleAddAssociationType = (entityTypeId :string) => {

    const {
      actions,
      associationTypes,
      associationTypesById,
      schema
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      // NOTE: this is slightly hacky. updateSchema() will ignore the "entityTypes" field, but our reducer will still
      // have access to it
      let entityTypes :Map<*, *> = Map();
      if (associationTypesById.has(entityTypeId)) {
        const targetIndex :number = associationTypesById.get(entityTypeId);
        const targetEntityType :Map<*, *> = associationTypes.getIn([targetIndex, 'entityType'], Map());
        // confirm retrieved EntityType id matches "entityTypeId"
        if (entityTypeId === targetEntityType.get('id')) {
          entityTypes = entityTypes.set(entityTypeId, targetEntityType);
        }
      }
      actions.updateSchema({
        entityTypes,
        action: ActionTypes.ADD,
        entityTypeIds: [entityTypeId],
        schemaFqn: schema.get('fqn').toJS()
      });
    }
  }

  handleAddEntityType = (entityTypeId :string) => {

    const {
      actions,
      entityTypes,
      entityTypesById,
      schema
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      // NOTE: this is slightly hacky. updateSchema() will ignore the "entityTypes" field, but our reducer will still
      // have access to it
      let theEntityTypes :Map<*, *> = Map();
      if (entityTypesById.has(entityTypeId)) {
        const targetIndex :number = entityTypesById.get(entityTypeId);
        const targetEntityType :Map<*, *> = entityTypes.get(targetIndex, Map());
        // confirm retrieved EntityType id matches "entityTypeId"
        if (entityTypeId === targetEntityType.get('id')) {
          theEntityTypes = theEntityTypes.set(entityTypeId, targetEntityType);
        }
      }
      actions.updateSchema({
        action: ActionTypes.ADD,
        entityTypes: theEntityTypes,
        entityTypeIds: [entityTypeId],
        schemaFqn: schema.get('fqn').toJS()
      });
    }
  }

  handleAddPropertyType = (propertyTypeId :string) => {

    const {
      actions,
      propertyTypes,
      propertyTypesById,
      schema
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      // NOTE: this is slightly hacky. updateSchema() will ignore the "propertyTypes" field, but our reducer will still
      // have access to it
      let thePropertyTypes :Map<*, *> = Map();
      if (propertyTypesById.has(propertyTypeId)) {
        const targetIndex :number = propertyTypesById.get(propertyTypeId);
        const targetPropertyType :Map<*, *> = propertyTypes.get(targetIndex, Map());
        // confirm retrieved PropertyType id matches "propertyTypeId"
        if (propertyTypeId === targetPropertyType.get('id')) {
          thePropertyTypes = thePropertyTypes.set(propertyTypeId, targetPropertyType);
        }
      }
      actions.updateSchema({
        action: ActionTypes.ADD,
        propertyTypes: thePropertyTypes,
        propertyTypeIds: [propertyTypeId],
        schemaFqn: schema.get('fqn').toJS()
      });
    }
  }

  handleRemoveEntityType = (entityTypeId :string) => {

    const { actions, schema } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      actions.updateSchema({
        action: ActionTypes.REMOVE,
        entityTypeIds: [entityTypeId],
        schemaFqn: schema.get('fqn').toJS()
      });
    }
  }

  handleRemovePropertyType = (propertyTypeId :string) => {

    const { actions, schema } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      actions.updateSchema({
        action: ActionTypes.REMOVE,
        propertyTypeIds: [propertyTypeId],
        schemaFqn: schema.get('fqn').toJS()
      });
    }
  }

  renderPropertyTypesSection = () => {

    const { schema } = this.props;

    const propertyTypes :List<Map<*, *>> = schema.get('propertyTypes', List());

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
        <h2>
          PropertyTypes
        </h2>
        {
          propertyTypes.isEmpty()
            ? (
              <p>
                No PropertyTypes defined.
              </p>
            )
            : propertyTypesDataTable
        }
      </section>
    );
  }

  renderAddPropertyTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const { propertyTypes, schema } = this.props;

    const schemaPropertyTypeIds :List<string> = schema.get('propertyTypes', List())
      .map((propertyType :Map<*, *>) => propertyType.get('id'));

    const availablePropertyTypes :List<Map<*, *>> = propertyTypes
      .filterNot((propertyType :Map<*, *>) => schemaPropertyTypeIds.includes(propertyType.get('id', '')));

    return (
      <section>
        <h2>
          Add PropertyTypes
        </h2>
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

    const { schema } = this.props;

    const entityTypes :List<Map<*, *>> = schema.get('entityTypes', List())
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
        <h2>
          EntityTypes
        </h2>
        {
          entityTypes.isEmpty()
            ? (
              <p>
                No EntityTypes defined.
              </p>
            )
            : entityTypesDataTable
        }
      </section>
    );
  }

  renderAddEntityTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const { entityTypes, schema } = this.props;

    const schemaEntityTypeIds :List<string> = schema.get('entityTypes', List())
      .map((entityType :Map<*, *>) => entityType.get('id'));

    const availableEntityTypes :List<Map<*, *>> = entityTypes
      .filterNot((entityType :Map<*, *>) => schemaEntityTypeIds.includes(entityType.get('id', '')));

    return (
      <section>
        <h2>
          Add EntityTypes
        </h2>
        <AbstractTypeSearchableSelectWrapper>
          <AbstractTypeSearchableSelect
              abstractTypes={availableEntityTypes}
              maxHeight={400}
              searchPlaceholder="Available EntityTypes..."
              workingAbstractTypeType={AbstractTypes.EntityType}
              onAbstractTypeSelect={this.handleAddEntityType} />
        </AbstractTypeSearchableSelectWrapper>
      </section>
    );
  }

  renderAssociationTypesSection = () => {

    const { schema } = this.props;

    const associationEntityTypes :List<Map<*, *>> = schema.get('entityTypes', List())
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
        <h2>
          AssociationTypes
        </h2>
        {
          associationEntityTypes.isEmpty()
            ? (
              <p>
                No AssociationTypes defined.
              </p>
            )
            : associationEntityTypesDataTable
        }
      </section>
    );
  }

  renderAddAssociationTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const { associationTypes, schema } = this.props;

    const schemaEntityTypeIds :List<string> = schema.get('entityTypes', List())
      .map((entityType :Map<*, *>) => entityType.get('id'));

    const availableEntityTypes :List<Map<*, *>> = associationTypes
      .map((associationType :Map<*, *>) => associationType.get('entityType', Map()))
      .filterNot((entityType :Map<*, *>) => schemaEntityTypeIds.includes(entityType.get('id', '')));

    return (
      <section>
        <h2>
          Add AssociationTypes
        </h2>
        <AbstractTypeSearchableSelectWrapper>
          <AbstractTypeSearchableSelect
              abstractTypes={availableEntityTypes}
              maxHeight={400}
              searchPlaceholder="Available AssociationTypes..."
              workingAbstractTypeType={AbstractTypes.EntityType} // yes, EntityType, not AssociationType
              onAbstractTypeSelect={this.handleAddAssociationType} />
        </AbstractTypeSearchableSelectWrapper>
      </section>
    );
  }

  render() {

    const { schema } = this.props;

    if (!schema || schema.isEmpty()) {
      return null;
    }

    return (
      <div>
        <h1>
          Schema Details
        </h1>
        <section>
          <h2>
            FQN
          </h2>
          <p>
            { FullyQualifiedName.toString(schema.get('fqn')) }
          </p>
        </section>
        { this.renderPropertyTypesSection() }
        { this.renderAddPropertyTypesSection() }
        { this.renderEntityTypesSection() }
        { this.renderAddEntityTypesSection() }
        { this.renderAssociationTypesSection() }
        { this.renderAddAssociationTypesSection() }
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes']),
    associationTypesById: state.getIn(['edm', 'associationTypes', 'associationTypesById']),
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById']),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'])
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
