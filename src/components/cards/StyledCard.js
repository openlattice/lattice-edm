/*
 * @flow
 */

import styled from 'styled-components';

const StyledCard = styled.div`
  background-color: #fefefe;
  border: 1px solid #c5d5e5;
  border-radius: 4px;
  box-shadow: 0 2px 8px -2px rgba(17, 51, 85, 0.15);
  display: flex;
  flex-direction: column;
  padding: 30px;
  margin: 0 20px;
`;

const StyledCardTitle = styled.h1`
  flex: 1 0 auto;
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding: 0;
`;

const StyledCardSectionTitle = styled.h2`
  flex: 1 0 auto;
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 10px 0;
  padding: 0;
`;

const StyledCardSectionBody = styled.div`
  font-size: 14px;
  font-weight: normal;
  p {
    margin: 0;
    padding: 0;
  }
`;

const StyledCardSectionGroup = styled.div.attrs({
  flexdirection: props => (props.horizontal ? 'row' : 'column')
})`
  display: flex;
  flex-direction: ${props => props.flexdirection};
  section {
    border-left: 1px solid #c5d5e5;
    margin-left: 20px;
    padding-left: 20px;
  }
  section:first-child {
    border-left: none;
    margin-left: 0;
    padding-left: 0;
  }
`;

const StyledCardSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const StyledCardDetail = styled.div`
  display: flex;
  flex-direction: column;
`;

export {
  StyledCard,
  StyledCardDetail,
  StyledCardSection,
  StyledCardSectionBody,
  StyledCardSectionGroup,
  StyledCardSectionTitle,
  StyledCardTitle
};
