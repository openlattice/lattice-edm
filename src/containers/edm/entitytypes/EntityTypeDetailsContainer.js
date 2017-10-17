/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';

/*
 * types
 */

type Props = {
  entityType :Map<*, *>,
  propertyTypes :List<Map<*, *>>,
  propertyTypesById :Map<string, number>
}

class EntityTypeDetailsContainer extends React.Component<Props> {

  render() {

    if (!this.props.entityType || this.props.entityType.isEmpty()) {
      return null;
    }

    const baseType :string = this.props.entityType.get('baseType', '');

    const keyPropertyTypeIds :Set<string> = this.props.entityType.get('key', Immutable.List()).toSet();
    const propertyTypeIds :Set<string> = this.props.entityType.get('properties', Immutable.List()).toSet();

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
      <div>
        <h1>EntityType Details</h1>
        <section>
          <h2>ID</h2>
          <p>{ this.props.entityType.get('id') }</p>
        </section>
        <section>
          <AbstractTypeFieldType
              abstractType={this.props.entityType}
              abstractTypeType={AbstractTypes.EntityType} />
        </section>
        <section>
          <AbstractTypeFieldTitle
              abstractType={this.props.entityType}
              abstractTypeType={AbstractTypes.EntityType} />
        </section>
        <section>
          <AbstractTypeFieldDescription
              abstractType={this.props.entityType}
              abstractTypeType={AbstractTypes.EntityType} />
        </section>
        {
          !baseType
            ? null
            : (
              <section>
                <h2>BaseType</h2>
                <p>{ this.props.entityType.get('baseType') }</p>
              </section>
            )
        }
        <section>
          <h2>Category</h2>
          <p>{ this.props.entityType.get('category') }</p>
        </section>
        <section>
          <h2>Primary Key PropertyTypes</h2>
          <AbstractTypeDataTable
              abstractTypes={keyPropertyTypes}
              maxHeight={500}
              workingAbstractTypeType={AbstractTypes.PropertyType} />
        </section>
        {
          propertyTypes.isEmpty()
            ? null
            : (
              <section>
                <h2>PropertyTypes</h2>
                <AbstractTypeDataTable
                    abstractTypes={propertyTypes}
                    maxHeight={500}
                    workingAbstractTypeType={AbstractTypes.PropertyType} />
              </section>
            )
        }
        <section>
          <h2>Schemas</h2>
          <p>TODO</p>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], Immutable.List()),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Immutable.Map())
  };
}

export default connect(mapStateToProps)(EntityTypeDetailsContainer);
