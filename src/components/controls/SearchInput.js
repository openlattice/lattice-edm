/*
 * @flow
 */

import React from 'react';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const SearchInputWrapper = styled.div`
  color: #113355;
  display: flex;
  height: 40px;
  min-height: 40px;
  min-width: 40px;
  width: 400px;
`;

const Input = styled.input`
  border: 1px solid #c5d5e5;
  border-radius: 4px;
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

// TODO: allow customization and extensibility via styled-components
export default function SearchInput() {

  return (
    <SearchInputWrapper>
      <SearchIcon>
        <FontAwesomeIcon pack="fas" name="search" transform={{ size: 13 }} />
      </SearchIcon>
      <Input placeholder="Search..." />
    </SearchInputWrapper>
  );
}
