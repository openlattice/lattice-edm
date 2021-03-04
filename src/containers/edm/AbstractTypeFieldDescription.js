/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import * as AssociationTypesActions from './associationtypes/AssociationTypesActions';
import * as EntityTypesActions from './entitytypes/EntityTypesActions';
import * as PropertyTypesActions from './propertytypes/PropertyTypesActions';

import AbstractTypes from '../../utils/AbstractTypes';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import type { AbstractType } from '../../utils/AbstractTypes';

const { FQN } = Models;

const FIELD_TITLE :string = 'Description';

type Props = {
  abstractType :Map<*, *>;
  abstractTypeType :AbstractType;
  actions :{
    localUpdateAssociationTypeMeta :RequestSequence;
    localUpdateEntityTypeMeta :RequestSequence;
    localUpdatePropertyTypeMeta :RequestSequence;
  };
};

type State = {};

class AbstractTypeFieldDescription extends React.Component<Props, State> {

  handleOnChange = (descriptionValue :string) => {

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
    const abstractTypeFQN :FQN = FQN.of(theAbstractType.get('type'));
    const abstractTypeMetaData :Object = { description: descriptionValue };

    switch (abstractTypeType) {
      case AbstractTypes.AssociationType:
        actions.localUpdateAssociationTypeMeta({
          associationTypeFQN: abstractTypeFQN,
          associationTypeId: abstractTypeId,
          metadata: abstractTypeMetaData
        });
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
            type="textarea"
            placeholder={`${FIELD_TITLE}...`}
            value={theAbstractType.get('description')}
            onChange={this.handleOnChange}
            viewOnly={!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    localUpdateAssociationTypeMeta: AssociationTypesActions.localUpdateAssociationTypeMeta,
    localUpdateEntityTypeMeta: EntityTypesActions.localUpdateEntityTypeMeta,
    localUpdatePropertyTypeMeta: PropertyTypesActions.localUpdatePropertyTypeMeta,
  }, dispatch)
});

export default connect<*, *, *, *, *, *>(null, mapDispatchToProps)(AbstractTypeFieldDescription);
