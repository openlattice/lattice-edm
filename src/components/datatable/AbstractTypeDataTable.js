/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  OrderedMap,
  fromJS,
} from 'immutable';
import { Models } from 'lattice';

import AbstractDataTable from './AbstractDataTable';
import AbstractCell, { AbstractCellTypes } from './AbstractCell';

import AbstractTypes from '../../utils/AbstractTypes';
import type { AbstractType } from '../../utils/AbstractTypes';

const { FQN } = Models;

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
  height ?:number;
  highlightOnHover ?:boolean;
  highlightOnSelect ?:boolean;
  maxHeight ?:number;
  showRemoveColumn ?:boolean;
  workingAbstractTypeType :AbstractType;
  onAbstractTypeRemove ?:(selectedAbstractTypeFQN :FQN) => void;
  onAbstractTypeSelect ?:(selectedAbstractTypeFQN :FQN) => void;
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
    height: -1,
    highlightOnHover: false,
    highlightOnSelect: false,
    maxHeight: -1,
    onAbstractTypeRemove: undefined,
    onAbstractTypeSelect: undefined,
    showRemoveColumn: false,
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

      const abstractTypeFQN :FQN = (props.workingAbstractTypeType === AbstractTypes.Schema)
        ? FQN.of(abstractType.get('fqn', Map()))
        : FQN.of(abstractType.get('type', Map()));

      return OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        if (props.workingAbstractTypeType === AbstractTypes.Schema) {
          map.set(NAMESPACE_HEADER_ID, abstractTypeFQN.getNamespace());
          map.set(NAME_HEADER_ID, abstractTypeFQN.getName());
        }
        else {
          map.set(TYPE_HEADER_ID, abstractTypeFQN.toString());
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

  componentDidUpdate(prevProps :Props) {

    const { abstractTypes } = this.props;

    if (!abstractTypes.equals(prevProps.abstractTypes)) {
      const data :List<Map<string, string>> = AbstractTypeDataTable.getData(this.props);
      const headers :List<Map<string, string>> = AbstractTypeDataTable.getHeaders(this.props);
      this.setState({ data, headers });
    }
  }

  handleOnAbstractTypeRemove = (clickedRowIndex :number) => {

    const { abstractTypes, onAbstractTypeRemove, workingAbstractTypeType } = this.props;
    const { selectedRowIndex } = this.state;

    const selectedAbstractType :Map<*, *> = abstractTypes.get(clickedRowIndex, Map());
    let selectedAbstractTypeFQN :FQN = FQN.of(selectedAbstractType.get('type'));

    if (workingAbstractTypeType === AbstractTypes.AssociationType) {
      const entityType :Map<*, *> = selectedAbstractType.get('entityType', Map());
      selectedAbstractTypeFQN = FQN.of(entityType.get('type'));
    }
    else if (workingAbstractTypeType === AbstractTypes.Schema) {
      selectedAbstractTypeFQN = FQN.of(selectedAbstractType.get('fqn'));
      // selectedAbstractTypeId = FullyQualifiedName.toString(selectedAbstractType.get('fqn', Map()));
    }

    if (typeof onAbstractTypeRemove === 'function') {
      onAbstractTypeRemove(selectedAbstractTypeFQN);
    }

    if (clickedRowIndex === selectedRowIndex) {
      this.setState({
        hoveredRowIndex: -1,
        selectedRowIndex: 0
      });
    }
    else if (clickedRowIndex < selectedRowIndex) {
      this.setState({
        hoveredRowIndex: -1,
        selectedRowIndex: selectedRowIndex - 1
      });
    }
    else {
      this.setState({
        hoveredRowIndex: -1
      });
    }
  }

  handleOnAbstractTypeSelect = (selectedRowIndex :number) => {

    const { abstractTypes, onAbstractTypeSelect, workingAbstractTypeType } = this.props;

    let selectedAbstractTypeFQN :FQN;
    const selectedAbstractType :Map<*, *> = abstractTypes.get(selectedRowIndex, Map());

    if (workingAbstractTypeType === AbstractTypes.AssociationType) {
      const entityType :Map<*, *> = selectedAbstractType.get('entityType', Map());
      selectedAbstractTypeFQN = FQN.of(entityType.get('type', Map()));
    }
    else if (workingAbstractTypeType === AbstractTypes.Schema) {
      selectedAbstractTypeFQN = FQN.of(selectedAbstractType.get('fqn', Map()));
    }
    else {
      selectedAbstractTypeFQN = FQN.of(selectedAbstractType.get('type', Map()));
    }

    if (typeof onAbstractTypeSelect === 'function') {
      onAbstractTypeSelect(selectedAbstractTypeFQN);
    }

    this.setState({
      selectedRowIndex,
      hoveredRowIndex: -1
    });
  }

  renderBodyCell = (params :Object, cellValue :any) => {

    const { highlightOnHover, highlightOnSelect, showRemoveColumn } = this.props;
    const { headers, hoveredRowIndex, selectedRowIndex } = this.state;

    const shouldHighlightCell :boolean = (
      (highlightOnHover === true && params.rowIndex === hoveredRowIndex)
      || (highlightOnSelect === true && params.rowIndex === selectedRowIndex)
    );

    if (showRemoveColumn && params.columnIndex === headers.size - 1) {

      // TODO: hover effects
      // possible red: #f44c44;

      /* eslint-disable jsx-a11y/mouse-events-have-key-events */
      return (
        <AbstractCell
            highlight={shouldHighlightCell}
            justifyContent="flex-end"
            key={params.key}
            style={params.style}
            type={AbstractCellTypes.BODY}
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
          type={AbstractCellTypes.BODY}
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

    const {
      abstractTypes,
      height,
      maxHeight,
    } = this.props;
    const { data, headers } = this.state;

    if (abstractTypes.isEmpty()) {
      return null;
    }

    return (
      <AbstractDataTable
          bodyCellRenderer={this.renderBodyCell}
          data={data}
          headers={headers}
          height={height}
          maxHeight={maxHeight} />
    );
  }
}

export default AbstractTypeDataTable;
