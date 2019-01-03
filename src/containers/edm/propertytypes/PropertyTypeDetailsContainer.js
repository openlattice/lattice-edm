/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map, List } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../../components/datatable/AbstractTypeDataTable';
import AbstractTypeFieldDescription from '../AbstractTypeFieldDescription';
import AbstractTypeFieldTitle from '../AbstractTypeFieldTitle';
import AbstractTypeFieldType from '../AbstractTypeFieldType';
import StyledButton from '../../../components/buttons/StyledButton';
import * as PropertyTypesActions from './PropertyTypesActions';
import { isValidUUID } from '../../../utils/ValidationUtils';

/*
 * styled components
 */

const DeleteButton = styled(StyledButton)`
  align-self: center;
`;

/*
 * types
 */

type Props = {
  actions :{
    localDeletePropertyType :RequestSequence;
  };
  entityTypes :List<Map<*, *>>;
  propertyType :Map<*, *>;
};

class PropertyTypeDetailsContainer extends React.Component<Props> {

  handleOnClickDelete = () => {

    const { actions, propertyType } = this.props;

    if (AuthUtils.isAuthenticated() && AuthUtils.isAdmin()) {
      const propertyTypeId :?UUID = propertyType.get('id');
      if (isValidUUID(propertyTypeId)) {
        actions.localDeletePropertyType(propertyTypeId);
      }
      else {
        const propertyTypeFQN :FQN = propertyType.get('type');
        actions.localDeletePropertyType(propertyTypeFQN);
      }
    }
  }

  renderEntityTypesSection = () => {

    const { entityTypes } = this.props;
    if (!entityTypes || entityTypes.isEmpty()) {
      return null;
    }

    return (
      <section>
        <h2>
          EntityTypes Utilizing this PropertyType
        </h2>
        <AbstractTypeDataTable
            abstractTypes={entityTypes}
            highlightOnHover
            maxHeight={500}
            workingAbstractTypeType={AbstractTypes.EntityType} />
      </section>
    );
  }

  render() {

    const { propertyType } = this.props;
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
        { this.renderEntityTypesSection() }
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

const mapStateToProps = (state :Map<*, *>, props :Object) :Object => {

  const propertyTypeId :?UUID = props.propertyType.get('id');
  const entityTypes :List<Map<*, *>> = state.getIn(['edm', 'entityTypes', 'entityTypes'], List())
    .filter((entityType :Map<*, *>) => entityType.get('properties').includes(propertyTypeId));

  return {
    entityTypes,
  };
};

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators(
    {
      localDeletePropertyType: PropertyTypesActions.localDeletePropertyType,
    },
    dispatch
  )
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PropertyTypeDetailsContainer);
