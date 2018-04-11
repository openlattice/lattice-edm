/*
 * @flow
 */

import React from 'react';

import { Map, List } from 'immutable';
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

    const entityTypesDataTable :React$Node = (
      <AbstractTypeDataTable
          abstractTypes={entityTypes}
          highlightOnHover
          maxHeight={500}
          workingAbstractTypeType={AbstractTypes.EntityTypes} />
    );

    return (
      <section>
        <h2>EntityTypes Utilizing this PropertyType</h2>
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
        { this.renderEntityTypesSection(this.props.entityTypes) }
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

function mapStateToProps(state :Map<*, *>, ownProps) :Object {
  const propertyTypeId = ownProps.propertyType.get('id');
  const entityTypes :OrderedSet<string> = state.getIn(['edm', 'entityTypes', 'entityTypes'], List())
    .toOrderedSet()
    .filter((entityType :Map<*, *>) => {
      return entityType.get('properties').includes(propertyTypeId);
    })
    .toList();
  return {
    entityTypes
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
