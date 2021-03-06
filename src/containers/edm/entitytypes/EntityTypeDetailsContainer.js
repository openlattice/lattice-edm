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

import * as EntityTypesActions from './EntityTypesActions';

import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';
import AbstractTypes from '../../../utils/AbstractTypes';
import Logger from '../../../utils/Logger';
import { isValidUUID } from '../../../utils/ValidationUtils';
import type { IndexMap } from '../Types';

const LOG :Logger = new Logger('EntityTypeDetailsContainer');

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
    localAddPropertyTypeToEntityType :RequestSequence;
    localRemovePropertyTypeFromEntityType :RequestSequence;
  };
  entityType :Map<*, *>;
  propertyTypes :List<Map<*, *>>;
  propertyTypesIndexMap :IndexMap;
}

class EntityTypeDetailsContainer extends React.Component<Props> {

  handleOnPropertyTypeAdd = (selectedPropertyTypeFQN :FQN) => {

    const {
      actions,
      entityType,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const propertyTypesIndex :number = propertyTypesIndexMap.get(selectedPropertyTypeFQN, -1);
      const propertyTypeId :?UUID = propertyTypes.getIn([propertyTypesIndex, 'id']);
      if (!isValidUUID(propertyTypeId)) {
        const errorMsg = 'PropertyType id must be a valid UUID, otherwise it cannot be added to an EntityType';
        LOG.error(errorMsg, propertyTypeId);
        return;
      }
      actions.localAddPropertyTypeToEntityType({
        propertyTypeId,
        entityTypeFQN: FQN.of(entityType.get('type')),
        entityTypeId: entityType.get('id'),
      });
    }
  }

  handleOnPropertyTypeRemove = (removedPropertyTypeFQN :FQN) => {

    const {
      actions,
      entityType,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const propertyTypesIndex :number = propertyTypesIndexMap.get(removedPropertyTypeFQN, -1);
      const propertyTypeId :?UUID = propertyTypes.getIn([propertyTypesIndex, 'id']);
      actions.localRemovePropertyTypeFromEntityType({
        propertyTypeId,
        entityTypeFQN: FQN.of(entityType.get('type')),
        entityTypeId: entityType.get('id'),
      });
    }
  }

  renderPropertyTypesSection = (propertyTypes :List<Map<*, *>>) => {

    if (propertyTypes.isEmpty()) {
      return null;
    }

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
            onAbstractTypeRemove={this.handleOnPropertyTypeRemove}
            showRemoveColumn
            workingAbstractTypeType={AbstractTypes.PropertyType} />
      );
    }

    return (
      <section>
        <h2>
          PropertyTypes
        </h2>
        { propertyTypesDataTable }
      </section>
    );
  }

  renderAddPropertyTypesSection = () => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return null;
    }

    const { entityType, propertyTypes } = this.props;

    const availablePropertyTypes :List<Map<*, *>> = propertyTypes
      .filterNot((propertyType :Map<*, *>) => {
        const propertyTypeIds :List<string> = entityType.get('properties', List());
        return propertyTypeIds.includes(propertyType.get('id', ''));
      });

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
              onAbstractTypeSelect={this.handleOnPropertyTypeAdd} />
        </AbstractTypeSearchableSelectWrapper>
      </section>
    );
  }

  render() {

    const { entityType, propertyTypes, propertyTypesIndexMap } = this.props;

    if (!entityType || entityType.isEmpty()) {
      return null;
    }

    const baseType :string = entityType.get('baseType', '');

    const keyPropertyTypeIds :OrderedSet<string> = entityType.get('key', List()).toOrderedSet();
    const propertyTypeIds :OrderedSet<string> = entityType.get('properties', List()).toOrderedSet();

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

    return (
      <div>
        <h1>
          EntityType Details
        </h1>
        <section>
          <h2>
            ID
          </h2>
          <p>
            { entityType.get('id') }
          </p>
        </section>
        <section>
          <AbstractTypeFieldType
              abstractType={entityType}
              abstractTypeType={AbstractTypes.EntityType} />
        </section>
        <section>
          <AbstractTypeFieldTitle
              abstractType={entityType}
              abstractTypeType={AbstractTypes.EntityType} />
        </section>
        <section>
          <AbstractTypeFieldDescription
              abstractType={entityType}
              abstractTypeType={AbstractTypes.EntityType} />
        </section>
        {
          !baseType
            ? null
            : (
              <section>
                <h2>
                  BaseType
                </h2>
                <p>
                  { entityType.get('baseType') }
                </p>
              </section>
            )
        }
        <section>
          <h2>
            Category
          </h2>
          <p>
            { entityType.get('category') }
          </p>
        </section>
        <section>
          <h2>
            Primary Key PropertyTypes
          </h2>
          <AbstractTypeDataTable
              abstractTypes={keyPropertyTypes}
              maxHeight={500}
              workingAbstractTypeType={AbstractTypes.PropertyType} />
        </section>
        { this.renderPropertyTypesSection(thePropertyTypes) }
        { this.renderAddPropertyTypesSection() }
      </div>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) :Object => ({
  propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], List()),
  propertyTypesIndexMap: state.getIn(['edm', 'propertyTypes', 'propertyTypesIndexMap'], Map()),
});

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    localAddPropertyTypeToEntityType: EntityTypesActions.localAddPropertyTypeToEntityType,
    localRemovePropertyTypeFromEntityType: EntityTypesActions.localRemovePropertyTypeFromEntityType,
  }, dispatch)
});

export default connect<*, *, *, *, *, *>(mapStateToProps, mapDispatchToProps)(EntityTypeDetailsContainer);
