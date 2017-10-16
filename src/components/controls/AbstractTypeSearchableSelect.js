/*
 * @flow
 */

import React from 'react';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import Immutable from 'immutable';
import styled, { css } from 'styled-components';
import { Models, Types } from 'lattice';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../datatable/AbstractTypeDataTable';
import { filterAbstractTypes } from '../../utils/AbstractTypeUtils';

import type { AbstractType } from '../../utils/AbstractTypes';
import type { AbstractTypeFilterParams } from '../../utils/AbstractTypeUtils';

const {
  FullyQualifiedName,
  EntityType,
  EntityTypeBuilder
} = Models;

const {
  SecurableTypes
} = Types;

/*
 * styled components
 */

const SearchableSelectWrapper = styled.div`
  border: none;
  ${(props) => {
    if (props.isVisibleDataTable) {
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
  visibility: ${(props) => {
    return props.isVisible ? 'visible' : 'hidden';
  }};
`;

/*
 * types
 */

type Props = {
  abstractTypes :List<Map<*, *>>,
  className :string,
  maxHeight :number,
  searchPlaceholder :string,
  workingAbstractTypeType :AbstractType,
  onAbstractTypeSelect :Function
}

type State = {
  filteredTypes :List<Map<*, *>>,
  isVisibleDataTable :boolean,
  searchQuery :string
}

class AbstractTypeSearchableSelect extends React.Component<Props, State> {

  static defaultProps = {
    abstractTypes: Immutable.List(),
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

    this.props.onAbstractTypeSelect(selectedAbstractTypeId);
  }

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {

    const filterParams :AbstractTypeFilterParams = {
      abstractTypes: this.props.abstractTypes,
      filterQuery: event.target.value,
      workingAbstractTypeType: this.props.workingAbstractTypeType
    };

    this.setState({
      filteredTypes: filterAbstractTypes(filterParams)
    });
  }

  render() {

    return (
      <SearchableSelectWrapper isVisibleDataTable={this.state.isVisibleDataTable} className={this.props.className}>
        <SearchInputWrapper>
          <SearchIcon>
            <FontAwesomeIcon pack="fas" name="search" transform={{ size: 13 }} />
          </SearchIcon>
          <SearchInput
              type="text"
              placeholder={this.props.searchPlaceholder}
              onBlur={this.hideDataTable}
              onChange={this.handleOnChangeSearchQuery}
              onFocus={this.showDataTable} />
        </SearchInputWrapper>
        {
          !this.state.isVisibleDataTable
            ? null
            : (
              <DataTableWrapper isVisible={this.state.isVisibleDataTable}>
                <AbstractTypeDataTable
                    abstractTypes={this.state.filteredTypes}
                    maxHeight={this.props.maxHeight}
                    type={this.props.workingAbstractTypeType}
                    onAbstractTypeSelect={this.handleOnAbstractTypeSelect} />
              </DataTableWrapper>
            )
        }
      </SearchableSelectWrapper>
    );
  }
}

export default AbstractTypeSearchableSelect;
