/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map, OrderedSet } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import * as AssociationTypesActions from './AssociationTypesActions';

import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';
import AbstractTypes from '../../../utils/AbstractTypes';
import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import type { IndexMap } from '../Types';

const LOG :Logger = new Logger('AssociationTypeDetailsContainer');

const { FQN } = Models;

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
    localAddDstEntityTypeToAssociationType :RequestSequence;
    localAddPropertyTypeToAssociationType :RequestSequence;
    localAddSrcEntityTypeToAssociationType :RequestSequence;
    localRemoveDstEntityTypeFromAssociationType :RequestSequence;
    localRemovePropertyTypeFromAssociationType :RequestSequence;
    localRemoveSrcEntityTypeFromAssociationType :RequestSequence;
  };
  associationType :Map<*, *>;
  entityTypes :List<Map<*, *>>;
  entityTypesIndexMap :IndexMap;
  propertyTypes :List<Map<*, *>>;
  propertyTypesIndexMap :IndexMap;
};

class AssociationTypeDetailsContainer extends React.Component<Props> {

  handleAddDestinationEntityTypeToAssociationType = (selectedEntityTypeFQN :FQN) => {

    const {
      actions,
      associationType,
      entityTypes,
      entityTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      const entityTypesIndex :number = entityTypesIndexMap.get(selectedEntityTypeFQN, -1);
      const entityTypeId :?UUID = entityTypes.getIn([entityTypesIndex, 'id']);
      if (!isValidUUID(entityTypeId)) {
        const errorMsg = 'EntityType id must be a valid UUID, otherwise it cannot be added to an AssociationType';
        LOG.error(errorMsg, entityTypeId);
        return;
      }
      actions.localAddDstEntityTypeToAssociationType({
        entityTypeId,
        associationTypeFQN: FQN.of(associationEntityType.get('type')),
        associationTypeId: associationEntityType.get('id'),
      });
    }
  }

  handleAddPropertyTypeToAssociationType = (selectedPropertyTypeFQN :FQN) => {

    const {
      actions,
      associationType,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      const propertyTypesIndex :number = propertyTypesIndexMap.get(selectedPropertyTypeFQN, -1);
      const propertyTypeId :?UUID = propertyTypes.getIn([propertyTypesIndex, 'id']);
      if (!isValidUUID(propertyTypeId)) {
        const errorMsg = 'PropertyType id must be a valid UUID, otherwise it cannot be added to an AssociationType';
        LOG.error(errorMsg, propertyTypeId);
        return;
      }
      actions.localAddPropertyTypeToAssociationType({
        propertyTypeId,
        associationTypeFQN: FQN.of(associationEntityType.get('type')),
        associationTypeId: associationEntityType.get('id'),
      });
    }
  }

  handleAddSourceEntityTypeToAssociationType = (selectedEntityTypeFQN :FQN) => {

    const {
      actions,
      associationType,
      entityTypes,
      entityTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      const entityTypesIndex :number = entityTypesIndexMap.get(selectedEntityTypeFQN, -1);
      const entityTypeId :?UUID = entityTypes.getIn([entityTypesIndex, 'id']);
      if (!isValidUUID(entityTypeId)) {
        const errorMsg = 'EntityType id must be a valid UUID, otherwise it cannot be added to an AssociationType';
        LOG.error(errorMsg, entityTypeId);
        return;
      }
      actions.localAddSrcEntityTypeToAssociationType({
        entityTypeId,
        associationTypeFQN: FQN.of(associationEntityType.get('type')),
        associationTypeId: associationEntityType.get('id'),
      });
    }
  }

  handleRemoveDestinationEntityTypeFromAssociationType = (selectedEntityTypeFQN :FQN) => {

    const {
      actions,
      associationType,
      entityTypes,
      entityTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      const entityTypesIndex :number = entityTypesIndexMap.get(selectedEntityTypeFQN, -1);
      const entityTypeId :UUID = entityTypes.getIn([entityTypesIndex, 'id']);
      actions.localRemoveDstEntityTypeFromAssociationType({
        entityTypeId,
        associationTypeFQN: FQN.of(associationEntityType.get('type')),
        associationTypeId: associationEntityType.get('id'),
      });
    }
  }

  handleRemovePropertyTypeFromAssociationType = (selectedPropertyTypeFQN :FQN) => {

    const {
      actions,
      associationType,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      const propertyTypesIndex :number = propertyTypesIndexMap.get(selectedPropertyTypeFQN, -1);
      const propertyTypeId :UUID = propertyTypes.getIn([propertyTypesIndex, 'id']);
      actions.localRemovePropertyTypeFromAssociationType({
        propertyTypeId,
        associationTypeFQN: FQN.of(associationEntityType.get('type')),
        associationTypeId: associationEntityType.get('id'),
      });
    }
  }

  handleRemoveSourceEntityTypeFromAssociationType = (selectedEntityTypeFQN :FQN) => {

    const {
      actions,
      associationType,
      entityTypes,
      entityTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const associationEntityType :Map<*, *> = associationType.get('entityType', Map());
      const entityTypesIndex :number = entityTypesIndexMap.get(selectedEntityTypeFQN, -1);
      const entityTypeId :UUID = entityTypes.getIn([entityTypesIndex, 'id']);
      actions.localRemoveSrcEntityTypeFromAssociationType({
        entityTypeId,
        associationTypeFQN: FQN.of(associationEntityType.get('type')),
        associationTypeId: associationEntityType.get('id'),
      });
    }
  }

  renderEntityTypeDetails = () => {

    const { associationType, propertyTypes, propertyTypesIndexMap } = this.props;

    // TODO: consider refactoring this since it's basically a copy of EntityTypeDetailsContainer

    const associationEntityType :Map<*, *> = associationType.get('entityType', Map());

    const baseType :string = associationEntityType.get('baseType', '');

    const keyPropertyTypeIds :OrderedSet<string> = associationEntityType.get('key').toOrderedSet();
    const propertyTypeIds :OrderedSet<string> = associationEntityType.get('properties').toOrderedSet();

    const keyPropertyTypes :List<Map<*, *>> = keyPropertyTypeIds
      .map((propertyTypeId :string) => {
        const index :number = propertyTypesIndexMap.get(propertyTypeId, -1);
        if (index === -1) {
          return Map();
        }
        return propertyTypes.get(index, Map());
      })
      .toList();

    const thePropertyTypes :List<Map<*, *>> = propertyTypeIds
      .map((propertyTypeId :string) => {
        const index :number = propertyTypesIndexMap.get(propertyTypeId, -1);
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

    const { associationType, entityTypes, entityTypesIndexMap } = this.props;

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
        const index :number = entityTypesIndexMap.get(entityTypeId, -1);
        if (index === -1) {
          return Map();
        }
        return entityTypes.get(index, Map());
      });

    const destinationEntityTypes :List<Map<*, *>> = associationType.get('dst', List())
      .map((entityTypeId :string) => {
        const index :number = entityTypesIndexMap.get(entityTypeId, -1);
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
      </div>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) :Object => ({
  entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], List()),
  entityTypesIndexMap: state.getIn(['edm', 'entityTypes', 'entityTypesIndexMap'], Map()),
  propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], List()),
  propertyTypesIndexMap: state.getIn(['edm', 'propertyTypes', 'propertyTypesIndexMap'], Map()),
});

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    localAddDstEntityTypeToAssociationType: AssociationTypesActions.localAddDstEntityTypeToAssociationType,
    localAddPropertyTypeToAssociationType: AssociationTypesActions.localAddPropertyTypeToAssociationType,
    localAddSrcEntityTypeToAssociationType: AssociationTypesActions.localAddSrcEntityTypeToAssociationType,
    localRemoveDstEntityTypeFromAssociationType: AssociationTypesActions.localRemoveDstEntityTypeFromAssociationType,
    localRemovePropertyTypeFromAssociationType: AssociationTypesActions.localRemovePropertyTypeFromAssociationType,
    localRemoveSrcEntityTypeFromAssociationType: AssociationTypesActions.localRemoveSrcEntityTypeFromAssociationType,
  }, dispatch)
});

export default connect<*, *, *, *, *, *>(mapStateToProps, mapDispatchToProps)(AssociationTypeDetailsContainer);
