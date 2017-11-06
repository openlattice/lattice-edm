/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { Models } from 'lattice';
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

const { FullyQualifiedName } = Models;

/*
 * constants
 */

const FIELD_TITLE :string = 'Type';

/*
 * types
 */

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
  isInEditMode :boolean
}

class AbstractTypeFieldType extends React.Component<Props, State> {

  static defaultProps = {
    abstractType: Immutable.Map(),
    abstractTypeType: AbstractTypes.PropertyType,
    onChange: () => {},
    onEditToggle: () => {}
  }

  constructor(props :Props) {

    super(props);

    this.state = {
      isInEditMode: false
    };
  }

  handleOnChange = (typeValue :string) => {

    if (!AuthUtils.isAuthenticated() || !AuthUtils.isAdmin()) {
      return;
    }

    let abstractType :Map<*, *> = this.props.abstractType;
    if (this.props.abstractTypeType === AbstractTypes.AssociationType) {
      abstractType = this.props.abstractType.get('entityType', Immutable.Map());
    }

    if (isValidUuid(abstractType.get('id', ''))) {

      const abstractTypeId :string = abstractType.get('id', '');
      const metadata :Object = { type: new FullyQualifiedName(typeValue) };

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

    this.props.onChange(typeValue);
  }

  handleOnEditToggle = (isInEditMode :boolean) => {

    this.props.onEditToggle(isInEditMode);
    this.setState({
      isInEditMode
    });
  }

  render() {

    let abstractType :Map<*, *> = this.props.abstractType;
    if (this.props.abstractTypeType === AbstractTypes.AssociationType) {
      abstractType = this.props.abstractType.get('entityType', Immutable.Map());
    }

    const abstractTypeFqn :Map<string, string> = abstractType.get('type', Immutable.Map());

    return (
      <div>
        <h2>{ FIELD_TITLE }</h2>
        <InlineEditableControl
            type="text"
            placeholder={`${FIELD_TITLE}...`}
            value={FullyQualifiedName.toString(abstractTypeFqn)}
            onChange={this.handleOnChange}
            onEditToggle={this.handleOnEditToggle}
            validate={FullyQualifiedName.isValid}
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

export default connect(null, mapDispatchToProps)(AbstractTypeFieldType);
