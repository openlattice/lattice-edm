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
import type { FQN } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';
import Logger from '../../../utils/Logger';
import * as SchemasActions from './SchemasActions';
import { isValidUUID } from '../../../utils/ValidationUtils';

const LOG :Logger = new Logger('SchemaDetailsContainer');

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
    localUpdateSchema :RequestSequence;
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

  handleAddAssociationType = (associationTypeFQN :FQN) => {

    const {
      actions,
      associationTypes,
      associationTypesIndexMap,
      schema,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationTypeIndex :number = associationTypesIndexMap.get(associationTypeFQN, -1);
      if (associationTypeIndex !== -1) {
        const associationEntityType :Map<*, *> = associationTypes.getIn([associationTypeIndex, 'entityType']);
        if (isValidUUID(associationEntityType.get('id'))) {
          actions.localUpdateSchema({
            actionType: ActionTypes.ADD,
            entityTypes: [associationEntityType],
            schemaFQN: new FullyQualifiedName(schema.get('fqn')),
          });
        }
        else {
          LOG.error('invalid id', associationEntityType.get('id'));
        }
      }
      else {
        LOG.error('AssociationType not found in store', associationTypeFQN);
      }
    }
  }

  handleAddEntityType = (entityTypeFQN :FQN) => {

    const {
      actions,
      entityTypes,
      entityTypesIndexMap,
      schema,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeFQN, -1);
      if (entityTypeIndex !== -1) {
        const entityType :Map<*, *> = entityTypes.get(entityTypeIndex);
        if (isValidUUID(entityType.get('id'))) {
          actions.localUpdateSchema({
            actionType: ActionTypes.ADD,
            entityTypes: [entityType],
            schemaFQN: new FullyQualifiedName(schema.get('fqn')),
          });
        }
        else {
          LOG.error('invalid id', entityType.get('id'));
        }
      }
      else {
        LOG.error('EntityType not found in store', entityTypeFQN);
      }
    }
  }

  handleAddPropertyType = (propertyTypeFQN :FQN) => {

    const {
      actions,
      propertyTypes,
      propertyTypesIndexMap,
      schema,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const propertyTypeIndex :number = propertyTypesIndexMap.get(propertyTypeFQN, -1);
      if (propertyTypeIndex !== -1) {
        const propertyType :Map<*, *> = propertyTypes.get(propertyTypeIndex);
        if (isValidUUID(propertyType.get('id'))) {
          actions.localUpdateSchema({
            actionType: ActionTypes.ADD,
            propertyTypes: [propertyType],
            schemaFQN: new FullyQualifiedName(schema.get('fqn')),
          });
        }
        else {
          LOG.error('invalid id', propertyType.get('id'));
        }
      }
      else {
        LOG.error('PropertyType not found in store', propertyTypeFQN);
      }
    }
  }

  handleRemoveAssociationType = (associationTypeFQN :FQN) => {

    const {
      actions,
      associationTypes,
      associationTypesIndexMap,
      schema,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationTypeIndex :number = associationTypesIndexMap.get(associationTypeFQN, -1);
      if (associationTypeIndex !== -1) {
        const associationTypeId :UUID = associationTypes.getIn([associationTypeIndex, 'entityType', 'id']);
        actions.localUpdateSchema({
          actionType: ActionTypes.REMOVE,
          entityTypeIds: [associationTypeId],
          schemaFQN: new FullyQualifiedName(schema.get('fqn')),
        });
      }
      else {
        LOG.error('AssociationType not found in store', associationTypeFQN);
      }
    }
  }

  handleRemoveEntityType = (entityTypeFQN :FQN) => {

    const {
      actions,
      entityTypes,
      entityTypesIndexMap,
      schema,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeFQN, -1);
      if (entityTypeIndex !== -1) {
        const entityTypeId :UUID = entityTypes.getIn([entityTypeIndex, 'id']);
        actions.localUpdateSchema({
          actionType: ActionTypes.REMOVE,
          entityTypeIds: [entityTypeId],
          schemaFQN: new FullyQualifiedName(schema.get('fqn')),
        });
      }
      else {
        LOG.error('EntityType not found in store', entityTypeFQN);
      }
    }
  }

  handleRemovePropertyType = (propertyTypeFQN :FQN) => {

    const {
      actions,
      propertyTypes,
      propertyTypesIndexMap,
      schema,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const propertyTypeIndex :number = propertyTypesIndexMap.get(propertyTypeFQN, -1);
      if (propertyTypeIndex !== -1) {
        const propertyTypeId :UUID = propertyTypes.getIn([propertyTypeIndex, 'id']);
        actions.localUpdateSchema({
          actionType: ActionTypes.REMOVE,
          propertyTypeIds: [propertyTypeId],
          schemaFQN: new FullyQualifiedName(schema.get('fqn')),
        });
      }
      else {
        LOG.error('PropertyType not found in store', propertyTypeFQN);
      }
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
            onAbstractTypeRemove={this.handleRemoveAssociationType}
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

export default connect<*, *, *, *, *, *>(mapStateToProps, mapDispatchToProps)(SchemaDetailsContainer);
