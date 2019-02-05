/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { FQN } from 'lattice';

import AbstractTypes from '../../utils/AbstractTypes';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import * as EntityTypesActions from './entitytypes/EntityTypesActions';
import * as PropertyTypesActions from './propertytypes/PropertyTypesActions';
import type { AbstractType } from '../../utils/AbstractTypes';

const { FullyQualifiedName } = Models;

const FIELD_TITLE :string = 'Type';

type Props = {
  abstractType :Map<*, *>;
  abstractTypeType :AbstractType;
  actions :{
    localUpdateEntityTypeMeta :RequestSequence;
    localUpdatePropertyTypeMeta :RequestSequence;
  };
};

type State = {};

class AbstractTypeFieldType extends React.Component<Props, State> {

  constructor(props :Props) {

    super(props);
    this.state = {};
  }

  handleOnChange = (typeValue :string) => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return;
    }

    const {
      abstractType,
      abstractTypeType,
      actions,
    } = this.props;

    let theAbstractType :Map<*, *> = abstractType;
    if (abstractTypeType === AbstractTypes.AssociationType) {
      theAbstractType = abstractType.get('entityType', Map());
    }

    const abstractTypeId :?UUID = theAbstractType.get('id');
    const abstractTypeFQN :FQN = new FullyQualifiedName(theAbstractType.get('type'));
    const abstractTypeMetaData :Object = { type: new FullyQualifiedName(typeValue) };

    switch (abstractTypeType) {
      case AbstractTypes.AssociationType:
        // actions.updateAssociationTypeMetaData({
        //   associationTypeId: abstractTypeId,
        //   metadata: abstractTypeMetaData
        // });
        break;
      case AbstractTypes.EntityType:
        actions.localUpdateEntityTypeMeta({
          entityTypeFQN: abstractTypeFQN,
          entityTypeId: abstractTypeId,
          metadata: abstractTypeMetaData
        });
        break;
      case AbstractTypes.PropertyType:
        actions.localUpdatePropertyTypeMeta({
          metadata: abstractTypeMetaData,
          propertyTypeFQN: abstractTypeFQN,
          propertyTypeId: abstractTypeId,
        });
        break;
      default:
        break;
    }
  }

  render() {

    const { abstractType, abstractTypeType } = this.props;

    let theAbstractType :Map<*, *> = abstractType;
    if (abstractTypeType === AbstractTypes.AssociationType) {
      theAbstractType = abstractType.get('entityType', Map());
    }

    return (
      <div>
        <h2>
          { FIELD_TITLE }
        </h2>
        <InlineEditableControl
            placeholder={`${FIELD_TITLE}...`}
            onChange={this.handleOnChange}
            type="text"
            validate={FullyQualifiedName.isValid}
            value={FullyQualifiedName.toString(theAbstractType.get('type'))}
            viewOnly={!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    localUpdateEntityTypeMeta: EntityTypesActions.localUpdateEntityTypeMeta,
    localUpdatePropertyTypeMeta: PropertyTypesActions.localUpdatePropertyTypeMeta,
  }, dispatch)
});

export default connect(null, mapDispatchToProps)(AbstractTypeFieldType);
