/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map, OrderedSet } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { FQN } from 'lattice';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import AbstractTypeSearchableSelect from '../../../components/controls/AbstractTypeSearchableSelect';
import StyledButton from '../../../components/buttons/StyledButton';
import * as EntityTypesActions from './EntityTypesActions';
import type { IndexMap } from '../Types';

const { FullyQualifiedName } = Models;

/*
 * styled components
 */

const DeleteButton = styled(StyledButton)`
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
    localDeleteEntityType :RequestSequence;
  };
  entityType :Map<*, *>;
  propertyTypes :List<Map<*, *>>;
  propertyTypesIndexMap :IndexMap;
}

class EntityTypeDetailsContainer extends React.Component<Props> {

  handleOnPropertyTypeAdd = (selectedPropertyTypeId :string) => {

    const { actions, entityType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      actions.addPropertyTypeToEntityType({
        entityTypeId: entityType.get('id'),
        propertyTypeId: selectedPropertyTypeId
      });
    }
  }

  handleOnPropertyTypeRemove = (removedAbstractTypeId :string) => {

    const { actions, entityType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      actions.removePropertyTypeFromEntityType({
        entityTypeId: entityType.get('id'),
        propertyTypeId: removedAbstractTypeId
      });
    }
  }

  handleOnPropertyTypeReorder = (oldIndex :number, newIndex :number) => {

    const { actions, entityType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {

      const propertyTypeIds :List<string> = entityType.get('properties');
      const idToMove :string = propertyTypeIds.get(oldIndex);
      const reorderedPropertyTypeIds :List<string> = propertyTypeIds.delete(oldIndex).insert(newIndex, idToMove);

      actions.reorderEntityTypePropertyTypes({
        entityTypeId: entityType.get('id'),
        propertyTypeIds: reorderedPropertyTypeIds.toJS()
      });
    }
  }

  handleOnClickDelete = () => {

    const { actions, entityType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const entityTypeId :?UUID = entityType.get('id');
      const entityTypeFQN :FQN = new FullyQualifiedName(entityType.get('type'));
      actions.localDeleteEntityType({ entityTypeFQN, entityTypeId });
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
            onReorder={this.handleOnPropertyTypeReorder}
            orderable
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
        {
          AuthUtils.isAuthenticated() && AuthUtils.isAdmin()
            ? (
              <section>
                <DeleteButton onClick={this.handleOnClickDelete}>
                  Delete EntityType
                </DeleteButton>
              </section>
            )
            : null
        }
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
    localDeleteEntityType: EntityTypesActions.localDeleteEntityType,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EntityTypeDetailsContainer);
