/*
 * @flow
 */

import React from 'react';

import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import StyledButton from '../../../components/buttons/StyledButton';
import * as AuthUtils from '../../../core/auth/AuthUtils';

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
};

class PropertyTypeDetailsContainer extends React.Component<Props> {

  handleOnClickDelete = () => {

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      this.props.actions.deletePropertyType(this.props.propertyType.get('id'));
    }
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

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    deletePropertyType
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(PropertyTypeDetailsContainer);
