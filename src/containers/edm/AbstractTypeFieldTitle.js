/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import { isValidUUID } from '../../utils/ValidationUtils';

import type { AbstractType } from '../../utils/AbstractTypes';

const {
  updateAssociationTypeMetaData,
  updateEntityTypeMetaData,
  updatePropertyTypeMetaData
} = EntityDataModelApiActionFactory;

const FIELD_TITLE :string = 'Title';

type Props = {
  abstractType :Map<*, *>;
  actions :{
    updateAssociationTypeMetaData :RequestSequence;
    updateEntityTypeMetaData :RequestSequence;
    updatePropertyTypeMetaData :RequestSequence;
  };
  abstractTypeType :AbstractType;
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
      onChange
    } = this.props;

    let theAbstractType :Map<*, *> = abstractType;
    if (abstractTypeType === AbstractTypes.AssociationType) {
      theAbstractType = abstractType.get('entityType', Map());
    }

    if (isValidUUID(theAbstractType.get('id'))) {

      const abstractTypeId :string = theAbstractType.get('id', '');
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
          actions.updatePropertyTypeMetaData({
            propertyTypeId: abstractTypeId,
            metadata: abstractTypeMetaData
          });
          break;
        default:
          break;
      }
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
            type="text"
            placeholder={`${FIELD_TITLE}...`}
            value={theAbstractType.get('title')}
            onChange={this.handleOnChange}
            onEditToggle={this.handleOnEditToggle}
            viewOnly={!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    updateAssociationTypeMetaData,
    updateEntityTypeMetaData,
    updatePropertyTypeMetaData
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(AbstractTypeFieldTitle);
