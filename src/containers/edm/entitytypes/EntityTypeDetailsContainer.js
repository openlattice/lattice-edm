/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { Models } from 'lattice';
import { connect } from 'react-redux';

import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypes from '../../../utils/AbstractTypes';

const { FullyQualifiedName } = Models;

/*
 * types
 */

type Props = {
  entityType :Map<*, *>,
  propertyTypesById :Map<string, Map<*, *>>
}

class EntityTypeDetailsContainer extends React.Component<Props> {

  render() {

    if (!this.props.entityType || this.props.entityType.isEmpty()) {
      return null;
    }

    const baseType :string = this.props.entityType.get('baseType', '');

    const keyProperties :Set<string> = this.props.entityType.get('key', Immutable.List()).toSet();
    const properties :Set<string> = this.props.entityType.get('properties', Immutable.List()).toSet();

    const keyPropertyTypes :List<Map<*, *>> = keyProperties
      .map((propertyTypeId :string) => {
        return this.props.propertyTypesById.get(propertyTypeId, Immutable.Map());
      })
      .toList();

    const propertyTypes :List<Map<*, *>> = properties.subtract(keyProperties)
      .map((propertyTypeId :string) => {
        return this.props.propertyTypesById.get(propertyTypeId, Immutable.Map());
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
          <h2>Type</h2>
          <p>{ FullyQualifiedName.toString(this.props.entityType.get('type', {})) }</p>
        </section>
        <section>
          <h2>Title</h2>
          <p>{ this.props.entityType.get('title') }</p>
        </section>
        <section>
          <h2>Description</h2>
          <p>{ this.props.entityType.get('description') }</p>
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
              type={AbstractTypes.PropertyType} />
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
                    type={AbstractTypes.PropertyType} />
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
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Immutable.List())
  };
}

export default connect(mapStateToProps)(EntityTypeDetailsContainer);
