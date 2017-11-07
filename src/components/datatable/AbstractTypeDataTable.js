/*
 * @flow
 */

import React from 'react';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import Immutable from 'immutable';
import { Models } from 'lattice';

import AbstractCell from './AbstractCell';
import AbstractDataTable from './AbstractDataTable';
import AbstractTypes from '../../utils/AbstractTypes';
import type { AbstractType } from '../../utils/AbstractTypes';

const { FullyQualifiedName } = Models;

/*
 * constants
 */

const REMOVE_BTN_HEADER_ID :string = 'remove';
const REMOVE_BTN_HEADER :Map<string, string> = Immutable.fromJS({ id: REMOVE_BTN_HEADER_ID, value: '' });

const TITLE_HEADER_ID :string = 'title';
const TITLE_HEADER :Map<string, string> = Immutable.fromJS({ id: TITLE_HEADER_ID, value: 'Title' });

const TYPE_HEADER_ID :string = 'type';
const TYPE_HEADER :Map<string, string> = Immutable.fromJS({ id: TYPE_HEADER_ID, value: 'FQN' });

const HEADERS_MAP :Map<string, Map<string, string>> = Immutable.fromJS({
  [REMOVE_BTN_HEADER_ID]: REMOVE_BTN_HEADER,
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
  abstractTypes :List<Map<*, *>>;
  headerIds :List<string>;
  height :number;
  highlightOnHover :boolean;
  highlightOnSelect :boolean;
  maxHeight :number;
  showRemoveColumn :boolean;
  workingAbstractTypeType :AbstractType;
  onAbstractTypeRemove :(selectedAbstractTypeId :string) => void;
  onAbstractTypeSelect :(selectedAbstractTypeId :string) => void;
}

type State = {
  data :List<Map<string, string>>;
  headers :List<Map<string, string>>;
  hoveredRowIndex :number;
  selectedRowIndex :number;
}

// TODO: is it possible to extend AbstractDataTable? pass props?
class AbstractTypeDataTable extends React.Component<Props, State> {

  static defaultProps = {
    abstractTypes: Immutable.List(),
    headerIds: Immutable.List(),
    height: -1,
    highlightOnHover: false,
    highlightOnSelect: false,
    maxHeight: -1,
    showRemoveColumn: false,
    workingAbstractTypeType: AbstractTypes.PropertyType,
    onAbstractTypeRemove: () => {},
    onAbstractTypeSelect: () => {}
  }

  constructor(props :Props) {

    super(props);

    const data :List<Map<string, string>> = AbstractTypeDataTable.getData(props);
    const headers :List<Map<string, string>> = AbstractTypeDataTable.getHeaders(props);

    this.state = {
      data,
      headers,
      hoveredRowIndex: -1,
      selectedRowIndex: (props.highlightOnSelect) ? 0 : -1
    };
  }

  static getHeaders(props :Props) :List<Map<string, string>> {

    let headers :List<Map<string, string>> = DEFAULT_HEADERS;
    if (!props.headerIds.isEmpty()) {
      headers = props.headerIds.map((headerId :string) => {
        return HEADERS_MAP.get(headerId, Immutable.Map());
      });
    }

    if (props.showRemoveColumn) {
      headers = headers.push(REMOVE_BTN_HEADER);
    }

    return headers;
  }

  static getData(props :Props) :List<Map<string, string>> {

    const data :List<Map<string, string>> = props.abstractTypes.map((type :Map<*, *>) => {

      const abstractType :Map<*, *> = (props.workingAbstractTypeType === AbstractTypes.AssociationType)
        ? type.get('entityType', Immutable.Map())
        : type;

      const abstractTypeType :Map<string, string> = abstractType.get('type', Immutable.Map());
      const abstractTypeFqn :string = FullyQualifiedName.toString(abstractTypeType);
      const abstractTypeTitle :string = abstractType.get('title', '');

      return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        map.set(TYPE_HEADER_ID, abstractTypeFqn);
        map.set(TITLE_HEADER_ID, abstractTypeTitle);
        if (props.showRemoveColumn) {
          // not necessary, just good practice to match header count
          map.set(REMOVE_BTN_HEADER_ID, 'x');
        }
      });
    });

    return data;
  }

  componentWillReceiveProps(nextProps :Props) {

    const haveHeadersChanged :boolean = !this.props.headerIds.equals(nextProps.headerIds);
    const haveAbstractTypesChanged :boolean = !this.props.abstractTypes.equals(nextProps.abstractTypes);

    if (haveHeadersChanged || haveAbstractTypesChanged) {

      const data :List<Map<string, string>> = AbstractTypeDataTable.getData(nextProps);
      const headers :List<Map<string, string>> = AbstractTypeDataTable.getHeaders(nextProps);

      this.setState({
        data,
        headers
      });
    }
  }

  handleOnAbstractTypeRemove = (selectedRowIndex :number) => {

    const selectedAbstractType :Map<*, *> = this.props.abstractTypes.get(selectedRowIndex, Immutable.Map());
    let selectedAbstractTypeId :string = selectedAbstractType.get('id', '');

    if (this.props.workingAbstractTypeType === AbstractTypes.AssociationType) {
      const entityType :Map<*, *> = selectedAbstractType.get('entityType', Immutable.Map());
      selectedAbstractTypeId = entityType.get('id', '');
    }

    this.props.onAbstractTypeRemove(selectedAbstractTypeId);

    if (selectedRowIndex === this.state.selectedRowIndex) {
      this.setState({
        hoveredRowIndex: -1,
        selectedRowIndex: 0
      });
    }
    else if (selectedRowIndex < this.state.selectedRowIndex) {
      this.setState({
        hoveredRowIndex: -1,
        selectedRowIndex: this.state.selectedRowIndex - 1
      });
    }
    else {
      this.setState({
        hoveredRowIndex: -1
      });
    }
  }

  handleOnAbstractTypeSelect = (selectedRowIndex :number) => {

    const selectedAbstractType :Map<*, *> = this.props.abstractTypes.get(selectedRowIndex, Immutable.Map());
    let selectedAbstractTypeId :string = selectedAbstractType.get('id', '');

    if (this.props.workingAbstractTypeType === AbstractTypes.AssociationType) {
      const entityType :Map<*, *> = selectedAbstractType.get('entityType', Immutable.Map());
      selectedAbstractTypeId = entityType.get('id', '');
    }

    this.props.onAbstractTypeSelect(selectedAbstractTypeId);

    this.setState({
      selectedRowIndex,
      hoveredRowIndex: -1
    });
  }

  renderBodyCell = (params :Object, cellValue :mixed) => {

    const shouldHighlightCell :boolean =
      (this.props.highlightOnHover && params.rowIndex === this.state.hoveredRowIndex)
      || (this.props.highlightOnSelect && params.rowIndex === this.state.selectedRowIndex);

    if (this.props.showRemoveColumn && params.columnIndex === this.state.headers.size - 1) {

      // TODO: hover effects
      // possible red: #f44c44;

      return (
        <AbstractCell
            highlight={shouldHighlightCell}
            justifyContent="center"
            key={params.key}
            params={params}
            value={(
              <FontAwesomeIcon pack="fas" name="times" />
            )}
            onMouseDown={() => {
              this.handleOnAbstractTypeRemove(params.rowIndex);
              params.parent.forceUpdate();
            }}
            onMouseLeave={() => {
              this.setState({
                hoveredRowIndex: -1
              });
              params.parent.forceUpdate();
            }}
            onMouseOver={() => {
              this.setState({
                hoveredRowIndex: params.rowIndex
              });
              params.parent.forceUpdate();
            }} />
      );
    }

    return (
      <AbstractCell
          highlight={shouldHighlightCell}
          key={params.key}
          params={params}
          value={cellValue}
          onMouseDown={() => {
            this.handleOnAbstractTypeSelect(params.rowIndex);
            params.parent.forceUpdate();
          }}
          onMouseLeave={() => {
            this.setState({
              hoveredRowIndex: -1
            });
            params.parent.forceUpdate();
          }}
          onMouseOver={() => {
            this.setState({
              hoveredRowIndex: params.rowIndex
            });
            params.parent.forceUpdate();
          }} />
    );
  }

  render() {

    if (this.props.abstractTypes.isEmpty()) {
      return null;
    }

    return (
      <AbstractDataTable
          data={this.state.data}
          headers={this.state.headers}
          height={this.props.height}
          maxHeight={this.props.maxHeight}
          bodyCellRenderer={this.renderBodyCell} />
    );
  }
}

export default AbstractTypeDataTable;
