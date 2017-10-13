/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { Models } from 'lattice';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractDataTable from './AbstractDataTable';
import type { AbstractType } from '../../utils/AbstractTypes';

const { FullyQualifiedName } = Models;

/*
 * constants
 */

const TITLE_HEADER_ID :string = 'title';
const TITLE_HEADER :Map<string, string> = Immutable.fromJS({ id: TITLE_HEADER_ID, value: 'Title' });

const TYPE_HEADER_ID :string = 'type';
const TYPE_HEADER :Map<string, string> = Immutable.fromJS({ id: TYPE_HEADER_ID, value: 'FQN' });

const HEADERS_MAP :Map<string, Map<string, string>> = Immutable.fromJS({
  [TITLE_HEADER_ID]: TITLE_HEADER,
  [TYPE_HEADER_ID]: TYPE_HEADER
});

const DEFAULT_HEADERS :List<Map<string, string>> = Immutable.fromJS([
  TYPE_HEADER,
  TITLE_HEADER
]);

/*
 * types
 */

type Props = {
  abstractTypes :List<Map<*, *>>,
  headerIds :List<string>,
  maxHeight :number,
  type :AbstractType,
  onAbstractTypeSelect :Function
}

// TODO: extend AbstractDataTable, pass props
class AbstractTypeDataTable extends React.Component<Props> {

  static defaultProps = {
    abstractTypes: Immutable.List(),
    headerIds: Immutable.List(),
    type: AbstractTypes.PropertyType,
    onAbstractTypeSelect: () => {}
  }

  render() {

    if (this.props.abstractTypes.isEmpty()) {
      return null;
    }

    let headers :List<Map<string, string>> = DEFAULT_HEADERS;
    if (!this.props.headerIds.isEmpty()) {
      headers = this.props.headerIds.map((headerId :string) => {
        return HEADERS_MAP.get(headerId, Immutable.Map());
      });
    }

    const data :List<Map<string, string>> = this.props.abstractTypes.map((type :Map<*, *>) => {

      const abstractType :Map<*, *> = (this.props.type === AbstractTypes.AssociationType)
        ? type.get('entityType', Immutable.Map())
        : type;

      const abstractTypeType :Map<string, string> = abstractType.get('type', Immutable.Map());
      const abstractTypeFqn :string = FullyQualifiedName.toString(abstractTypeType);
      const abstractTypeTitle :string = abstractType.get('title', '');

      return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        map.set(TYPE_HEADER_ID, abstractTypeFqn);
        map.set(TITLE_HEADER_ID, abstractTypeTitle);
      });
    });

    const onAbstractTypeSelect :Function = (selectedRowIndex :number) => {
      this.props.onAbstractTypeSelect(selectedRowIndex);
    };

    return (
      <AbstractDataTable
          data={data}
          headers={headers}
          onRowClick={onAbstractTypeSelect}
          maxHeight={this.props.maxHeight} />
    );
  }
}

export default AbstractTypeDataTable;
