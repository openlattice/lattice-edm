/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { SortableElement } from 'react-sortable-hoc';
import type { CellRangeRendererParams, CellRendererParams } from 'react-virtualized';

/*
 * styled components
 */

// TODO: add z-index value for row being dragged
const RowWrapper = styled.div``;

/*
 * react-virtualized: custom cellRangeRenderer for Grid
 * https://github.com/clauderic/react-sortable-hoc/issues/295#issuecomment-344070823
 */

type RowRendererParams = {
  children :Node;
  index :number;
  key :string;
  style :{[string] :mixed};
};

type GridRowRenderer = (params :RowRendererParams) => Node;

function rowRangeRenderer(rowRenderer :GridRowRenderer) {

  /*
   * https://github.com/bvaughn/react-virtualized/blob/master/docs/Grid.md#cellrangerenderer
   * https://github.com/bvaughn/react-virtualized/blob/master/source/Grid/defaultCellRangeRenderer.js
   */
  return ({
    cellCache,
    cellRenderer,
    columnSizeAndPositionManager,
    columnStartIndex,
    columnStopIndex,
    deferredMeasurementCache,
    horizontalOffsetAdjustment,
    isScrolling,
    parent,
    rowSizeAndPositionManager,
    rowStartIndex,
    rowStopIndex,
    styleCache,
    verticalOffsetAdjustment,
    visibleColumnIndices,
    visibleRowIndices
  } :CellRangeRendererParams) :Node[] => {

    const renderedRows :Node[] = [];
    const areOffsetsAdjusted :boolean = (
      columnSizeAndPositionManager.areOffsetsAdjusted()
      || rowSizeAndPositionManager.areOffsetsAdjusted()
    );
    const canCacheStyle :boolean = !isScrolling && !areOffsetsAdjusted;

    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex += 1) {

      const renderedCells :Node[] = [];
      const rowInfo :Object = rowSizeAndPositionManager.getSizeAndPositionOfCell(rowIndex);

      for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex += 1) {

        const cellKey :string = `${rowIndex}-${columnIndex}`;
        const columnInfo :Object = columnSizeAndPositionManager.getSizeAndPositionOfCell(columnIndex);
        const isVisible :boolean = (
          columnIndex >= visibleColumnIndices.start
          && columnIndex <= visibleColumnIndices.stop
          && rowIndex >= visibleRowIndices.start
          && rowIndex <= visibleRowIndices.stop
        );

        let cellStyle :{[string] :mixed};
        if (canCacheStyle && styleCache[cellKey]) {
          cellStyle = styleCache[cellKey];
        }
        else if (deferredMeasurementCache && !deferredMeasurementCache.has(rowIndex, columnIndex)) {
          cellStyle = {
            height: 'auto',
            left: 0,
            position: 'absolute',
            top: 0,
            width: 'auto'
          };
        }
        else {
          cellStyle = {
            height: rowInfo.size,
            left: columnInfo.offset + horizontalOffsetAdjustment,
            position: 'absolute',
            top: 0,
            width: columnInfo.size
          };
        }

        let renderedCell :Node;
        const cellRendererParams :CellRendererParams = {
          columnIndex,
          isScrolling,
          isVisible,
          parent,
          rowIndex,
          key: cellKey,
          style: cellStyle
        };

        if (isScrolling && !horizontalOffsetAdjustment && !verticalOffsetAdjustment) {
          if (!cellCache[cellKey]) {
            // eslint-disable-next-line no-param-reassign
            cellCache[cellKey] = cellRenderer(cellRendererParams);
          }
          renderedCell = cellCache[cellKey];
        }
        else {
          renderedCell = cellRenderer(cellRendererParams);
        }

        if (renderedCell !== null && renderedCell !== false) {
          renderedCells.push(renderedCell);
        }
      }

      const renderedRow :Node = rowRenderer({
        children: renderedCells,
        index: rowIndex,
        key: `${rowIndex}`,
        style: {
          height: rowInfo.size,
          left: 0,
          position: 'absolute',
          right: 0,
          top: rowInfo.offset + verticalOffsetAdjustment
        }
      });
      renderedRows.push(renderedRow);
    }

    return renderedRows;
  };
}

const AbstractRow = (params :Object) => (
  <RowWrapper style={params.style}>
    { params.children }
  </RowWrapper>
);

const OrderableRow = SortableElement(AbstractRow);
const orderableRowRangeRenderer = rowRangeRenderer((params) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <OrderableRow key={params.key} index={params.index} {...params} />
));

export default AbstractRow;

export { orderableRowRangeRenderer };
