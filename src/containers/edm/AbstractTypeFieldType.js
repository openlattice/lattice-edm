/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Models } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AbstractTypes from '../../utils/AbstractTypes';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import * as PropertyTypesActions from './propertytypes/PropertyTypesActions';
import type { AbstractType } from '../../utils/AbstractTypes';

const {
  updateAssociationTypeMetaData,
  updateEntityTypeMetaData,
} = EntityDataModelApiActions;

const { FullyQualifiedName } = Models;

/*
 * constants
 */

const FIELD_TITLE :string = 'Type';

/*
 * types
 */

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
};

type State = {};

class AbstractTypeFieldType extends React.Component<Props, State> {

  static defaultProps = {
    abstractType: Map(),
    abstractTypeType: AbstractTypes.PropertyType,
    onChange: () => {},
    onEditToggle: () => {},
  }

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
      onChange,
    } = this.props;

    let theAbstractType :Map<*, *> = abstractType;
    if (abstractTypeType === AbstractTypes.AssociationType) {
      theAbstractType = abstractType.get('entityType', Map());
    }

    const abstractTypeFQN :FQN = theAbstractType.get('type');
    const abstractTypeId :?UUID = theAbstractType.get('id');
    const abstractTypeMetaData :Object = { type: new FullyQualifiedName(typeValue) };

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

    onChange(typeValue);
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

    const abstractTypeFQN :FQN = theAbstractType.get('type');

    return (
      <div>
        <h2>
          { FIELD_TITLE }
        </h2>
        <InlineEditableControl
            type="text"
            placeholder={`${FIELD_TITLE}...`}
            value={abstractTypeFQN.toString()}
            onChange={this.handleOnChange}
            onEditToggle={this.handleOnEditToggle}
            validate={FullyQualifiedName.isValid}
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
export default connect(null, mapDispatchToProps)(AbstractTypeFieldType);
