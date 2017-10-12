/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { AutoSizer, Grid, ScrollSync } from 'react-virtualized';

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
  border-bottom: 1px solid #516a83;
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
  autosizerHeight :number,
  autosizerWidth :number,
  columnWidths :Map<number, number>,
  computedBodyGridHeight :number,
  computedBodyGridWidth :number,
  computedHeadGridHeight :number,
  computedHeadGridWidth :number
}

/*
 * TODO: implement filtering
 * TODO: allow configuration over dimensions & resizing
 */
class AbstractDataTable extends React.Component<Props, State> {

  headGrid :?Grid;
  bodyGrid :?Grid;

  static defaultProps = {
    data: Immutable.List(),
    headers: Immutable.List(),
    height: -1,
    maxHeight: -1,
    maxWidth: -1,
    width: -1,
    onRowClick: () => {}
  };

  constructor(props :Props) {

    super(props);

    // const dimensions :Object = AbstractDataTable.computeDimensions({
    //   autosizerHeight: 0,
    //   autosizerWidth: 0,
    //   data: props.data,
    //   headers: props.headers,
    //   specifiedMaxHeight: props.maxHeight,
    //   specifiedMaxWidth: props.maxWidth,
    //   specifiedHeight: props.height,
    //   specifiedWidth: props.width
    // });

    // console.log(dimensions);

    this.state = {
      autosizerHeight: 0,
      autosizerWidth: 0,
      columnWidths: Immutable.Map(),
      computedBodyGridHeight: 0,
      computedBodyGridWidth: 0,
      computedHeadGridHeight: 0,
      computedHeadGridWidth: 0,
      // ...dimensions
    };
  }

  static measureTextWidth(text :string) :number {

    return Math.ceil(CANVAS_CONTEXT.measureText(text).width);
  }

  static computeColumnWidths(params :Object) :Map<number, number> {

    return Immutable.OrderedMap().withMutations((map :OrderedMap<number, number>) => {

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

  static computeDimensions(params :Object) :Object {

    const rowCount :number = params.data.size;

    let columnWidths :Map<number, number> = AbstractDataTable.computeColumnWidths(params);
    const totalWidth :number = columnWidths.reduce(
      (widthSum :number, columnWidth :number) :number => {
        return widthSum + columnWidth;
      },
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

  componentWillReceiveProps(nextProps :Props) {

    const nextHeaders :GridHeaders = nextProps.headers;
    const nextData :GridData = nextProps.data;

    const haveHeadersChanged :boolean = !this.props.headers.equals(nextHeaders);
    const hasDataChanged :boolean = !this.props.data.equals(nextData);

    if (haveHeadersChanged || hasDataChanged) {

      const newDimensions :Object = AbstractDataTable.computeDimensions({
        autosizerHeight: this.state.autosizerHeight,
        autosizerWidth: this.state.autosizerWidth,
        data: nextData,
        headers: nextHeaders,
        specifiedMaxHeight: nextProps.maxHeight,
        specifiedMaxWidth: nextProps.maxWidth,
        specifiedHeight: nextProps.height,
        specifiedWidth: nextProps.width
      });

      this.setState({
        ...newDimensions
      });
    }
  }

  componentWillUpdate(nextProps :Props, nextState :State) {

    const headGrid :?Grid = this.headGrid;
    const bodyGrid :?Grid = this.bodyGrid;

    const haveHeadersChanged :boolean = !this.props.headers.equals(nextProps.headers);
    const hasDataChanged :boolean = !this.props.data.equals(nextProps.data);
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
    const header :string = this.props.headers.getIn([columnIndex, 'id']);
    return this.props.data.getIn([rowIndex, header], '');
  }

  onAutoSizerResize = (params :Object) => {

    const newDimensions :Object = AbstractDataTable.computeDimensions({
      autosizerHeight: params.height,
      autosizerWidth: params.width,
      data: this.props.data,
      headers: this.props.headers,
      specifiedMaxHeight: this.props.maxHeight,
      specifiedMaxWidth: this.props.maxWidth,
      specifiedHeight: this.props.height,
      specifiedWidth: this.props.width
    });

    this.setState({
      autosizerHeight: params.height,
      autosizerWidth: params.width,
      ...newDimensions
    });
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
            this.props.onRowClick(params.rowIndex, this.props.data.get(params.rowIndex));
          }}>
        <CellText>{ cellValue }</CellText>
      </BodyCell>
    );
  }

  render() {

    const columnCount :number = this.props.headers.size;
    const rowCount :number = this.props.data.size;

    if (columnCount === 0 || rowCount === 0) {
      // TODO: need a better design for no data
      return null;
    }

    return (
      <DataTableOuterWrapper /* innerRef={this.setOuterWrapperRef} */>
        <ScrollSync>
          {
            ({ onScroll, scrollLeft }) => {
              return (
                <DataTableInnerWrapper>
                  <AutoSizer disableHeight onResize={this.onAutoSizerResize}>
                    {
                      ({ height, width }) => {
                        // if (height !== (this.state.computedHeadGridHeight + this.state.computedBodyGridHeight)
                        //     || width !== this.state.computedHeadGridWidth
                        //     || width !== this.state.computedBodyGridWidth) {
                        //   return null;
                        // }
                        return (
                          <div>
                            <div>
                              <HeadGrid
                                  cellRenderer={this.renderHeadCell}
                                  columnCount={columnCount}
                                  columnWidth={this.getColumnWidth}
                                  estimatedColumnSize={DEFAULT_COLUMN_MIN_WIDTH}
                                  height={this.state.computedHeadGridHeight}
                                  innerRef={this.setHeadGridRef}
                                  overscanColumnCount={DEFAULT_OVERSCAN_COLUMN_COUNT}
                                  overscanRowCount={DEFAULT_OVERSCAN_ROW_COUNT}
                                  rowHeight={DEFAULT_ROW_MIN_HEIGHT}
                                  rowCount={1}
                                  scrollLeft={scrollLeft}
                                  width={this.state.computedHeadGridWidth} />
                            </div>
                            <div>
                              <BodyGrid
                                  cellRenderer={this.renderBodyCell}
                                  columnCount={columnCount}
                                  columnWidth={this.getColumnWidth}
                                  estimatedColumnSize={DEFAULT_COLUMN_MIN_WIDTH}
                                  height={this.state.computedBodyGridHeight}
                                  innerRef={this.setBodyGridRef}
                                  onScroll={onScroll}
                                  overscanColumnCount={DEFAULT_OVERSCAN_COLUMN_COUNT}
                                  overscanRowCount={DEFAULT_OVERSCAN_ROW_COUNT}
                                  rowCount={rowCount}
                                  rowHeight={this.getRowHeight}
                                  width={this.state.computedBodyGridWidth} />
                            </div>
                          </div>
                        );
                      }
                    }
                  </AutoSizer>
                </DataTableInnerWrapper>
              );
            }
          }
        </ScrollSync>
      </DataTableOuterWrapper>
    );
  }
}

export default AbstractDataTable;
