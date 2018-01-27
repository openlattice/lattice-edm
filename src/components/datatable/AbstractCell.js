/*
 * @flow
 */

import React from 'react';

import styled, { css } from 'styled-components';

/*
* constants
*/

const CELL_PADDING :number = 10;

const TYPES = {
  BODY: 'body',
  HEAD: 'head'
};

/*
 * helper functions
 */

const getBackgroundStyles = (props :Object) => {

  if (props.highlight === true) {
    return css`
      background-color: #edf6ff;
    `;
  }

  return '';
};

const getBorderStyles = (props :Object) => {

  if (props.type === TYPES.BODY) {
    return css`
      border-top: 1px solid #c5d5e5;
    `;
  }
  else if (props.type === TYPES.HEAD) {
    return css`
      border-bottom: 1px solid #516a83;
    `;
  }

  return '';
};

const getFontWeight = (props :Object) => {

  if (props.type === TYPES.HEAD) {
    return css`
      font-weight: 600;
    `;
  }

  return '';
};

/*
 * styled components
 */

const CellWrapper = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  justify-content: ${props => props.justifyContent};
  padding: ${CELL_PADDING}px;
  ${getBackgroundStyles}
  ${getBorderStyles}
  ${getFontWeight}
`;

const CellValueWrapper = styled.div`
  cursor: default;
  line-height: normal;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/*
 * types
 */

type Props = {
  highlight :boolean;
  justifyContent :string;
  params :Object;
  type :string;
  value :mixed;
  onMouseDown :() => void;
  onMouseLeave :() => void;
  onMouseOver :() => void;
}

class AbstractCell extends React.Component<Props> {

  static defaultProps = {
    highlight: false,
    justifyContent: 'flex-start',
    params: {},
    type: TYPES.BODY,
    value: '',
    onMouseDown: () => {},
    onMouseLeave: () => {},
    onMouseOver: () => {}
  }

  render() {

    // TODO: hover effects
    // possible red: #f44c44;

    /* eslint-disable jsx-a11y/mouse-events-have-key-events */
    return (
      <CellWrapper
          highlight={this.props.highlight}
          justifyContent={this.props.justifyContent}
          type={this.props.type}
          style={this.props.params.style}
          onMouseDown={this.props.onMouseDown}
          onMouseLeave={this.props.onMouseLeave}
          onMouseOver={this.props.onMouseOver}>
        <CellValueWrapper>{ this.props.value }</CellValueWrapper>
      </CellWrapper>
    );
    /* eslint-enable */
  }
}

export default AbstractCell;

export {
  TYPES as AbstractCellTypes
};
