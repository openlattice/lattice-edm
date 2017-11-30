/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { EntityDataModelApiActionFactory } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import InlineEditableControl from '../../components/controls/InlineEditableControl';

import * as AuthUtils from '../../core/auth/AuthUtils';
import { isValidUuid } from '../../utils/Utils';

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
    abstractType: Immutable.Map(),
    abstractTypeType: AbstractTypes.PropertyType,
    onChange: () => {},
    onEditToggle: () => {}
  }

  handleOnChange = (titleValue :string) => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return;
    }

    let abstractType :Map<*, *> = this.props.abstractType;
    if (this.props.abstractTypeType === AbstractTypes.AssociationType) {
      abstractType = this.props.abstractType.get('entityType', Immutable.Map());
    }

    if (isValidUuid(abstractType.get('id'))) {

      const abstractTypeId :string = abstractType.get('id', '');
      const abstractTypeMetaData :Object = { title: titleValue };

      switch (this.props.abstractTypeType) {
        case AbstractTypes.AssociationType:
          this.props.actions.updateAssociationTypeMetaData({
            id: abstractTypeId,
            metadata: abstractTypeMetaData
          });
          break;
        case AbstractTypes.EntityType:
          this.props.actions.updateEntityTypeMetaData({
            id: abstractTypeId,
            metadata: abstractTypeMetaData
          });
          break;
        case AbstractTypes.PropertyType:
          this.props.actions.updatePropertyTypeMetaData({
            id: abstractTypeId,
            metadata: abstractTypeMetaData
          });
          break;
        default:
          break;
      }
    }

    this.props.onChange(titleValue);
  }

  handleOnEditToggle = (isInEditMode :boolean) => {

    this.props.onEditToggle(isInEditMode);
  }

  render() {

    let abstractType :Map<*, *> = this.props.abstractType;
    if (this.props.abstractTypeType === AbstractTypes.AssociationType) {
      abstractType = this.props.abstractType.get('entityType', Immutable.Map());
    }

    return (
      <div>
        <h2>{ FIELD_TITLE }</h2>
        <InlineEditableControl
            type="text"
            placeholder={`${FIELD_TITLE}...`}
            value={abstractType.get('title')}
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
