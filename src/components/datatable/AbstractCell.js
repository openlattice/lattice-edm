/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

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

const getBackgroundStyles = ({ highlight }) => {

  if (highlight === true) {
    return css`
      background-color: #edf6ff;
    `;
  }

  return '';
};

const getBorderStyles = ({ type }) => {

  if (type === TYPES.BODY) {
    return css`
      border-top: 1px solid #c5d5e5;
    `;
  }
  if (type === TYPES.HEAD) {
    return css`
      border-bottom: 1px solid #516a83;
    `;
  }

  return '';
};

const getFontWeight = ({ type }) => {

  if (type === TYPES.HEAD) {
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
  justify-content: ${({ justifyContent }) => justifyContent};
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
  highlight ?:boolean;
  justifyContent ?:string;
  style :Object;
  type :string;
  value :Node;
  onMouseDown ?:() => void;
  onMouseLeave ?:() => void;
  onMouseOver ?:() => void;
}

class AbstractCell extends React.Component<Props> {

  static defaultProps = {
    highlight: false,
    justifyContent: 'flex-start',
    onMouseDown: undefined,
    onMouseLeave: undefined,
    onMouseOver: undefined,
  }

  render() {

    const {
      highlight,
      justifyContent,
      style,
      type,
      value,
      onMouseDown,
      onMouseLeave,
      onMouseOver
    } = this.props;

    // TODO: hover effects
    // possible red: #f44c44;

    /* eslint-disable jsx-a11y/mouse-events-have-key-events */
    return (
      <CellWrapper
          highlight={highlight}
          justifyContent={justifyContent}
          type={type}
          style={style}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseOver={onMouseOver}>
        <CellValueWrapper>
          { value }
        </CellValueWrapper>
      </CellWrapper>
    );
    /* eslint-enable */
  }
}

export default AbstractCell;

export { TYPES as AbstractCellTypes };
