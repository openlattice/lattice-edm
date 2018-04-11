/*
 * @flow
 */

import React from 'react';

import Immutable, { Map, List } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import StyledButton from '../../../components/buttons/StyledButton';

const { deletePropertyType } = EntityDataModelApiActionFactory;

/*
 * styled components
 */

const DeleteButton = StyledButton.extend`
  align-self: center;
`;

/*
 * types
 */

type Props = {
  actions :{
    deletePropertyType :RequestSequence;
  };
  propertyType :Map<*, *>;
  entityTypes :List<Map<*, *>>;
  entityTypesById :Map<string, number>;
};

class PropertyTypeDetailsContainer extends React.Component<Props> {

  handleOnClickDelete = () => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      this.props.actions.deletePropertyType(this.props.propertyType.get('id'));
    }
  }

  renderEntityTypesSection = (entityTypes :List<Map<*, *>>) => {

    if (entityTypes.isEmpty()) {
      return null;
    }

    let entityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={entityTypes}
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityTypes} />
    );

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      entityTypesDataTable = (
        <AbstractTypeDataTable
            abstractTypes={entityTypes}
            highlightOnHover
            maxHeight={500}
            onAbstractTypeRemove={this.handleOnEntityTypeRemove}
            onReorder={this.handleOnEntityTypeReorder}
            orderable
            showRemoveColumn
            workingAbstractTypeType={AbstractTypes.EntityType} />
      );
    }

    return (
      <section>
        <h2>EntityTypes</h2>
        { entityTypesDataTable }
      </section>
    );
  }

  render() {

    if (!this.props.propertyType || this.props.propertyType.isEmpty()) {
      return null;
    }
    const ptPII :boolean = this.props.propertyType.get('piiField', false);
    const piiAsString :string = ptPII === true ? 'true' : 'false';
    // This gathers ALL entityTypes from the EDM
    const entityTypeIds :OrderedSet<string> = this.props.entityTypes.toOrderedSet();
    const propertyTypeId = this.props.propertyType.get('id');
    let matchedEntityTypeIds :OrderedSet<string> = new Set([]);

    // This does a lookup in all entitySets to check if it utilizes the propertyType
    // Way too time intensive? Couldn't think of another way with existing API
    entityTypeIds
      .forEach((entityType) => {
        if (entityType.get('properties').includes(propertyTypeId)) {
          matchedEntityTypeIds.add(entityType.get('id'));
        }
      });

    // Following code requires an immutable set, so it is converted
    matchedEntityTypeIds = Immutable.Set(matchedEntityTypeIds);

    const entityTypes :List<Map<*, *>> = matchedEntityTypeIds
      .map((matchedEntityTypeId :string) => {
        const index :number = this.props.entityTypesById.get(matchedEntityTypeId, -1);
        if (index === -1) {
          return Map();
        }
        return this.props.entityTypes.get(index, Map());
      })
      .toList();
    // console.log(this.props.entityTypesById);
    // console.log(entityTypes);

    return (
      <div>
        <h1>PropertyType Details</h1>
        <section>
          <h2>ID</h2>
          <p>{ this.props.propertyType.get('id') }</p>
        </section>
        <section>
          <AbstractTypeFieldType
              abstractType={this.props.propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <AbstractTypeFieldTitle
              abstractType={this.props.propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <AbstractTypeFieldDescription
              abstractType={this.props.propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <h2>DataType</h2>
          <p>{ this.props.propertyType.get('datatype') }</p>
        </section>
        <section>
          <h2>PII</h2>
          <p>{ piiAsString }</p>
        </section>
        <section>
          <h2>Analyzer</h2>
          <p>{ this.props.propertyType.get('analyzer') }</p>
        </section>
        { this.renderEntityTypesSection(entityTypes) }
        {
          AuthUtils.isAuthenticated() && AuthUtils.isAdmin()
            ? (
              <section>
                <DeleteButton onClick={this.handleOnClickDelete}>Delete PropertyType</DeleteButton>
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
    entityTypesById: state.getIn(['edm', 'entityTypes', 'entityTypesById'], Map())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    deletePropertyType
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyTypeDetailsContainer);
