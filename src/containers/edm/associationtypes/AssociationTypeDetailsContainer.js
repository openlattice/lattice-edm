/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';
import StyledButton from '../../../components/buttons/StyledButton';

import * as AuthUtils from '../../../core/auth/AuthUtils';
import {
  addDestinationEntityTypeToAssociationType,
  addSourceEntityTypeToAssociationType,
  deleteAssociationTypeRequest,
  removeDestinationEntityTypeFromAssociationType,
  removeSourceEntityTypeFromAssociationType
} from './AssociationTypesActionFactory';

import type { RequestSequence } from '../../../core/redux/RequestSequence';

/*
 * styled components
 */

const DeleteButton = StyledButton.extend`
  align-self: center;
`;

const AbstractTypeSearchableSelectWrapper = styled.div`
  margin: 20px 0;
`;

/*
 * types
 */

type Props = {
  actions :{
    addDestinationEntityTypeToAssociationType :RequestSequence,
    addSourceEntityTypeToAssociationType :RequestSequence,
    deleteAssociationTypeRequest :Function,
    removeDestinationEntityTypeFromAssociationType :RequestSequence,
    removeSourceEntityTypeFromAssociationType :RequestSequence
  },
  associationType :Map<*, *>,
  entityTypes :List<Map<*, *>>,
  entityTypesById :Map<string, number>,
  propertyTypes :List<Map<*, *>>,
  propertyTypesById :Map<string, number>
};

class AssoctTypeDetailsContainer extends React.Component<Props> {

  handleAddDestinationEntityTypeToAssociationType = (entityTypeIdToAdd :string) => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = this.props.associationType.get('entityType', Immutable.Map());
      this.props.actions.addDestinationEntityTypeToAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToAdd
      });
    }
  }

  handleAddSourceEntityTypeToAssociationType = (entityTypeIdToAdd :string) => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = this.props.associationType.get('entityType', Immutable.Map());
      this.props.actions.addSourceEntityTypeToAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToAdd
      });
    }
  }

  handleRemoveDestinationEntityTypeFromAssociationType = (entityTypeIdToRemove :string) => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = this.props.associationType.get('entityType', Immutable.Map());
      this.props.actions.removeDestinationEntityTypeFromAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToRemove
      });
    }
  }

  handleRemoveSourceEntityTypeFromAssociationType = (entityTypeIdToRemove :string) => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = this.props.associationType.get('entityType', Immutable.Map());
      this.props.actions.removeSourceEntityTypeFromAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToRemove
      });
    }
  }

  handleOnClickDelete = () => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = this.props.associationType.get('entityType', Immutable.Map());
      this.props.actions.deleteAssociationTypeRequest(associationEntityType.get('id'));
    }
  }

  renderEntityTypeDetails = () => {

    // TODO: consider refactoring this since it's basically a copy of EntityTypeDetailsContainer

    const associationEntityType :Map<*, *> = this.props.associationType.get('entityType', Immutable.Map());

    const baseType :string = associationEntityType.get('baseType', '');

    const keyPropertyTypeIds :Set<string> = associationEntityType.get('key', Immutable.List()).toSet();
    const propertyTypeIds :Set<string> = associationEntityType.get('properties', Immutable.List()).toSet();

    const keyPropertyTypes :List<Map<*, *>> = keyPropertyTypeIds
      .map((propertyTypeId :string) => {
        const index :number = this.props.propertyTypesById.get(propertyTypeId, -1);
        if (index === -1) {
          return Immutable.Map();
        }
        return this.props.propertyTypes.get(index, Immutable.Map());
      })
      .toList();

    const propertyTypes :List<Map<*, *>> = propertyTypeIds.subtract(keyPropertyTypeIds)
      .map((propertyTypeId :string) => {
        const index :number = this.props.propertyTypesById.get(propertyTypeId, -1);
        if (index === -1) {
          return Immutable.Map();
        }
        return this.props.propertyTypes.get(index, Immutable.Map());
      })
      .toList();


    return (
      <section>
        <h2>EntityType Details</h2>
        <div>
          <h2>ID</h2>
          <p>{ associationEntityType.get('id') }</p>
        </div>
        <div>
          <AbstractTypeFieldType
              abstractType={this.props.associationType}
              abstractTypeType={AbstractTypes.AssociationType} />
        </div>
        <div>
          <AbstractTypeFieldTitle
              abstractType={this.props.associationType}
              abstractTypeType={AbstractTypes.AssociationType} />
        </div>
        <div>
          <AbstractTypeFieldDescription
              abstractType={this.props.associationType}
              abstractTypeType={AbstractTypes.AssociationType} />
        </div>
        {
          !baseType
            ? null
            : (
              <div>
                <h2>BaseType</h2>
                <p>{ associationEntityType.get('baseType') }</p>
              </div>
            )
        }
        <div>
          <h2>Category</h2>
          <p>{ associationEntityType.get('category') }</p>
        </div>
        <div>
          <h2>Primary Key PropertyTypes</h2>
          <AbstractTypeDataTable
              abstractTypes={keyPropertyTypes}
              maxHeight={500}
              workingAbstractTypeType={AbstractTypes.PropertyType} />
        </div>
        {
          propertyTypes.isEmpty()
            ? null
            : (
              <div>
                <h2>PropertyTypes</h2>
                <AbstractTypeDataTable
                    abstractTypes={propertyTypes}
                    maxHeight={500}
                    workingAbstractTypeType={AbstractTypes.PropertyType} />
              </div>
            )
        }
      </section>
    );
  }

  renderSourceEntityTypesSection = (sourceEntityTypes :List<Map<*, *>>) => {

    if (sourceEntityTypes.isEmpty()) {
      return null;
    }

    let entityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={sourceEntityTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityType} />
    );

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      entityTypesDataTable = (
        <AbstractTypeDataTable
            abstractTypes={sourceEntityTypes}
            highlightOnHover
            maxHeight={500}
            showRemoveColumn
            onAbstractTypeRemove={this.handleRemoveSourceEntityTypeFromAssociationType}
            workingAbstractTypeType={AbstractTypes.EntityType} />
      );
    }

    return (
      <section>
        <h2>Source EntityTypes</h2>
        { entityTypesDataTable }
      </section>
    );
  }

  renderAddSourceEntityTypesSection = () => {

    const availableEntityTypes :List<Map<*, *>> = this.props.entityTypes
      .filterNot((entityType :Map<*, *>) => {
        const sourceEntityTypeIds :List<string> = this.props.associationType.get('src', Immutable.List());
        return sourceEntityTypeIds.includes(entityType.get('id', ''));
      });

    return (
      <section>
        <h2>Add Source EntityTypes</h2>
        <AbstractTypeSearchableSelectWrapper>
          <AbstractTypeSearchableSelect
              abstractTypes={availableEntityTypes}
              maxHeight={400}
              searchPlaceholder="Available EntityTypes..."
              workingAbstractTypeType={AbstractTypes.EntityType}
              onAbstractTypeSelect={this.handleAddSourceEntityTypeToAssociationType} />
        </AbstractTypeSearchableSelectWrapper>
      </section>
    );
  }

  renderDestinationEntityTypesSection = (destinationEntityTypes :List<Map<*, *>>) => {

    if (destinationEntityTypes.isEmpty()) {
      return null;
    }

    let entityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={destinationEntityTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityType} />
    );

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      entityTypesDataTable = (
        <AbstractTypeDataTable
            abstractTypes={destinationEntityTypes}
            highlightOnHover
            maxHeight={500}
            showRemoveColumn
            onAbstractTypeRemove={this.handleRemoveDestinationEntityTypeFromAssociationType}
            workingAbstractTypeType={AbstractTypes.EntityType} />
      );
    }

    return (
      <section>
        <h2>Destination EntityTypes</h2>
        { entityTypesDataTable }
      </section>
    );
  }
  renderAddDestinationEntityTypesSection = () => {

    const availableEntityTypes :List<Map<*, *>> = this.props.entityTypes
      .filterNot((entityType :Map<*, *>) => {
        const destinationEntityTypeIds :List<string> = this.props.associationType.get('dst', Immutable.List());
        return destinationEntityTypeIds.includes(entityType.get('id', ''));
      });

    return (
      <section>
        <h2>Add Destination EntityTypes</h2>
        <AbstractTypeSearchableSelectWrapper>
          <AbstractTypeSearchableSelect
              abstractTypes={availableEntityTypes}
              maxHeight={400}
              searchPlaceholder="Available EntityTypes..."
              workingAbstractTypeType={AbstractTypes.EntityType}
              onAbstractTypeSelect={this.handleAddDestinationEntityTypeToAssociationType} />
        </AbstractTypeSearchableSelectWrapper>
      </section>
    );
  }

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
        const index :number = this.props.entityTypesById.get(entityTypeId, -1);
        if (index === -1) {
          return Immutable.Map();
        }
        return this.props.entityTypes.get(index, Immutable.Map());
      });

    const destinationEntityTypes :List<Map<*, *>> = this.props.associationType.get('dst', Immutable.List())
      .map((entityTypeId :string) => {
        const index :number = this.props.entityTypesById.get(entityTypeId, -1);
        if (index === -1) {
          return Immutable.Map();
        }
        return this.props.entityTypes.get(index, Immutable.Map());
      });

    return (
      <div>
        <h1>AssociationType Details</h1>
        { this.renderEntityTypeDetails() }
        <section>
          <h2>Bi-directional</h2>
          <p>{ bidiAsString }</p>
        </section>
        { this.renderSourceEntityTypesSection(sourceEntityTypes) }
        { this.renderAddSourceEntityTypesSection() }
        { this.renderDestinationEntityTypesSection(destinationEntityTypes) }
        { this.renderAddDestinationEntityTypesSection() }
        {
          AuthUtils.isAuthenticated() && AuthUtils.isAdmin()
            ? (
              <section>
                <DeleteButton onClick={this.handleOnClickDelete}>Delete AssociationType</DeleteButton>
              </section>
            )
            : null
        }
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], Immutable.List()),
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById'], Immutable.Map()),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], Immutable.List()),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Immutable.Map())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    addDestinationEntityTypeToAssociationType,
    addSourceEntityTypeToAssociationType,
    deleteAssociationTypeRequest,
    removeDestinationEntityTypeFromAssociationType,
    removeSourceEntityTypeFromAssociationType
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AssoctTypeDetailsContainer);
