/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { FQN } from 'lattice';

import AbstractTypes from '../../utils/AbstractTypes';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import * as PropertyTypesActions from './propertytypes/PropertyTypesActions';
import { isValidUUID } from '../../utils/ValidationUtils';

import type { AbstractType } from '../../utils/AbstractTypes';

const {
  updateAssociationTypeMetaData,
  updateEntityTypeMetaData,
} = EntityDataModelApiActionFactory;

const { FullyQualifiedName } = Models;

const FIELD_TITLE :string = 'Title';

type Props = {
  abstractType :Map<*, *>;
  abstractTypeType :AbstractType;
  actions :{
    localUpdatePropertyTypeMeta :RequestSequence;
    updateAssociationTypeMetaData :RequestSequence;
    updateEntityTypeMetaData :RequestSequence;
  };
  onChange :Function;
  onEditToggle :Function;
}

type State = {};

class AbstractTypeFieldTitle extends React.Component<Props, State> {

  static defaultProps = {
    abstractType: Map(),
    abstractTypeType: AbstractTypes.PropertyType,
    onChange: () => {},
    onEditToggle: () => {}
  }

  handleOnChange = (titleValue :string) => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return;
    }

    const {
      abstractType,
      abstractTypeType,
      actions,
      onChange,
    } = this.props;

    let theAbstractType :Map<*, *> = abstractType;
    if (abstractTypeType === AbstractTypes.AssociationType) {
      theAbstractType = abstractType.get('entityType', Map());
    }

    const abstractTypeId :?UUID = theAbstractType.get('id');
    const abstractTypeFQN :FQN = new FullyQualifiedName(theAbstractType.get('type'));
    const abstractTypeMetaData :Object = { title: titleValue };

    switch (abstractTypeType) {
      case AbstractTypes.AssociationType:
        actions.updateAssociationTypeMetaData({
          associationTypeId: abstractTypeId,
          metadata: abstractTypeMetaData
        });
        break;
      case AbstractTypes.EntityType:
        actions.updateEntityTypeMetaData({
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

    onChange(titleValue);
  }

  handleOnEditToggle = (isInEditMode :boolean) => {

    const { onEditToggle } = this.props;
    onEditToggle(isInEditMode);
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
            onEditToggle={this.handleOnEditToggle}
            type="text"
            value={theAbstractType.get('title')}
            viewOnly={!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    updateAssociationTypeMetaData,
    updateEntityTypeMetaData,
    localUpdatePropertyTypeMeta: PropertyTypesActions.localUpdatePropertyTypeMeta,
  }, dispatch)
});

// $FlowFixMe: Missing type annotation for CP
export default connect(null, mapDispatchToProps)(AbstractTypeFieldTitle);
