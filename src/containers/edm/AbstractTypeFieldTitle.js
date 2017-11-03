/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import InlineEditableControl from '../../components/controls/InlineEditableControl';

import * as AuthUtils from '../../core/auth/AuthUtils';
import { isValidUuid } from '../../utils/Utils';
import { updateAssociationTypeMetaDataRequest } from './associationtypes/AssociationTypesActionFactory';
import { updateEntityTypeMetaDataRequest } from './entitytypes/EntityTypesActionFactory';
import { updatePropertyTypeMetaDataRequest } from './propertytypes/PropertyTypesActionFactory';

import type { AbstractType } from '../../utils/AbstractTypes';

const FIELD_TITLE :string = 'Title';

type Props = {
  abstractType :Map<*, *>,
  actions :{
    updateAssociationTypeMetaDataRequest :Function,
    updateEntityTypeMetaDataRequest :Function,
    updatePropertyTypeMetaDataRequest :Function
  },
  abstractTypeType :AbstractType,
  onChange :Function,
  onEditToggle :Function
}

type State = {

}

class AbstractTypeFieldTitle extends React.Component<Props, State> {

  static defaultProps = {
    abstractType: Immutable.Map(),
    abstractTypeType: AbstractTypes.PropertyType,
    onChange: () => {},
    onEditToggle: () => {}
  }

  handleOnChange = (titleValue :string) => {

    let abstractType :Map<*, *> = this.props.abstractType;
    if (this.props.abstractTypeType === AbstractTypes.AssociationType) {
      abstractType = this.props.abstractType.get('entityType', Immutable.Map());
    }

    if (isValidUuid(abstractType.get('id'))) {

      const abstractTypeId :string = abstractType.get('id', '');
      const metadata :Object = { title: titleValue };

      switch (this.props.abstractTypeType) {
        case AbstractTypes.AssociationType:
          this.props.actions.updateAssociationTypeMetaDataRequest(abstractTypeId, metadata);
          break;
        case AbstractTypes.EntityType:
          this.props.actions.updateEntityTypeMetaDataRequest(abstractTypeId, metadata);
          break;
        case AbstractTypes.PropertyType:
          this.props.actions.updatePropertyTypeMetaDataRequest(abstractTypeId, metadata);
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
    updateAssociationTypeMetaDataRequest,
    updateEntityTypeMetaDataRequest,
    updatePropertyTypeMetaDataRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(AbstractTypeFieldTitle);
