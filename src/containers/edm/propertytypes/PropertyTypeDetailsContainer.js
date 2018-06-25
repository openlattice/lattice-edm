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

    const { actions, propertyType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      actions.deletePropertyType(propertyType.get('id'));
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
          workingAbstractTypeType={AbstractTypes.EntityType} />
    );

    return (
      <section>
        <h2>
          EntityTypes Utilizing this PropertyType
        </h2>
        { entityTypesDataTable }
      </section>
    );
  }

  render() {

    const { entityTypes, propertyType } = this.props;

    if (!propertyType || propertyType.isEmpty()) {
      return null;
    }

    const ptPII :boolean = propertyType.get('piiField', false);
    const piiAsString :string = ptPII === true ? 'true' : 'false';

    return (
      <div>
        <h1>
          PropertyType Details
        </h1>
        <section>
          <h2>
            ID
          </h2>
          <p>
            { propertyType.get('id') }
          </p>
        </section>
        <section>
          <AbstractTypeFieldType
              abstractType={propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <AbstractTypeFieldTitle
              abstractType={propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <AbstractTypeFieldDescription
              abstractType={propertyType}
              abstractTypeType={AbstractTypes.PropertyType} />
        </section>
        <section>
          <h2>
            DataType
          </h2>
          <p>
            { propertyType.get('datatype') }
          </p>
        </section>
        <section>
          <h2>
            PII
          </h2>
          <p>
            { piiAsString }
          </p>
        </section>
        <section>
          <h2>
            Analyzer
          </h2>
          <p>
            { propertyType.get('analyzer') }
          </p>
        </section>
        { this.renderEntityTypesSection(entityTypes) }
        {
          AuthUtils.isAuthenticated() && AuthUtils.isAdmin()
            ? (
              <section>
                <DeleteButton onClick={this.handleOnClickDelete}>
                  Delete PropertyType
                </DeleteButton>
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
  const entityTypes :List<string> = state.getIn(['edm', 'entityTypes', 'entityTypes'], List())
    .filter((entityType :Map<*, *>) => entityType.get('properties').includes(propertyTypeId));
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
