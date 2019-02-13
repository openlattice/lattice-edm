/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';
import * as SchemasActions from './SchemasActions';

const { FullyQualifiedName } = Models;
const { ActionTypes } = Types;

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
  associationTypesIndexMap :Map<string, number>;
  entityTypes :List<Map<*, *>>;
  entityTypesIndexMap :Map<string, number>;
  propertyTypes :List<Map<*, *>>;
  propertyTypesIndexMap :Map<string, number>;
  schema :Map<*, *>;
};

class SchemaDetailsContainer extends React.Component<Props> {

  handleAddAssociationType = (entityTypeId :string) => {

    const {
      actions,
      associationTypes,
      associationTypesIndexMap,
      schema
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      // NOTE: this is slightly hacky. updateSchema() will ignore the "entityTypes" field, but our reducer will still
      // have access to it
      let entityTypes :Map<*, *> = Map();
      if (associationTypesIndexMap.has(entityTypeId)) {
        const targetIndex :number = associationTypesIndexMap.get(entityTypeId);
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
        schemaFqn: new FullyQualifiedName(schema.get('fqn')),
      });
    }
  }

  handleAddEntityType = (entityTypeId :string) => {

    const {
      actions,
      entityTypes,
      entityTypesIndexMap,
      schema
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      // NOTE: this is slightly hacky. updateSchema() will ignore the "entityTypes" field, but our reducer will still
      // have access to it
      let theEntityTypes :Map<*, *> = Map();
      if (entityTypesIndexMap.has(entityTypeId)) {
        const targetIndex :number = entityTypesIndexMap.get(entityTypeId);
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
        schemaFqn: new FullyQualifiedName(schema.get('fqn')),
      });
    }
  }

  handleAddPropertyType = (propertyTypeId :string) => {

    const {
      actions,
      propertyTypes,
      propertyTypesIndexMap,
      schema
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      // NOTE: this is slightly hacky. updateSchema() will ignore the "propertyTypes" field, but our reducer will still
      // have access to it
      let thePropertyTypes :Map<*, *> = Map();
      if (propertyTypesIndexMap.has(propertyTypeId)) {
        const targetIndex :number = propertyTypesIndexMap.get(propertyTypeId);
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
        schemaFqn: new FullyQualifiedName(schema.get('fqn')),
      });
    }
  }

  handleRemoveEntityType = (entityTypeId :string) => {

    const { actions, schema } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      actions.updateSchema({
        action: ActionTypes.REMOVE,
        entityTypeIds: [entityTypeId],
        schemaFqn: new FullyQualifiedName(schema.get('fqn')),
      });
    }
  }

  handleRemovePropertyType = (propertyTypeId :string) => {

    const { actions, schema } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      actions.updateSchema({
        action: ActionTypes.REMOVE,
        propertyTypeIds: [propertyTypeId],
        schemaFqn: new FullyQualifiedName(schema.get('fqn')),
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

const mapStateToProps = (state :Map<*, *>) :Object => ({
  associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes']),
  associationTypesIndexMap: state.getIn(['edm', 'associationTypes', 'associationTypesIndexMap']),
  entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
  entityTypesIndexMap: state.getIn(['edm', 'entityTypes', 'entityTypesIndexMap']),
  propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
  propertyTypesIndexMap: state.getIn(['edm', 'propertyTypes', 'propertyTypesIndexMap'])
});

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    localUpdateSchema: SchemasActions.localUpdateSchema,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SchemaDetailsContainer);
