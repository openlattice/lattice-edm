/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map, OrderedSet } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';
import StyledButton from '../../../components/buttons/StyledButton';

const {
  addDstEntityTypeToAssociationType,
  addPropertyTypeToEntityType,
  addSrcEntityTypeToAssociationType,
  deleteAssociationType,
  removeDstEntityTypeFromAssociationType,
  removePropertyTypeFromEntityType,
  removeSrcEntityTypeFromAssociationType,
  reorderEntityTypePropertyTypes
} = EntityDataModelApiActionFactory;

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
    addDstEntityTypeToAssociationType :RequestSequence;
    addPropertyTypeToEntityType :RequestSequence;
    addSrcEntityTypeToAssociationType :RequestSequence;
    deleteAssociationType :RequestSequence;
    removeDstEntityTypeFromAssociationType :RequestSequence;
    removePropertyTypeFromEntityType :RequestSequence;
    removeSrcEntityTypeFromAssociationType :RequestSequence;
    reorderEntityTypePropertyTypes :RequestSequence;
  };
  associationType :Map<*, *>;
  entityTypes :List<Map<*, *>>;
  entityTypesById :Map<string, number>;
  propertyTypes :List<Map<*, *>>;
  propertyTypesById :Map<string, number>;
};

class AssoctTypeDetailsContainer extends React.Component<Props> {

  handleAddDestinationEntityTypeToAssociationType = (entityTypeIdToAdd :string) => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      actions.addDstEntityTypeToAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToAdd
      });
    }
  }

  handleAddPropertyTypeToAssociationType = (propertyTypeIdToAdd :string) => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      actions.addPropertyTypeToEntityType({
        entityTypeId: associationEntityType.get('id'),
        propertyTypeId: propertyTypeIdToAdd
      });
    }
  }

  handleAddSourceEntityTypeToAssociationType = (entityTypeIdToAdd :string) => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      actions.addSrcEntityTypeToAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToAdd
      });
    }
  }

  handleRemoveDestinationEntityTypeFromAssociationType = (entityTypeIdToRemove :string) => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      actions.removeDstEntityTypeFromAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToRemove
      });
    }
  }

  handleRemovePropertyTypeFromAssociationType = (propertyTypeIdToRemove :string) => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      actions.removePropertyTypeFromEntityType({
        entityTypeId: associationEntityType.get('id'),
        propertyTypeId: propertyTypeIdToRemove
      });
    }
  }

  handleRemoveSourceEntityTypeFromAssociationType = (entityTypeIdToRemove :string) => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      actions.removeSrcEntityTypeFromAssociationType({
        associationTypeId: associationEntityType.get('id'),
        entityTypeId: entityTypeIdToRemove
      });
    }
  }

  handleReorderPropertyTypes = (oldIndex :number, newIndex :number) => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {

      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      const propertyTypeIds :List<string> = associationEntityType.get('properties');
      const idToMove :string = propertyTypeIds.get(oldIndex);
      const reorderedPropertyTypeIds :List<string> = propertyTypeIds.delete(oldIndex).insert(newIndex, idToMove);

      actions.reorderEntityTypePropertyTypes({
        entityTypeId: associationEntityType.get('id'),
        propertyTypeIds: reorderedPropertyTypeIds.toJS()
      });
    }
  }

  handleOnClickDelete = () => {

    const { actions, associationType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      actions.deleteAssociationType(associationEntityType.get('id'));
    }
  }

  renderEntityTypeDetails = () => {

    const { associationType, propertyTypes, propertyTypesById } = this.props;

    // TODO: consider refactoring this since it's basically a copy of EntityTypeDetailsContainer

    const associationEntityType :Map<*, *> = associationType.get('entityType', Map());

    const baseType :string = associationEntityType.get('baseType', '');

    const keyPropertyTypeIds :OrderedSet<string> = associationEntityType.get('key').toOrderedSet();
    const propertyTypeIds :OrderedSet<string> = associationEntityType.get('properties').toOrderedSet();

    const keyPropertyTypes :List<Map<*, *>> = keyPropertyTypeIds
      .map((propertyTypeId :string) => {
        const index :number = propertyTypesById.get(propertyTypeId, -1);
        if (index === -1) {
          return Map();
        }
        return propertyTypes.get(index, Map());
      })
      .toList();

    const thePropertyTypes :List<Map<*, *>> = propertyTypeIds
      .map((propertyTypeId :string) => {
        const index :number = propertyTypesById.get(propertyTypeId, -1);
        if (index === -1) {
          return Map();
        }
        return propertyTypes.get(index, Map());
      })
      .toList();

    let propertyTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={thePropertyTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.PropertyType} />
    );

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      propertyTypesDataTable = (
        <AbstractTypeDataTable
            abstractTypes={thePropertyTypes}
            highlightOnHover
            maxHeight={500}
            onAbstractTypeRemove={this.handleRemovePropertyTypeFromAssociationType}
            onReorder={this.handleReorderPropertyTypes}
            orderable
            showRemoveColumn
            workingAbstractTypeType={AbstractTypes.PropertyType} />
      );
    }

    return (
      <section>
        <div>
          <h2>
            ID
          </h2>
          <p>
            { associationEntityType.get('id') }
          </p>
        </div>
        <div>
          <AbstractTypeFieldType
              abstractType={associationType}
              abstractTypeType={AbstractTypes.AssociationType} />
        </div>
        <div>
          <AbstractTypeFieldTitle
              abstractType={associationType}
              abstractTypeType={AbstractTypes.AssociationType} />
        </div>
        <div>
          <AbstractTypeFieldDescription
              abstractType={associationType}
              abstractTypeType={AbstractTypes.AssociationType} />
        </div>
        {
          !baseType
            ? null
            : (
              <div>
                <h2>
                  BaseType
                </h2>
                <p>
                  { associationEntityType.get('baseType') }
                </p>
              </div>
            )
        }
        <div>
          <h2>
            Category
          </h2>
          <p>
            { associationEntityType.get('category') }
          </p>
        </div>
        <div>
          <h2>
            Primary Key PropertyTypes
          </h2>
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
                <h2>
                  PropertyTypes
                </h2>
                { propertyTypesDataTable }
              </div>
            )
        }
        { this.renderAddPropertyTypesSection() }
      </section>
    );
  }

  renderAddPropertyTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const { associationType, propertyTypes } = this.props;

    const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
    const availablePropertyTypes :List<Map<*, *>> = propertyTypes
      .filterNot((propertyType :Map<*, *>) => {
        const propertyTypeIds :List<string> = associationEntityType.get('properties', List());
        return propertyTypeIds.includes(propertyType.get('id', ''));
      });

    return (
      <div>
        <h2>
          Add PropertyTypes
        </h2>
        <AbstractTypeSearchableSelectWrapper>
          <AbstractTypeSearchableSelect
              abstractTypes={availablePropertyTypes}
              maxHeight={400}
              searchPlaceholder="Available PropertyTypes..."
              workingAbstractTypeType={AbstractTypes.PropertyType}
              onAbstractTypeSelect={this.handleAddPropertyTypeToAssociationType} />
        </AbstractTypeSearchableSelectWrapper>
      </div>
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
        <h2>
          Source EntityTypes
        </h2>
        { entityTypesDataTable }
      </section>
    );
  }

  renderAddSourceEntityTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const { associationType, entityTypes } = this.props;

    const availableEntityTypes :List<Map<*, *>> = entityTypes
      .filterNot((entityType :Map<*, *>) => {
        const sourceEntityTypeIds :List<string> = associationType.get('src', List());
        return sourceEntityTypeIds.includes(entityType.get('id', ''));
      });

    return (
      <section>
        <h2>
          Add Source EntityTypes
        </h2>
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
        <h2>
          Destination EntityTypes
        </h2>
        { entityTypesDataTable }
      </section>
    );
  }
  renderAddDestinationEntityTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const { associationType, entityTypes } = this.props;

    const availableEntityTypes :List<Map<*, *>> = entityTypes
      .filterNot((entityType :Map<*, *>) => {
        const destinationEntityTypeIds :List<string> = associationType.get('dst', List());
        return destinationEntityTypeIds.includes(entityType.get('id', ''));
      });

    return (
      <section>
        <h2>
          Add Destination EntityTypes
        </h2>
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

    const { associationType, entityTypes, entityTypesById } = this.props;

    if (!associationType || associationType.isEmpty()) {
      return null;
    }

    const associationEntityType :Map<*, *> = associationType.get('entityType', Map());

    if (!associationEntityType || associationEntityType.isEmpty()) {
      return null;
    }

    const bidirectional :?boolean = associationType.get('bidirectional', false);
    const bidiAsString :string = `${String(bidirectional)}`;

    const sourceEntityTypes :List<Map<*, *>> = associationType.get('src', List())
      .map((entityTypeId :string) => {
        const index :number = entityTypesById.get(entityTypeId, -1);
        if (index === -1) {
          return Map();
        }
        return entityTypes.get(index, Map());
      });

    const destinationEntityTypes :List<Map<*, *>> = associationType.get('dst', List())
      .map((entityTypeId :string) => {
        const index :number = entityTypesById.get(entityTypeId, -1);
        if (index === -1) {
          return Map();
        }
        return entityTypes.get(index, Map());
      });

    return (
      <div>
        <h1>
          AssociationType Details
        </h1>
        { this.renderEntityTypeDetails() }
        <section>
          <h2>
            Bi-directional
          </h2>
          <p>
            { bidiAsString }
          </p>
        </section>
        { this.renderSourceEntityTypesSection(sourceEntityTypes) }
        { this.renderAddSourceEntityTypesSection() }
        { this.renderDestinationEntityTypesSection(destinationEntityTypes) }
        { this.renderAddDestinationEntityTypesSection() }
        {
          AuthUtils.isAuthenticated() && AuthUtils.isAdmin()
            ? (
              <section>
                <DeleteButton onClick={this.handleOnClickDelete}>
                  Delete AssociationType
                </DeleteButton>
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
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], List()),
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById'], Map()),
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], List()),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Map())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    addDstEntityTypeToAssociationType,
    addPropertyTypeToEntityType,
    addSrcEntityTypeToAssociationType,
    deleteAssociationType,
    removeDstEntityTypeFromAssociationType,
    removePropertyTypeFromEntityType,
    removeSrcEntityTypeFromAssociationType,
    reorderEntityTypePropertyTypes
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AssoctTypeDetailsContainer);
