/*
 * @flow
 */

import React from 'react';

import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { List, Map, OrderedMap } from 'immutable';
import { SortableContainer } from 'react-sortable-hoc';
import { AutoSizer, Grid, ScrollSync } from 'react-virtualized';

import AbstractCell, { AbstractCellTypes } from './AbstractCell';
import { orderableRowRangeRenderer } from './AbstractRow';

/*
 * constants
 */

// const DEFAULT_GRID_MAX_HEIGHT :number = 500;
// const DEFAULT_GRID_MAX_WIDTH :number = 500;

const DEFAULT_COLUMN_MAX_WIDTH :number = 500;
const DEFAULT_COLUMN_MIN_WIDTH :number = 50;

const DEFAULT_ROW_MIN_HEIGHT :number = 50;

const DEFAULT_OVERSCAN_COLUMN_COUNT :number = 4;
const DEFAULT_OVERSCAN_ROW_COUNT :number = 4;

const CELL_PADDING :number = 10;

// !!! HACK !!!
// http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
const CANVAS = document.createElement('canvas');
const CANVAS_CONTEXT = CANVAS.getContext('2d');
CANVAS_CONTEXT.font = '14px "Open Sans", sans-serif';

/*
 * helper components
 */

// NOTE: will "withRef" be a problem in the future?
const OrderableGrid = SortableContainer(Grid, { withRef: true });

/*
 * styled components
 */

const DataTableOuterWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
`;

const DataTableInnerWrapper = styled.div`
  flex: 1 1 auto;
`;

const HeadGrid = styled(Grid)`
  border: none;
  outline: none;
  overflow: hidden !important; /* hides horizontal scrollbar */
  z-index: 100; /* arbitrarily chosen value */
`;

const BodyGrid = styled(Grid)`
  border: none;
  outline: none;
  margin-top: -1px;
  z-index: 99;
`;

const OrderableBodyGrid = styled(OrderableGrid)`
  border: none;
  outline: none;
  margin-top: -1px;
  z-index: 99;
`;

/*
 * types
 */

type GridData = List<Map<string, string>>;
type GridHeaders = List<Map<string, string>>;

type Props = {
  bodyCellRenderer ?:(params :Object, cellValue :any) => any;
  data :GridData;
  headers :GridHeaders;
  height ?:number;
  maxHeight ?:number;
  maxWidth ?:number;
  onReorder ?:(oldIndex :number, newIndex :number) => void;
  orderable ?:boolean;
  width ?:number;
};

type State = {
  autosizerHeight :number;
  autosizerWidth :number;
  columnWidths :Map<number, number>;
  computedBodyGridHeight :number;
  computedBodyGridWidth :number;
  computedHeadGridHeight :number;
  computedHeadGridWidth :number;
};

/*
 * TODO: implement filtering
 * TODO: allow configuration over dimensions & resizing
 */
class AbstractDataTable extends React.Component<Props, State> {

  headGrid :?Grid;
  bodyGrid :?Grid;

  static defaultProps = {
    bodyCellRenderer: undefined,
    height: -1,
    maxHeight: -1,
    maxWidth: -1,
    onReorder: undefined,
    orderable: false,
    width: -1,
  };

  constructor(props :Props) {

    super(props);

    this.state = {
      autosizerHeight: 0,
      autosizerWidth: 0,
      columnWidths: Map(),
      computedBodyGridHeight: 0,
      computedBodyGridWidth: 0,
      computedHeadGridHeight: 0,
      computedHeadGridWidth: 0
    };
  }

  static measureTextWidth(text :string) :number {

    return Math.ceil(CANVAS_CONTEXT.measureText(text).width);
  }

  static computeColumnWidths(params :Object) :Map<number, number> {

    return OrderedMap().withMutations((map :OrderedMap<number, number>) => {

      // iterate through the headers, column by column, and compute an estimated width for each column
      params.headers.forEach((header :Map<string, string>, columnIndex :number) => {

        // find the widest cell in the column
        let columnWidth :number = 0;

        params.data.forEach((row :Map<string, string>) => {
          // keeping it simple for now
          const cellValue :string = row.get(header.get('id', ''), '');
          const cellWidth :number = AbstractDataTable.measureTextWidth(cellValue);
          if (cellWidth > columnWidth) {
            columnWidth = cellWidth;
          }
        });

        // compare the header cell width with the widest cell in the table
        const headerCellWidth :number = AbstractDataTable.measureTextWidth(header.get('value', ''));
        let fontMultiplier :number = 1;
        if (headerCellWidth >= columnWidth) {
          columnWidth = headerCellWidth;
          fontMultiplier = 1.2;
        }

        // account for extra width due to style: left padding, right padding
        let columnWidthInPixels :number = (columnWidth * fontMultiplier) + (2 * CELL_PADDING);

        // ensure column will have a minimum width
        if (columnWidthInPixels < DEFAULT_COLUMN_MIN_WIDTH) {
          columnWidthInPixels = DEFAULT_COLUMN_MIN_WIDTH;
        }
        // ensure column will have a maximum width
        else if (columnWidthInPixels > DEFAULT_COLUMN_MAX_WIDTH) {
          columnWidthInPixels = DEFAULT_COLUMN_MAX_WIDTH;
        }

        // store the computed column width. empty columns will not be rendered
        map.set(columnIndex, Math.floor(columnWidthInPixels));
      });
    });
  }

  static computeDimensions(params :Object) :Object {

    const rowCount :number = params.data.size;

    let columnWidths :Map<number, number> = AbstractDataTable.computeColumnWidths(params);
    const totalWidth :number = columnWidths.reduce(
      (widthSum :number, columnWidth :number) :number => widthSum + columnWidth,
      0
    );

    let visibleWidth :number = (params.specifiedWidth !== -1) ? params.specifiedWidth : totalWidth;
    if (params.autosizerWidth > 0) {
      visibleWidth = params.autosizerWidth;
    }
    if (params.specifiedMaxWidth !== -1 && visibleWidth > params.specifiedMaxWidth) {
      visibleWidth = params.specifiedMaxWidth;
    }

    const computedHeadGridHeight :number = DEFAULT_ROW_MIN_HEIGHT;
    const computedHeadGridWidth :number = visibleWidth;

    const totalHeight :number = computedHeadGridHeight + (rowCount * DEFAULT_ROW_MIN_HEIGHT);
    let visibleHeight :number = (params.specifiedHeight > 0) ? params.specifiedHeight : totalHeight;
    if (params.specifiedMaxHeight !== -1 && visibleHeight > params.specifiedMaxHeight) {
      visibleHeight = params.specifiedMaxHeight;
    }

    const computedBodyGridHeight :number = visibleHeight - computedHeadGridHeight;
    const computedBodyGridWidth :number = visibleWidth;

    if (totalWidth < visibleWidth) {
      const lastColumnIndex :number = columnWidths.size - 1;
      const lastColumnWidth :number = columnWidths.get(lastColumnIndex, 0);
      const differenceInWidth :number = visibleWidth - totalWidth;
      columnWidths = columnWidths.set(lastColumnIndex, lastColumnWidth + differenceInWidth);
    }

    return {
      columnWidths,
      computedHeadGridHeight,
      computedHeadGridWidth,
      computedBodyGridHeight,
      computedBodyGridWidth
    };
  }

  componentDidUpdate(prevProps :Props, prevState :State) {

    const {
      data,
      headers,
      height,
      maxHeight,
      maxWidth,
      width,
    } = this.props;
    const { columnWidths } = this.state;

    const haveHeadersChanged :boolean = !headers.equals(prevProps.headers);
    const hasDataChanged :boolean = !data.equals(prevProps.data);
    const haveColumnWidthsChanged :boolean = !columnWidths.equals(prevState.columnWidths);

    if (haveHeadersChanged || hasDataChanged) {
      const newDimensions :Object = AbstractDataTable.computeDimensions({
        data,
        headers,
        autosizerHeight: prevState.autosizerHeight,
        autosizerWidth: prevState.autosizerWidth,
        specifiedMaxHeight: maxHeight,
        specifiedMaxWidth: maxWidth,
        specifiedHeight: height,
        specifiedWidth: width,
      });
      this.setState({ ...newDimensions });
    }

    /* eslint-disable prefer-destructuring */
    const headGrid :?Grid = this.headGrid;
    const bodyGrid :?Grid = this.bodyGrid;
    /* eslint-enable */

    const shouldRecomputeGrids :boolean = haveHeadersChanged || hasDataChanged || haveColumnWidthsChanged;
    if (shouldRecomputeGrids && headGrid && bodyGrid) {
      // https://github.com/bvaughn/react-virtualized/issues/136#issuecomment-190440226
      headGrid.recomputeGridSize();
      bodyGrid.recomputeGridSize();
    }
  }

  setHeadGridRef = (headGridRef :any) :void => {

    this.headGrid = headGridRef;
  }

  setBodyGridRef = (ref :any) :void => {

    if (ref) {
      if (isFunction(ref.getWrappedInstance)) {
        this.bodyGrid = ref.getWrappedInstance();
      }
      else {
        this.bodyGrid = ref;
      }
    }
  }

  isLastColumn = (columnIndex :number) :boolean => {

    const { columnWidths } = this.state;
    return columnIndex + 1 === columnWidths.size;
  }

  getColumnWidth = (params :Object) :number => {

    const { columnWidths } = this.state;
    return columnWidths.get(params.index, DEFAULT_COLUMN_MIN_WIDTH);
  }

  getRowHeight = () :number => {

    return DEFAULT_ROW_MIN_HEIGHT; // TODO: implement more intelligently
  }

  getCellValue = (rowIndex :number, columnIndex :number) :any => {

    const { data, headers } = this.props;

    // keeping it simple
    // TODO: handle various cell value types (string, number, array, object, etc.)
    const header :string = headers.getIn([columnIndex, 'id'], '');
    return data.getIn([rowIndex, header], '');
  }

  onAutoSizerResize = (params :Object) => {

    const {
      data,
      headers,
      height,
      maxHeight,
      maxWidth,
      width
    } = this.props;

    const newDimensions :Object = AbstractDataTable.computeDimensions({
      data,
      headers,
      autosizerHeight: params.height,
      autosizerWidth: params.width,
      specifiedMaxHeight: maxHeight,
      specifiedMaxWidth: maxWidth,
      specifiedHeight: height,
      specifiedWidth: width
    });

    this.setState({
      autosizerHeight: params.height,
      autosizerWidth: params.width,
      ...newDimensions
    });
  }

  // https://github.com/clauderic/react-sortable-hoc
  onSortEnd = (rsParams :Object) => {

    const { onReorder } = this.props;

    if (rsParams.oldIndex !== rsParams.newIndex) {
      if (typeof onReorder === 'function') {
        onReorder(rsParams.oldIndex, rsParams.newIndex);
      }
    }
  }

  renderHeadCell = (params :Object) => {

    const { headers } = this.props;
    const cellValue :string = headers.getIn([params.columnIndex, 'value'], '');

    return (
      <AbstractCell
          key={params.key}
          style={params.style}
          type={AbstractCellTypes.HEAD}
          value={cellValue} />
    );
  }

  renderBodyCell = (params :Object) => {

    const { bodyCellRenderer } = this.props;
    const cellValue :any = this.getCellValue(params.rowIndex, params.columnIndex);

    if (typeof bodyCellRenderer === 'function') {
      return bodyCellRenderer(params, cellValue);
    }

    return (
      <AbstractCell
          key={params.key}
          style={params.style}
          type={AbstractCellTypes.BODY}
          value={cellValue} />
    );
  }

  render() {

    const { data, headers, orderable } = this.props;
    const {
      computedBodyGridHeight,
      computedBodyGridWidth,
      computedHeadGridHeight,
      computedHeadGridWidth
    } = this.state;

    const columnCount :number = headers.size;
    const rowCount :number = data.size;

    if (columnCount === 0 || rowCount === 0) {
      // TODO: need a better design for no data
      return null;
    }

    // NOTE: this is from below. not sure why I left this commented out, or why it existed. might be important
    // if (height !== (this.state.computedHeadGridHeight + this.state.computedBodyGridHeight)
    //     || width !== this.state.computedHeadGridWidth
    //     || width !== this.state.computedBodyGridWidth) {
    //   return null;
    // }

    // NOTE: the difference between BodyGrid and OrderableBodyGrid are the extra props needed for "react-sortable-hoc"
    //   - cellRangeRenderer
    //   - lockAxis
    //   - onSortEnd
    // the rest of the props are identical and must be kept in sync.
    return (
      <DataTableOuterWrapper>
        <ScrollSync>
          {
            ({ onScroll, scrollLeft }) => (
              <DataTableInnerWrapper>
                <AutoSizer disableHeight onResize={this.onAutoSizerResize}>
                  {
                    (/* { height, width } */) => (
                      <div>
                        <div>
                          <HeadGrid
                              cellRenderer={this.renderHeadCell}
                              columnCount={columnCount}
                              columnWidth={this.getColumnWidth}
                              estimatedColumnSize={DEFAULT_COLUMN_MIN_WIDTH}
                              height={computedHeadGridHeight}
                              ref={this.setHeadGridRef}
                              overscanColumnCount={DEFAULT_OVERSCAN_COLUMN_COUNT}
                              overscanRowCount={DEFAULT_OVERSCAN_ROW_COUNT}
                              rowHeight={DEFAULT_ROW_MIN_HEIGHT}
                              rowCount={1}
                              scrollLeft={scrollLeft}
                              width={computedHeadGridWidth} />
                        </div>
                        <div>
                          {
                            orderable
                              ? (
                                <OrderableBodyGrid
                                    cellRangeRenderer={orderableRowRangeRenderer}
                                    cellRenderer={this.renderBodyCell}
                                    columnCount={columnCount}
                                    columnWidth={this.getColumnWidth}
                                    estimatedColumnSize={DEFAULT_COLUMN_MIN_WIDTH}
                                    height={computedBodyGridHeight}
                                    ref={this.setBodyGridRef}
                                    lockAxis="y"
                                    onScroll={onScroll}
                                    onSortEnd={this.onSortEnd}
                                    overscanColumnCount={DEFAULT_OVERSCAN_COLUMN_COUNT}
                                    overscanRowCount={DEFAULT_OVERSCAN_ROW_COUNT}
                                    rowCount={rowCount}
                                    rowHeight={this.getRowHeight}
                                    width={computedBodyGridWidth} />
                              )
                              : (
                                <BodyGrid
                                    cellRenderer={this.renderBodyCell}
                                    columnCount={columnCount}
                                    columnWidth={this.getColumnWidth}
                                    estimatedColumnSize={DEFAULT_COLUMN_MIN_WIDTH}
                                    height={computedBodyGridHeight}
                                    ref={this.setBodyGridRef}
                                    onScroll={onScroll}
                                    overscanColumnCount={DEFAULT_OVERSCAN_COLUMN_COUNT}
                                    overscanRowCount={DEFAULT_OVERSCAN_ROW_COUNT}
                                    rowCount={rowCount}
                                    rowHeight={this.getRowHeight}
                                    width={computedBodyGridWidth} />
                              )
                          }

                        </div>
                      </div>
                    )
                  }
                </AutoSizer>
              </DataTableInnerWrapper>
            )
          }
        </ScrollSync>
      </DataTableOuterWrapper>
    );
  }
}

export default AbstractDataTable;
