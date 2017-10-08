/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Grid, ScrollSync } from 'react-virtualized';

/*
 * constants
 */

const DEFAULT_GRID_MAX_HEIGHT :number = 500;
const DEFAULT_GRID_MAX_WIDTH :number = 500;

const DEFAULT_COLUMN_MAX_WIDTH :number = 500;
const DEFAULT_COLUMN_MIN_WIDTH :number = 100;

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
 * styled components
 */

const DataGridOuterWrapper = styled.div`
  overflow: hidden;
`;

const DataGridInnerWrapper = styled.div``;

const HeadGridWrapper = styled.div`
  border-bottom: 1px solid #516a83;
`;

const BodyGridWrapper = styled.div``;

const HeadGrid = styled(Grid)`
  border: none;
  outline: none;
  overflow: hidden !important; /* hides horizontal scrollbar */
`;

const BodyGrid = styled(Grid)`
  border: none;
  outline: none;
  &:hover {
    cursor: pointer;
  }
`;

const HeadCell = styled.div`
  align-items: center;
  display: flex;
  font-weight: 600;
  padding: ${CELL_PADDING}px;
`;

const BodyCell = styled.div`
  align-items: center;
  border-top: 1px solid #c5d5e5;
  display: flex;
  font-size: 14px;
  margin-top: -1px;
  padding: ${CELL_PADDING}px;
`;

const CellText = styled.p`
  line-height: normal;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/*
 * types
 */

// const SORTING = {
//   ORIG: 0,
//   ASC: 1,
//   DSC: 2
// };

// TODO: define a type for the header object to specifically check its structure:
// type HeaderObject = {
//   id :string,
//   value :string
// };

type GridData = List<Map<string, string>>;
type GridHeaders = List<Map<string, string>>;

type Props = {
  data :GridData,
  headers :GridHeaders,
  height :number,
  maxHeight :number,
  maxWidth :number,
  width :number,
  onRowClick :Function
}

type State = {
  bodyGridHeight :number,
  bodyGridWidth :number,
  columnWidths :Map<number, number>,
  data :GridData,
  headGridHeight :number,
  headGridWidth :number,
  headers :GridHeaders
}

class AbstractDataTable extends React.Component<Props, State> {

  headGrid :?Grid;
  bodyGrid :?Grid;

  static defaultProps = {
    data: Immutable.List(),
    headers: Immutable.List(),
    height: 0,
    maxHeight: DEFAULT_GRID_MAX_HEIGHT,
    maxWidth: DEFAULT_GRID_MAX_WIDTH,
    width: 0,
    onRowClick: () => {}
  };

  constructor(props :Props) {

    super(props);

    const dimensions :Object = AbstractDataTable.computeDimensions(props);

    this.state = {
      data: props.data,
      headers: props.headers,
      ...dimensions
    };
  }

  static measureTextWidth(text :string) :number {

    return Math.ceil(CANVAS_CONTEXT.measureText(text).width);
  }

  static computeColumnWidths(headers :GridHeaders, data :GridData) :Map<number, number> {

    return Immutable.OrderedMap().withMutations((map :OrderedMap<number, number>) => {

      // iterate through the headers, column by column, and compute an estimated width for each column
      headers.forEach((header :Map<string, string>, columnIndex :number) => {

        // find the widest cell in the column
        let columnWidth :number = 0;

        data.forEach((row :Map<string, string>) => {
          // keeping it simple for now
          const cellValue :string = row.get(header.get('id', ''), '');
          const cellWidth :number = AbstractDataTable.measureTextWidth(cellValue);
          if (cellWidth > columnWidth) {
            columnWidth = cellWidth;
          }
        });

        // compare the header cell width with the widest cell in the table
        const headerCellWidth :number = AbstractDataTable.measureTextWidth(header.get('value', ''));
        columnWidth = (headerCellWidth > columnWidth) ? headerCellWidth : columnWidth;

        // account for extra width due to style: left padding, right padding
        let columnWidthInPixels :number = columnWidth + (2 * CELL_PADDING);

        // ensure column will have a minimum width
        if (columnWidthInPixels < DEFAULT_COLUMN_MIN_WIDTH) {
          columnWidthInPixels = DEFAULT_COLUMN_MIN_WIDTH;
        }
        // ensure column will have a maximum width
        else if (columnWidthInPixels > DEFAULT_COLUMN_MAX_WIDTH) {
          columnWidthInPixels = DEFAULT_COLUMN_MAX_WIDTH;
        }

        // store the computed column width. empty columns will not be rendered
        map.set(columnIndex, columnWidthInPixels);
      });
    });
  }

  static computeDimensions(props :Props) :Object {

    const rowCount :number = props.data.size;

    let columnWidths :Map<number, number> = AbstractDataTable.computeColumnWidths(props.headers, props.data);
    const totalWidth :number = columnWidths.reduce(
      (widthSum :number, columnWidth :number) :number => {
        return widthSum + columnWidth;
      },
      0
    );

    let visibleWidth :number = (props.width > 0) ? props.width : totalWidth;
    if (visibleWidth > props.maxWidth) {
      visibleWidth = props.maxWidth;
    }

    const headGridHeight :number = DEFAULT_ROW_MIN_HEIGHT;
    const headGridWidth :number = visibleWidth;

    const totalHeight :number = headGridHeight + (rowCount * DEFAULT_ROW_MIN_HEIGHT);
    let visibleHeight :number = (props.height > 0) ? props.height : totalHeight;
    if (visibleHeight > props.maxHeight) {
      visibleHeight = props.maxHeight;
    }

    const bodyGridHeight :number = visibleHeight - headGridHeight;
    const bodyGridWidth :number = visibleWidth;

    if (totalWidth < visibleWidth) {
      const lastColumnIndex :number = columnWidths.size - 1;
      const lastColumnWidth :number = columnWidths.get(lastColumnIndex, 0);
      const differenceInWidth :number = visibleWidth - totalWidth;
      columnWidths = columnWidths.set(lastColumnIndex, lastColumnWidth + differenceInWidth);
    }

    return {
      columnWidths,
      headGridHeight,
      headGridWidth,
      bodyGridHeight,
      bodyGridWidth
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    const nextHeaders :GridHeaders = nextProps.headers;
    const nextData :GridData = nextProps.data;

    const haveHeadersChanged :boolean = !this.props.headers.equals(nextHeaders);
    const hasDataChanged :boolean = !this.props.data.equals(nextData);

    if (haveHeadersChanged || hasDataChanged) {

      const dimensions :Object = AbstractDataTable.computeDimensions(nextProps);

      this.setState({
        data: nextData,
        headers: nextHeaders,
        ...dimensions
      });
    }
  }

  componentWillUpdate(nextProps :Props, nextState :State) {

    const headGrid :?Grid = this.headGrid;
    const bodyGrid :?Grid = this.bodyGrid;

    const haveHeadersChanged :boolean = !this.state.headers.equals(nextState.headers);
    const hasDataChanged :boolean = !this.state.data.equals(nextState.data);
    const haveColumnWidthsChanged :boolean = !this.state.columnWidths.equals(nextState.columnWidths);

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

  setBodyGridRef = (bodyGridRef :any) :void => {

    this.bodyGrid = bodyGridRef;
  }

  isLastColumn = (columnIndex :number) :boolean => {
    return columnIndex + 1 === this.state.columnWidths.size;
  }

  getColumnWidth = (params :Object) :number => {

    return this.state.columnWidths.get(params.index, DEFAULT_COLUMN_MIN_WIDTH);
  }

  getRowHeight = () :number => {

    return DEFAULT_ROW_MIN_HEIGHT; // TODO: implement more intelligently
  }

  getCellValue = (rowIndex :number, columnIndex :number) :string => {

    // keeping it simple
    // TODO: handle various cell value types (string, number, array, object, etc.)
    const header :string = this.state.headers.getIn([columnIndex, 'id']);
    return this.state.data.getIn([rowIndex, header], '');
  }

  renderHeadCell = (params :Object) => {

    const cellValue :string = this.props.headers.getIn([params.columnIndex, 'value']);

    return (
      <HeadCell
          key={params.key}
          style={params.style}>
        <CellText>{ cellValue }</CellText>
      </HeadCell>
    );
  }

  renderBodyCell = (params :Object) => {

    // TODO: handle hover effects

    // const setState = this.setState.bind(this);
    const cellValue :string = this.getCellValue(params.rowIndex, params.columnIndex);

    return (
      <BodyCell
          key={params.key}
          style={params.style}
          onClick={() => {
            // setState({ selectedRowIndex: params.rowIndex });
            // params.parent.forceUpdate();
            this.props.onRowClick(params.rowIndex, this.state.data.get(params.rowIndex));
          }}>
        <CellText>{ cellValue }</CellText>
      </BodyCell>
    );
  }

  render() {

    const columnCount :number = this.props.headers.size;
    const rowCount :number = this.state.data.size;

    if (columnCount === 0 || rowCount === 0) {
      // TODO: need a better design for no data
      return null;
    }

    return (
      <DataGridOuterWrapper>
        <ScrollSync>
          {
            ({ onScroll, scrollLeft }) => {
              return (
                <DataGridInnerWrapper>
                  <HeadGridWrapper>
                    <HeadGrid
                        cellRenderer={this.renderHeadCell}
                        columnCount={columnCount}
                        columnWidth={this.getColumnWidth}
                        estimatedColumnSize={DEFAULT_COLUMN_MIN_WIDTH}
                        height={this.state.headGridHeight}
                        innerRef={this.setHeadGridRef}
                        overscanColumnCount={DEFAULT_OVERSCAN_COLUMN_COUNT}
                        overscanRowCount={DEFAULT_OVERSCAN_ROW_COUNT}
                        rowHeight={DEFAULT_ROW_MIN_HEIGHT}
                        rowCount={1}
                        scrollLeft={scrollLeft}
                        width={this.state.headGridWidth} />
                  </HeadGridWrapper>
                  <BodyGridWrapper>
                    <BodyGrid
                        cellRenderer={this.renderBodyCell}
                        columnCount={columnCount}
                        columnWidth={this.getColumnWidth}
                        estimatedColumnSize={DEFAULT_COLUMN_MIN_WIDTH}
                        height={this.state.bodyGridHeight}
                        innerRef={this.setBodyGridRef}
                        onScroll={onScroll}
                        overscanColumnCount={DEFAULT_OVERSCAN_COLUMN_COUNT}
                        overscanRowCount={DEFAULT_OVERSCAN_ROW_COUNT}
                        rowCount={rowCount}
                        rowHeight={this.getRowHeight}
                        width={this.state.bodyGridWidth} />
                  </BodyGridWrapper>
                </DataGridInnerWrapper>
              );
            }
          }
        </ScrollSync>
      </DataGridOuterWrapper>
    );
  }
}

export default AbstractDataTable;
