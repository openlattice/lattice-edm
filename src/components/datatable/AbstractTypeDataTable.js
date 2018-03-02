/*
 * @flow
 */

import React from 'react';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { faTimes } from '@fortawesome/fontawesome-pro-regular';
import { List, Map, OrderedMap, fromJS } from 'immutable';
import { Models } from 'lattice';

import AbstractCell from './AbstractCell';
import AbstractDataTable from './AbstractDataTable';
import AbstractTypes from '../../utils/AbstractTypes';
import type { AbstractType } from '../../utils/AbstractTypes';

const { FullyQualifiedName } = Models;

/*
 * constants
 */

const NAME_HEADER_ID :string = 'name';
const NAME_HEADER :Map<string, string> = fromJS({ id: NAME_HEADER_ID, value: 'Name' });

const NAMESPACE_HEADER_ID :string = 'namespace';
const NAMESPACE_HEADER :Map<string, string> = fromJS({ id: NAMESPACE_HEADER_ID, value: 'Namespace' });

const REMOVE_BTN_HEADER_ID :string = 'remove';
const REMOVE_BTN_HEADER :Map<string, string> = fromJS({ id: REMOVE_BTN_HEADER_ID, value: '' });

const TITLE_HEADER_ID :string = 'title';
const TITLE_HEADER :Map<string, string> = fromJS({ id: TITLE_HEADER_ID, value: 'Title' });

const TYPE_HEADER_ID :string = 'type';
const TYPE_HEADER :Map<string, string> = fromJS({ id: TYPE_HEADER_ID, value: 'FQN' });

const DEFAULT_HEADERS :List<Map<string, string>> = fromJS([TYPE_HEADER, TITLE_HEADER]);
const SCHEMA_HEADERS :List<Map<string, string>> = fromJS([NAMESPACE_HEADER, NAME_HEADER]);

/*
 * styled components
 */

const RemoveButtonWrapper = styled.div`
  padding: 10px;
  &:hover {
   cursor: pointer;
  }
`;

/*
 * types
 */

type Props = {
  abstractTypes :List<Map<*, *>>;
  height :number;
  highlightOnHover :boolean;
  highlightOnSelect :boolean;
  maxHeight :number;
  showRemoveColumn :boolean;
  workingAbstractTypeType :AbstractType;
  onAbstractTypeRemove :(selectedAbstractTypeId :string) => void;
  onAbstractTypeSelect :(selectedAbstractTypeId :string) => void;
};

type State = {
  data :List<Map<string, string>>;
  headers :List<Map<string, string>>;
  hoveredRowIndex :number;
  selectedRowIndex :number;
};

// TODO: is it possible to extend AbstractDataTable? pass props?
class AbstractTypeDataTable extends React.Component<Props, State> {

  static defaultProps = {
    abstractTypes: List(),
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
    if (props.workingAbstractTypeType === AbstractTypes.Schema) {
      headers = SCHEMA_HEADERS;
    }

    if (props.showRemoveColumn) {
      headers = headers.push(REMOVE_BTN_HEADER);
    }

    return headers;
  }

  static getData(props :Props) :List<Map<string, string>> {

    const data :List<Map<string, string>> = props.abstractTypes.map((type :Map<*, *>) => {

      if (!type || type.isEmpty()) {
        return Map();
      }

      const abstractType :Map<*, *> = (props.workingAbstractTypeType === AbstractTypes.AssociationType)
        ? type.get('entityType', Map())
        : type;

      const abstractTypeFqn :FullyQualifiedName = (props.workingAbstractTypeType === AbstractTypes.Schema)
        ? new FullyQualifiedName(abstractType.get('fqn', Map()))
        : new FullyQualifiedName(abstractType.get('type', Map()));

      return OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        if (props.workingAbstractTypeType === AbstractTypes.Schema) {
          map.set(NAMESPACE_HEADER_ID, abstractTypeFqn.getNamespace());
          map.set(NAME_HEADER_ID, abstractTypeFqn.getName());
        }
        else {
          map.set(TYPE_HEADER_ID, abstractTypeFqn.toString());
          map.set(TITLE_HEADER_ID, abstractType.get('title', ''));
        }
        if (props.showRemoveColumn) {
          // not necessary, just good practice to match header count
          map.set(REMOVE_BTN_HEADER_ID, 'x');
        }
      });
    });

    return data;
  }

  componentWillReceiveProps(nextProps :Props) {

    const haveAbstractTypesChanged :boolean = !this.props.abstractTypes.equals(nextProps.abstractTypes);
    if (haveAbstractTypesChanged) {

      const data :List<Map<string, string>> = AbstractTypeDataTable.getData(nextProps);
      const headers :List<Map<string, string>> = AbstractTypeDataTable.getHeaders(nextProps);

      this.setState({
        data,
        headers
      });
    }
  }

  handleOnAbstractTypeRemove = (selectedRowIndex :number) => {

    const selectedAbstractType :Map<*, *> = this.props.abstractTypes.get(selectedRowIndex, Map());
    let selectedAbstractTypeId :string = selectedAbstractType.get('id', '');

    if (this.props.workingAbstractTypeType === AbstractTypes.AssociationType) {
      const entityType :Map<*, *> = selectedAbstractType.get('entityType', Map());
      selectedAbstractTypeId = entityType.get('id', '');
    }
    else if (this.props.workingAbstractTypeType === AbstractTypes.Schema) {
      selectedAbstractTypeId = FullyQualifiedName.toString(selectedAbstractType.get('fqn', Map()));
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

    const selectedAbstractType :Map<*, *> = this.props.abstractTypes.get(selectedRowIndex, Map());
    let selectedAbstractTypeId :string = selectedAbstractType.get('id', '');

    if (this.props.workingAbstractTypeType === AbstractTypes.AssociationType) {
      const entityType :Map<*, *> = selectedAbstractType.get('entityType', Map());
      selectedAbstractTypeId = entityType.get('id', '');
    }
    else if (this.props.workingAbstractTypeType === AbstractTypes.Schema) {
      selectedAbstractTypeId = FullyQualifiedName.toString(selectedAbstractType.get('fqn', Map()));
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

      /* eslint-disable jsx-a11y/mouse-events-have-key-events */
      return (
        <AbstractCell
            highlight={shouldHighlightCell}
            justifyContent="flex-end"
            key={params.key}
            style={params.style}
            value={(
              <RemoveButtonWrapper
                  onMouseDown={() => {
                    this.handleOnAbstractTypeRemove(params.rowIndex);
                    params.parent.forceUpdate();
                  }}>
                <FontAwesomeIcon icon={faTimes} />
              </RemoveButtonWrapper>
            )}
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
      /* eslint-enable */
    }

    /* eslint-disable jsx-a11y/mouse-events-have-key-events */
    return (
      <AbstractCell
          highlight={shouldHighlightCell}
          key={params.key}
          style={params.style}
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
    /* eslint-enable */
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
