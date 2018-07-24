/*
 * @flow
 */

import React from 'react';

import styled, { css } from 'styled-components';
import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List } from 'immutable';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../datatable/AbstractTypeDataTable';
import { filterAbstractTypes } from '../../utils/AbstractTypeUtils';

import type { AbstractType } from '../../utils/AbstractTypes';
import type { AbstractTypeFilterParams } from '../../utils/AbstractTypeUtils';

/*
 * styled components
 */

const SearchableSelectWrapper = styled.div`
  border: none;
  ${({ isVisibleDataTable }) => {
    if (isVisibleDataTable) {
      return css`
        box-shadow: 0 2px 8px -2px rgba(17, 51, 85, 0.15);
      `;
    }
    return '';
  }}
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  border: 1px solid #c5d5e5;
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  height: 50px;
  position: relative;
`;

const SearchInput = styled.input`
  border: none;
  color: #135;
  flex: 1 0 auto;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 24px;
  outline: none;
  padding: 0 20px 0 40px;
  &:focus {
    border-color: #95aabf;
  }
  &::placeholder {
    color: #687F96;
  }
`;

const SearchIcon = styled.div`
  align-self: center;
  color: #687F96;
  position: absolute;
  margin-left: 13px;
`;

const DataTableWrapper = styled.div`
  background-color: #fefefe;
  border: 1px solid #c5d5e5;
  margin-top: -1px; /* - 1 for the bottom border of SearchInputWrapper */
  position: relative;
  width: 100%;
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')}};
`;

/*
 * types
 */

type Props = {
  abstractTypes :List<Map<*, *>>;
  className :string;
  maxHeight :number;
  searchPlaceholder :string;
  workingAbstractTypeType :AbstractType;
  onAbstractTypeSelect :Function;
}

type State = {
  filteredTypes :List<Map<*, *>>;
  isVisibleDataTable :boolean;
  searchQuery :string;
}

class AbstractTypeSearchableSelect extends React.Component<Props, State> {

  static defaultProps = {
    abstractTypes: List(),
    className: '',
    maxHeight: -1,
    searchPlaceholder: 'Search...',
    workingAbstractTypeType: AbstractTypes.PropertyType,
    onAbstractTypeSelect: () => {}
  }

  constructor(props :Props) {

    super(props);

    this.state = {
      filteredTypes: props.abstractTypes,
      isVisibleDataTable: false,
      searchQuery: ''
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    this.setState({
      filteredTypes: nextProps.abstractTypes,
      searchQuery: ''
    });
  }

  hideDataTable = () => {

    this.setState({
      isVisibleDataTable: false,
      searchQuery: ''
    });
  }

  showDataTable = () => {

    this.setState({
      isVisibleDataTable: true,
      searchQuery: ''
    });
  }

  handleOnAbstractTypeSelect = (selectedAbstractTypeId :string) => {

    const { onAbstractTypeSelect } = this.props;

    onAbstractTypeSelect(selectedAbstractTypeId);
    this.setState({
      searchQuery: ''
    });
  }

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {

    const { abstractTypes, workingAbstractTypeType } = this.props;

    const filterParams :AbstractTypeFilterParams = {
      abstractTypes,
      workingAbstractTypeType,
      filterQuery: event.target.value
    };

    this.setState({
      filteredTypes: filterAbstractTypes(filterParams),
      searchQuery: event.target.value
    });
  }

  render() {

    const {
      className,
      maxHeight,
      searchPlaceholder,
      workingAbstractTypeType
    } = this.props;

    const {
      filteredTypes,
      isVisibleDataTable,
      searchQuery
    } = this.state;

    return (
      <SearchableSelectWrapper isVisibleDataTable={isVisibleDataTable} className={className}>
        <SearchInputWrapper>
          <SearchIcon>
            <FontAwesomeIcon icon={faSearch} transform={{ size: 13 }} />
          </SearchIcon>
          <SearchInput
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onBlur={this.hideDataTable}
              onChange={this.handleOnChangeSearchQuery}
              onFocus={this.showDataTable} />
        </SearchInputWrapper>
        {
          !isVisibleDataTable
            ? null
            : (
              <DataTableWrapper isVisible={isVisibleDataTable}>
                <AbstractTypeDataTable
                    abstractTypes={filteredTypes}
                    highlightOnHover
                    maxHeight={maxHeight}
                    workingAbstractTypeType={workingAbstractTypeType}
                    onAbstractTypeSelect={this.handleOnAbstractTypeSelect} />
              </DataTableWrapper>
            )
        }
      </SearchableSelectWrapper>
    );
  }
}

export default AbstractTypeSearchableSelect;
