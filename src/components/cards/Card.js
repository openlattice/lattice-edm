/*
 * @flow
 */

import styled from 'styled-components';

const Card = styled.div`
  background-color: #fefefe;
  border: 1px solid #c5d5e5;
  border-radius: 4px;
  box-shadow: 0 2px 8px -2px rgba(17, 51, 85, 0.1);
  display: flex;
  flex-direction: column;
  padding: 30px;
  margin: 0 20px;
`;

const CardTitle = styled.h1`
  flex: 1 0 auto;
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding: 0;
`;

const CardSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const CardSectionTitle = styled.h2`
  flex: 1 0 auto;
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 10px 0;
  padding: 0;
`;

const CardSectionBody = styled.div`
  font-size: 14px;
  font-weight: normal;
  p {
    margin: 0;
    padding: 0;
  }
`;

export {
  Card,
  CardSection,
  CardSectionBody,
  CardSectionTitle,
  CardTitle
};
